# Documentación de API

Este documento describe los endpoints para los servicios de Backend y de Predicción.

## Backend API (Java - Spring Boot)

La URL base para este servicio es `http://localhost:8080`.

---

### Autenticación

#### Iniciar Sesión

- **Endpoint:** `POST /auth/login`
- **Descripción:** Autentica a un usuario y devuelve un token si las credenciales son correctas.
- **Ejemplo de Body:**
  ```json
  {
    "username": "nombredeusuario",
    "password": "password"
  }
  ```

---

### Artículos

#### Obtener todos los artículos

- **Endpoint:** `GET /articulos`
- **Descripción:** Devuelve una lista de todos los artículos disponibles.

#### Obtener artículo por ID

- **Endpoint:** `GET /articulos/{id}`
- **Descripción:** Devuelve un artículo específico según su ID.
- **Parámetros de URL:**
  - `id` (integer): El ID del artículo a obtener.

#### Crear un nuevo artículo

- **Endpoint:** `POST /articulos`
- **Descripción:** Crea un nuevo artículo.
- **Ejemplo de Body:**
  ```json
  {
    "nombre": "Proyector",
    "descripcion": "Proyector de alta definición"
  }
  ```

#### Actualizar un artículo

- **Endpoint:** `PUT /articulos/{id}`
- **Descripción:** Actualiza un artículo existente.
- **Parámetros de URL:**
  - `id` (integer): El ID del artículo a actualizar.
- **Ejemplo de Body:**
  ```json
  {
    "nombre": "Proyector 4K",
    "descripcion": "Proyector de ultra alta definición"
  }
  ```

#### Eliminar un artículo

- **Endpoint:** `DELETE /articulos/{id}`
- **Descripción:** Elimina un artículo por su ID.
- **Parámetros de URL:**
  - `id` (integer): El ID del artículo a eliminar.

---

### Personas

#### Obtener todas las personas

- **Endpoint:** `GET /personas`
- **Descripción:** Devuelve una lista de todas las personas.

#### Obtener persona por ID

- **Endpoint:** `GET /personas/{id}`
- **Descripción:** Devuelve una persona específica según su ID.
- **Parámetros de URL:**
  - `id` (integer): El ID de la persona a obtener.

#### Crear una nueva persona

- **Endpoint:** `POST /personas`
- **Descripción:** Crea una nueva persona (usuario).
- **Ejemplo de Body:**
  ```json
  {
    "nombre": "Juan",
    "apellido": "Perez",
    "username": "jperez",
    "password": "password123"
  }
  ```

#### Actualizar una persona

- **Endpoint:** `PUT /personas/{id}`
- **Descripción:** Actualiza los datos de una persona.
- **Parámetros de URL:**
  - `id` (integer): El ID de la persona a actualizar.
- **Ejemplo de Body:**
  ```json
  {
    "nombre": "Juan Ignacio",
    "apellido": "Perez",
    "username": "jperez",
    "password": "newpassword123"
  }
  ```

#### Eliminar una persona

- **Endpoint:** `DELETE /personas/{id}`
- **Descripción:** Elimina una persona por su ID.
- **Parámetros de URL:**
  - `id` (integer): El ID de la persona a eliminar.

---

### Salas

#### Obtener todas las salas

- **Endpoint:** `GET /salas`
- **Descripción:** Devuelve una lista de todas las salas.

#### Obtener sala por ID

- **Endpoint:** `GET /salas/{id}`
- **Descripción:** Devuelve una sala específica según su ID.
- **Parámetros de URL:**
  - `id` (integer): El ID de la sala a obtener.

#### Crear una nueva sala

- **Endpoint:** `POST /salas`
- **Descripción:** Crea una nueva sala.
- **Ejemplo de Body:**
  ```json
  {
    "nombre": "Sala de Reuniones A",
    "capacidad": 10
  }
  ```

#### Actualizar una sala

- **Endpoint:** `PUT /salas/{id}`
- **Descripción:** Actualiza una sala existente.
- **Parámetros de URL:**
  - `id` (integer): El ID de la sala a actualizar.
- **Ejemplo de Body:**
  ```json
  {
    "nombre": "Sala de Conferencias A",
    "capacidad": 15
  }
  ```

#### Eliminar una sala

- **Endpoint:** `DELETE /salas/{id}`
- **Descripción:** Elimina una sala por su ID.
- **Parámetros de URL:**
  - `id` (integer): El ID de la sala a eliminar.

---

### Reservas

#### Obtener todas las reservas

- **Endpoint:** `GET /reservas`
- **Descripción:** Devuelve una lista de todas las reservas.

#### Obtener reserva por ID

- **Endpoint:** `GET /reservas/{id}`
- **Descripción:** Devuelve una reserva específica según su ID.
- **Parámetros de URL:**
  - `id` (integer): El ID de la reserva a obtener.

#### Crear una nueva reserva

- **Endpoint:** `POST /reservas`
- **Descripción:** Crea una nueva reserva.
- **Ejemplo de Body:**
  ```json
  {
    "sala": { "id": 1 },
    "persona": { "id": 1 },
    "fecha": "2024-11-20T10:00:00",
    "duracion": 60,
    "articulos": [{ "id": 1 }]
  }
  ```

#### Actualizar una reserva

- **Endpoint:** `PUT /reservas/{id}`
- **Descripción:** Actualiza una reserva existente.
- **Parámetros de URL:**
  - `id` (integer): El ID de la reserva a actualizar.
- **Ejemplo de Body:**
  ```json
  {
    "fecha": "2024-11-20T11:00:00",
    "duracion": 90
  }
  ```

#### Eliminar una reserva

- **Endpoint:** `DELETE /reservas/{id}`
- **Descripción:** Elimina una reserva por su ID.
- **Parámetros de URL:**
  - `id` (integer): El ID de la reserva a eliminar.

## Prediction Service API (Python - FastAPI)

La URL base para este servicio es `http://localhost:5000`.

---

### Predicciones

#### Obtener Predicciones

- **Endpoint:** `GET /predict`
- **Descripción:** Genera predicciones de ocupación o demanda basadas en los datos de reservas.
- **Parámetros de Query:**
  - `type` (string, opcional): Tipo de predicción. Puede ser "by_day" (por defecto) o "by_hour".
  - `sala_id` (integer, opcional): ID de la sala para la cual se desea la predicción.
  - `articulo_id` (integer, opcional): ID del artículo para el cual se desea la predicción.
- **Ejemplo de Uso:**
  - Predicción general por día: `GET /predict?type=by_day`
  - Predicción por día para la Sala ID 1: `GET /predict?type=by_day&sala_id=1`
  - Predicción por hora para la Sala ID 1: `GET /predict?type=by_hour&sala_id=1`
  - Predicción por día para el Artículo ID 1: `GET /predict?type=by_day&articulo_id=1`
