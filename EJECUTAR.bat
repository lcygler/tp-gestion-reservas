@echo off
:: ==================================================
:: SCRIPT DE INICIO AUTOMATICO - TP FINAL PV
:: Windows (PowerShell + CMD)
:: Configura JAVA_HOME automaticamente
:: Instala dependencias Python y levanta:
:: 1. Backend (Spring Boot) -> puerto 8080
:: 2. Prediction Service (FastAPI) -> puerto 5000
:: 3. Frontend (http.server) -> puerto 8000
:: Abre automaticamente el navegador en login.html
:: ==================================================
:: CONFIGURACION (ajusta aqui si es necesario)
set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "PREDICTION_DIR=%PROJECT_ROOT%prediction_service"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"
set "PYTHON_CMD=python"
set "BROWSER_URL=http://localhost:8000/login.html"
set "DEFAULT_JDK_PATH=C:\Program Files\Java\jdk-17"
:: ==================================================

echo [1/6] Verificando Java...
set "JAVA_HOME=%DEFAULT_JDK_PATH%"
set "JAVA_HOME=%JAVA_HOME:"=%" :: Eliminar comillas
for /f "tokens=*" %%A in ("%JAVA_HOME%") do set "JAVA_HOME=%%A" :: Eliminar espacios iniciales y finales
if not exist "%JAVA_HOME%\bin\java.exe" (
    echo [ERROR] No existe java.exe en:
    echo %JAVA_HOME%\bin\java.exe
    echo Verifica que JDK 17 este instalado en esa ruta.
    pause
    exit /b 1
)
echo [OK] JAVA_HOME = %JAVA_HOME%

echo.
echo [2/6] Verificando Python...
%PYTHON_CMD% --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no esta instalado o no esta en PATH.
    echo Descargalo desde: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python detectado.

echo.
echo [3/6] Instalando dependencias de Python...
cd /d "%PREDICTION_DIR%"
%PYTHON_CMD% -m pip install --upgrade pip >nul
%PYTHON_CMD% -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la instalacion de dependencias Python.
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas.

echo.
echo [4/6] Iniciando Backend (Spring Boot - puerto 8080)...
start "Backend - Spring Boot" cmd /k "set \"JAVA_HOME=%JAVA_HOME%\" && cd /d %BACKEND_DIR% && .\\mvnw.cmd spring-boot:run"
:: Esperar a que el backend arranque
echo Esperando que el backend este listo...
set attempts=0
:wait_backend
timeout /t 3 >nul
curl -s http://localhost:8080/api/reservas >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend listo en http://localhost:8080
    goto :backend_ok
)
set /a attempts+=1
if %attempts% geq 20 (
    echo [ERROR] Backend no responde tras 60 segundos.
    echo    Revisa la ventana del backend para ver el error.
    pause
    exit /b 1
)
goto :wait_backend
:backend_ok
echo.

echo [5/6] Iniciando Servicio de Prediccion (FastAPI - puerto 5000)...
start "Prediction Service" cmd /k "cd /d %PREDICTION_DIR% && %PYTHON_CMD% -m uvicorn app.main:app --host 0.0.0.0 --port 5000"
:: Esperar a que el servicio de prediccion arranque
echo Esperando que el servicio de prediccion este listo...
set attempts2=0
:wait_prediction
timeout /t 2 >nul
curl -s http://localhost:5000/docs >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Servicio de prediccion listo en http://localhost:5000
    goto :prediction_ok
)
set /a attempts2+=1
if %attempts2% geq 15 (
    echo [ERROR] Servicio de prediccion no responde.
    echo    Revisa la ventana del servicio para ver el error.
    pause
    exit /b 1
)
goto :wait_prediction
:prediction_ok
echo.

echo [6/6] Iniciando Frontend (http.server - puerto 8000)...
start "Frontend" cmd /k "cd /d %FRONTEND_DIR% && %PYTHON_CMD% -m http.server 8000"
:: Esperar un poco y abrir navegador
timeout /t 3 >nul
echo.
echo [OK] Abriendo navegador...
start "" "%BROWSER_URL%"
echo.
echo ================================================
echo TODOS LOS SERVICIOS INICIADOS
echo - Backend: http://localhost:8080
echo - Prediccion: http://localhost:5000
echo - Frontend: %BROWSER_URL%
echo.
echo Para detener: cierra las ventanas de consola.
echo ================================================
pause
