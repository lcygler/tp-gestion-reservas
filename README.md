# Plataforma de Gestión de Reservas

## Equipo de Desarrollo

- Abel Correa
- Ernesto García
- Leandro Cygler
- Marcos Castillo
- Pedro Esteban Gómez Villamayor

## Descripción del Proyecto

Este proyecto implementa una plataforma de gestión de reservas, desarrollada como un MVP (Producto Mínimo Viable) para la asignatura "Programación de Vanguardia". El sistema permite gestionar salas, artículos y reservas, con un sistema de autenticación y autorización basado en roles, y un módulo de predicción simple.

La aplicación está estructurada como un monorepo que contiene tres servicios principales:
*   **Backend (Java/Spring Boot):** Provee la API RESTful para la gestión de datos.
*   **Frontend (HTML/JS/Bootstrap):** La interfaz de usuario que consume la API del backend.
*   **Servicio de Predicción (Python/FastAPI):** Un microservicio que analiza datos de reservas y genera predicciones.

## Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu sistema:

*   **Java Development Kit (JDK) 17:** Necesario para compilar y ejecutar el backend de Spring Boot.
    *   Asegúrate de tener la variable de entorno `JAVA_HOME` configurada y apuntando a tu instalación de JDK 17.
*   **Python 3.x:** (Se recomienda 3.8 o superior) Necesario para el servicio de predicción y para levantar el servidor HTTP del frontend.
    *   Asegúrate de que `python` y `pip` estén disponibles en tu `PATH`.
*   **Maven:** No es estrictamente necesario tenerlo instalado globalmente, ya que el proyecto utiliza el Maven Wrapper (`mvnw`).
*   **Navegador Web Moderno:** Para acceder al frontend (Chrome, Firefox, Edge, etc.).

## Estructura del Proyecto

```
tp-final-pv/
├── backend/                  # Aplicación Java Spring Boot
│   ├── src/
│   ├── .mvn/                 # Maven Wrapper
│   ├── mvnw                  # Script Maven Wrapper (Linux/macOS)
│   ├── mvnw.cmd              # Script Maven Wrapper (Windows)
│   └── pom.xml               # Configuración del proyecto Maven
│
├── frontend/                 # Archivos estáticos (HTML, JS, CSS)
│   ├── css/
│   ├── js/
│   ├── img/
│   ├── index.html
│   ├── login.html
│   ├── salas.html
│   ├── articulos.html
│   ├── reservas.html
│   ├── editar-reserva.html
│   ├── usuarios.html
│   └── monitor.html
│
└── prediction_service/       # Servicio de predicción Python FastAPI
    ├── app/
    │   └── main.py
    └── requirements.txt      # Dependencias de Python
```

## Instalación de Dependencias

### 1. Backend (Java/Spring Boot)

Las dependencias de Maven se descargarán automáticamente la primera vez que ejecutes el proyecto. No necesitas hacer nada manual aquí.

### 2. Servicio de Predicción (Python/FastAPI)

1.  Abre una terminal y navega al directorio `prediction_service`:
    ```powershell
    cd prediction_service
    ```
2.  Instala las dependencias de Python:
    ```powershell
    pip install -r requirements.txt
    ```

### 3. Frontend (HTML/JS/Bootstrap)

No requiere instalación de dependencias, ya que utiliza Bootstrap y Chart.js a través de CDN.

## Cómo Levantar los Proyectos

Para que la aplicación funcione completamente, necesitas iniciar los tres servicios en terminales separadas.

### Paso 1: Iniciar el Backend (Java/Spring Boot)

1.  Abre una terminal (ej. PowerShell).
2.  Navega al directorio `backend`:
    ```powershell
    cd backend
    ```
3.  **Configura `JAVA_HOME` para la sesión actual** (ajusta la ruta a tu instalación de JDK 17):
    ```powershell
    $env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
    ```
4.  Inicia la aplicación Spring Boot usando el Maven Wrapper:
    ```powershell
    .\mvnw.cmd spring-boot:run
    ```
    Espera a ver un mensaje como `Tomcat started on port(s): 8080 (http)` antes de continuar. Mantén esta terminal abierta.

### Paso 2: Iniciar el Servicio de Predicción (Python/FastAPI)

1.  Abre una **segunda terminal** separada.
2.  Navega al directorio `prediction_service`:
    ```powershell
    cd prediction_service
    ```
3.  Inicia el servidor Uvicorn para FastAPI:
    ```powershell
    python -m uvicorn app.main:app --host 0.0.0.0 --port 5000
    ```
    Espera a ver un mensaje como `Uvicorn running on http://0.0.0.0:5000` antes de continuar. Mantén esta terminal abierta.

### Paso 3: Iniciar el Frontend (Servidor HTTP Estático)

1.  Abre una **tercera terminal** separada.
2.  Navega al directorio `frontend`:
    ```powershell
    cd frontend
    ```
3.  Inicia un servidor HTTP simple de Python para servir los archivos estáticos:
    ```powershell
    python -m http.server 8000
    ```
    Mantén esta terminal abierta.

### Paso 4: Acceder a la Aplicación

1.  Abre tu navegador web.
2.  Ve a la siguiente dirección para acceder a la página de login:
    [http://localhost:8000/login.html](http://localhost:8000/login.html)

## Credenciales de Prueba

Puedes usar las siguientes credenciales para iniciar sesión:

*   **Administrador (ADMIN):**
    *   Email: `ana.perez@organizacion.com`
    *   Contraseña: `admin123`
*   **Usuario Normal (USER):**
    *   Email: `juan.gomez@organizacion.com`
    *   Contraseña: `user123`

## Notas Importantes

*   **Seguridad del Login:** El sistema de autenticación implementado es una simulación para fines de MVP y **no es seguro para entornos de producción**. Las contraseñas se almacenan y comparan en texto plano. En un sistema real, se usaría un framework de seguridad robusto (como Spring Security) y las contraseñas se hashearían.
*   **Datos Iniciales:** La base de datos H2 se inicializa con datos de ejemplo al arrancar el backend, incluyendo usuarios, salas, artículos y reservas.
