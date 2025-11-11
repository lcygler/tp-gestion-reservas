from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from datetime import datetime, timedelta
from collections import Counter
from typing import Optional
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import numpy as np

app = FastAPI(
    title="Servicio de Predicción de Reservas",
    description="Un servicio que analiza datos de reservas y genera predicciones usando un modelo ARIMA.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"]
)

RESERVAS_API_URL = "http://localhost:8080/api/reservas"
PREDICTION_STEPS = 7  # Predecir los próximos 7 días

def _prepare_timeseries(reservas: list, period: str) -> pd.Series:
    """Convierte la lista de reservas en una serie temporal de pandas."""
    if not reservas:
        return pd.Series([], dtype='float64')

    try:
        dates = [datetime.fromisoformat(r['fechaHoraInicio']) for r in reservas]
        df = pd.DataFrame(dates, columns=['timestamp'])
        df.set_index('timestamp', inplace=True)
        
        # Contar ocurrencias por período
        ts = df.resample(period).size()
        
        # Asegurarse de que todos los períodos en el rango están presentes
        if not ts.empty:
            full_range = pd.date_range(start=ts.index.min(), end=ts.index.max(), freq=period)
            ts = ts.reindex(full_range, fill_value=0)

        return ts.astype(float)
    except (ValueError, KeyError):
        return pd.Series([], dtype='float64')

def _generate_arima_prediction(ts: pd.Series, period: str):
    """
    Genera una predicción ARIMA si hay suficientes datos; de lo contrario, devuelve solo el histórico.
    """
    date_format = "%Y-%m-%d %H:%M" if period == 'H' else "%Y-%m-%d"

    if ts.empty:
        return {
            "historical_labels": [], "historical_data": [],
            "predicted_labels": [], "predicted_data": [],
            "conf_int_lower": [], "conf_int_upper": [],
            "title_note": "(No hay datos para mostrar)"
        }

    if len(ts) < 4:
        return {
            "historical_labels": ts.index.strftime(date_format).tolist(),
            "historical_data": ts.values.tolist(),
            "predicted_labels": [],
            "predicted_data": [],
            "conf_int_lower": [],
            "conf_int_upper": [],
            "title_note": "(Datos insuficientes para predicción)"
        }

    order = (2, 1, 1)

    if len(ts) < 10:
        order = (1, 1, 0)

    seasonal_order = (0, 0, 0, 0) # Desactivado por simplicidad

    try:
        model = ARIMA(ts, order=order, seasonal_order=seasonal_order)
        results = model.fit()
        
        forecast = results.get_forecast(steps=PREDICTION_STEPS)
        predicted_mean = forecast.predicted_mean
        conf_int = forecast.conf_int()

        # future_labels = pd.date_range(start=ts.index[-1] + pd.Timedelta(hours=1 if period == 'H' else 1, unit='H' if period == 'H' else 'D'), periods=PREDICTION_STEPS, freq=period)
        next_start = ts.index[-1] + (pd.Timedelta(hours=1) if period == 'H' else pd.Timedelta(days=1)) # Evitar duplicar el último día/hora histórico
        future_labels = pd.date_range(start=next_start, periods=PREDICTION_STEPS, freq=period)

        return {
            "historical_labels": ts.index.strftime(date_format).tolist(),
            "historical_data": ts.values.tolist(),
            "predicted_labels": future_labels.strftime(date_format).tolist(),
            "predicted_data": predicted_mean.values.tolist(),
            "conf_int_lower": conf_int.iloc[:, 0].clip(0).values.tolist(), # No permitir predicciones negativas
            "conf_int_upper": conf_int.iloc[:, 1].values.tolist(),
            "title_note": "(Predicción ARIMA)"
        }

    except Exception as e:
        # Si ARIMA falla, devolver solo los datos históricos
        return {
            "historical_labels": ts.index.strftime(date_format).tolist(),
            "historical_data": ts.values.tolist(),
            "predicted_labels": [], "predicted_data": [],
            "conf_int_lower": [], "conf_int_upper": [],
            "title_note": f"(Error en modelo: {e})"
        }

@app.get("/predict")
def predict_reservations(type: str = "by_day", sala_id: Optional[int] = None, articulo_id: Optional[int] = None):
    try:
        response = requests.get(RESERVAS_API_URL)
        response.raise_for_status()
        reservas = response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"No se pudo comunicar con el servicio de reservas: {e}")

    # Filtrar reservas si se especifica un ID
    filtered_reservas = reservas
    title_suffix = "General"
    if sala_id is not None:
        filtered_reservas = [r for r in reservas if r.get('sala') and r['sala']['id'] == sala_id]
        title_suffix = f"para la Sala ID {sala_id}"
    elif articulo_id is not None:
        filtered_reservas = [r for r in reservas if r.get('articulo') and r['articulo']['id'] == articulo_id]
        title_suffix = f"para el Artículo ID {articulo_id}"

    # Determinar el período para la serie temporal
    period = 'H' if type == "by_hour" else 'D'
    
    # Preparar la serie temporal
    ts = _prepare_timeseries(filtered_reservas, period=period)

    # Generar predicción
    prediction_data = _generate_arima_prediction(ts, period=period)

    # Añadir título dinámico
    time_unit = "por Hora" if period == 'H' else "por Día"
    title_note = prediction_data.pop("title_note", "")
    prediction_data["title"] = f"Análisis de Reservas {time_unit}"
    prediction_data["title_note"] = title_note

    return prediction_data
