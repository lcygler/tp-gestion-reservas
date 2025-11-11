const API_BASE_URL = 'http://localhost:8080/api';
const PREDICTION_API_URL = 'http://localhost:5000';

let predictionChart = null; // Variable global para la instancia del gráfico

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.split('/').pop();
    const user = JSON.parse(sessionStorage.getItem('currentUser'));

    if (!user && path !== 'login.html') {
        window.location.href = 'login.html';
        return;
    }

    if (user && path === 'login.html') {
        window.location.href = 'index.html';
        return;
    }

    if (path !== 'login.html') {
        renderNavbar(user);
        renderAdminControls(user, path);
    }

    switch (path) {
        case 'salas.html':
            loadSalas();
            break;
        case 'articulos.html':
            loadArticulos();
            break;
        case 'reservas.html':
            initReservasPage();
            break;
        case 'editar-reserva.html':
            initEditReservaPage();
            break;
        case 'usuarios.html':
            loadUsuarios();
            break;
        case 'monitor.html':
            initMonitorPage();
            break;
        case 'login.html':
            initLoginPage();
            break;
    }
});

function renderNavbar(user) {
    const navbarPlaceholder = document.querySelector('nav');
    if (!navbarPlaceholder) return;
    const path = window.location.pathname.split('/').pop();
    const active = (page) => path.startsWith(page) ? 'active' : '';

    navbarPlaceholder.innerHTML = `
        <div class="container-fluid">
            <a class="navbar-brand" href="index.html">Gestión de Reservas</a>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link ${active('index.html')}" href="index.html">Inicio</a></li>
                    <li class="nav-item"><a class="nav-link ${active('salas.html')}" href="salas.html">Salas</a></li>
                    <li class="nav-item"><a class="nav-link ${active('articulos.html')}" href="articulos.html">Artículos</a></li>
                    <li class="nav-item"><a class="nav-link ${active('reservas.html') || active('editar-reserva.html')}" href="reservas.html">Reservas</a></li>
                    ${user.rol === 'ADMIN' ? `<li class="nav-item"><a class="nav-link ${active('usuarios.html')}" href="usuarios.html">Usuarios</a></li>` : ''}
                    ${user.rol === 'ADMIN' ? `<li class="nav-item"><a class="nav-link ${active('monitor.html')}" href="monitor.html">Monitor</a></li>` : ''}
                </ul>
                <span class="navbar-text me-3">Bienvenido, <strong>${user.nombre}</strong> (${user.rol})</span>
                <button id="logout-btn" class="btn btn-outline-light">Cerrar Sesión</button>
            </div>
        </div>
    `;
    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
}

function renderAdminControls(user, path) {
    const adminControls = document.getElementById('admin-controls');
    if (!adminControls || !user || user.rol !== 'ADMIN') return;

    let buttonText = '', formContainerId = '', createHandler = '';

    if (path === 'salas.html') {
        buttonText = 'Crear Nueva Sala';
        formContainerId = 'sala-form-container';
        createHandler = 'showSalaForm()';
    }
    if (path === 'articulos.html') {
        buttonText = 'Crear Nuevo Artículo';
        formContainerId = 'articulo-form-container';
        createHandler = 'showArticuloForm()';
    }
    if (path === 'usuarios.html') {
        buttonText = 'Crear Nuevo Usuario';
        formContainerId = 'usuario-form-container';
        createHandler = 'showUsuarioForm()';
    }

    if (buttonText) {
        adminControls.innerHTML = `
            <button class="btn btn-success" onclick="${createHandler}">${buttonText}</button>
            <div id="${formContainerId}" class="mt-3"></div>
        `;
    }
}

function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
}

async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const [email, password] = [form.elements.email.value, form.elements.password.value];
    const errorDiv = document.getElementById('login-error');
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
        });
        if (!response.ok) throw new Error('Email o contraseña incorrectos.');
        const user = await response.json();
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'index.html';
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('d-none');
    }
}

async function handleDelete(resource, id) {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (resource === 'personas' && user.id === id) {
        Swal.fire({
            icon: 'error',
            title: 'Acción no permitida',
            text: 'No puedes eliminarte a ti mismo.'
        });
        return;
    }

    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Se eliminará el recurso (ID: ${id}).`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, ¡eliminar!',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
        return;
    }

    if (!user) return;
    try {
        const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
            method: 'DELETE', headers: { 'X-User-ID': user.id }
        });
        if (response.status === 403) throw new Error('No tienes permiso para realizar esta acción.');
        if (!response.ok) throw new Error('No se pudo eliminar el recurso.');
        
        Swal.fire(
            '¡Eliminado!',
            'Recurso eliminado con éxito.',
            'success'
        );

        if (resource.startsWith('salas')) loadSalas();
        if (resource.startsWith('articulos')) loadArticulos();
        if (resource.startsWith('reservas')) loadReservas();
        if (resource.startsWith('personas')) loadUsuarios();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message
        });
    }
}

async function initMonitorPage() {
    const analysisTypeFilter = document.getElementById('analysis-type-filter');
    const salaFilter = document.getElementById('sala-filter');
    const articuloFilter = document.getElementById('articulo-filter');
    const chartDescription = document.getElementById('chart-description');

    if (chartDescription) {
        chartDescription.textContent = 'Este gráfico muestra la serie temporal de reservas históricas y una predicción a futuro generada con un modelo ARIMA, incluyendo un intervalo de confianza del 95%.';
    }

    await Promise.all([
        populateResourceFilter(salaFilter, 'salas', 'Todas las salas'),
        populateResourceFilter(articuloFilter, 'articulos', 'Todos los artículos')
    ]);

    analysisTypeFilter.addEventListener('change', () => updatePredictionChart());

    salaFilter.addEventListener('change', () => {
        articuloFilter.value = ''; // Resetea el otro filtro
        updatePredictionChart();
    });

    articuloFilter.addEventListener('change', () => {
        salaFilter.value = ''; // Resetea el otro filtro
        updatePredictionChart();
    });

    updatePredictionChart(); // Carga inicial del gráfico
}

async function populateResourceFilter(selectElement, resource, defaultOptionText) {
    try {
        const response = await fetch(`${API_BASE_URL}/${resource}`);
        if (!response.ok) throw new Error('Error cargando recursos');
        const items = await response.json();
        selectElement.innerHTML = `<option value="">${defaultOptionText}</option>` +
            items.map(item => `<option value="${item.id}">${item.nombre}</option>`).join('');
    } catch (error) {
        selectElement.innerHTML = '<option value="">Error</option>';
        console.error(`Error populating ${resource} filter:`, error);
    }
}

async function updatePredictionChart() {
    const ctx = document.getElementById('predictionChart');
    const chartContainer = document.getElementById('chart-container');
    const chartMessage = document.getElementById('chart-message');
    if (!ctx || !chartContainer || !chartMessage) return;

    const analysisType = document.getElementById('analysis-type-filter').value;
    const salaId = document.getElementById('sala-filter').value;
    const articuloId = document.getElementById('articulo-filter').value;

    chartContainer.style.display = 'none';
    chartMessage.style.display = 'block';
    chartMessage.textContent = 'Cargando datos del gráfico...';

    let url = `${PREDICTION_API_URL}/predict?type=${analysisType}`;
    if (salaId) url += `&sala_id=${salaId}`;
    else if (articuloId) url += `&articulo_id=${articuloId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo obtener la predicción del servidor.');
        const prediction = await response.json();

        if (!prediction.historical_labels || prediction.historical_labels.length === 0) {
            chartContainer.style.display = 'none';
            chartMessage.textContent = prediction.title_note || 'No hay datos de reservas.';
            chartMessage.style.display = 'block';
            return;
        }

        chartContainer.style.display = 'block';
        chartMessage.style.display = 'none';

        const predictedLabels = prediction.predicted_labels.filter(
            lbl => !prediction.historical_labels.includes(lbl)
        );

        const fullLabels = [...prediction.historical_labels, ...predictedLabels];
        const historyLength = prediction.historical_data.length;

        const predOffset = fullLabels.length - prediction.predicted_data.length;
        const paddedPred = Array(predOffset).fill(null).concat(prediction.predicted_data);
        const paddedUpper = Array(predOffset).fill(null).concat(prediction.conf_int_upper);
        const paddedLower = Array(predOffset).fill(null).concat(prediction.conf_int_lower);

        console.log("📊 Labels:", fullLabels.length, "Hist:", historyLength, "Pred:", prediction.predicted_data.length);

        const chartData = {
            labels: fullLabels,
            datasets: [
                {
                    label: 'Reservas Históricas',
                    data: prediction.historical_data,
                    borderColor: 'rgba(54,162,235,1)',
                    backgroundColor: 'rgba(54,162,235,0.5)',
                    tension: 0.2,
                    fill: false,
                    pointRadius: 3
                },
                {
                    label: 'Predicción ARIMA',
                    data: paddedPred,
                    borderColor: 'rgba(255,99,132,1)',
                    borderDash: [6, 6],
                    tension: 0.2,
                    fill: false,
                    pointRadius: 3
                },
                {
                    label: 'Intervalo de Confianza',
                    data: paddedUpper,
                    fill: '+1',
                    backgroundColor: 'rgba(255,99,132,0.2)',
                    borderColor: 'transparent',
                    pointRadius: 0
                },
                {
                    label: 'Límite Inferior',
                    data: paddedLower,
                    borderColor: 'transparent',
                    pointRadius: 0,
                    fill: false
                }
            ]
        };

        const chartOptions = {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 2,
                        stepSize: 0.5
                    }
                },
                x: {
                    type: 'category',
                    ticks: {
                        maxRotation: 60,
                        minRotation: 45
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        filter: item => item.text !== 'Límite Inferior'
                    }
                },
                title: {
                    display: true,
                    text: prediction.title
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        };

        if (predictionChart) {
            predictionChart.data = chartData;
            predictionChart.options = chartOptions;
            predictionChart.update();
        } else {
            predictionChart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: chartOptions
            });
        }

    } catch (error) {
        chartContainer.style.display = 'none';
        chartMessage.style.display = 'block';
        chartMessage.textContent = `Error al cargar el gráfico: ${error.message}`;
        console.error("Error al cargar/actualizar el gráfico:", error);
    }
}

async function loadSalas() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const salasList = document.getElementById('salas-list');
    if (!salasList) return;
    try {
        const response = await fetch(`${API_BASE_URL}/salas`);
        if (!response.ok) throw new Error(`HTTP error!`);
        const salas = await response.json();
        salasList.innerHTML = salas.length ? salas.map(sala => {
            const adminButtons = (user && user.rol === 'ADMIN') ? `<div class="card-footer"><button class="btn btn-sm btn-warning" onclick='showSalaForm(${JSON.stringify(sala)})'>Editar</button> <button class="btn btn-sm btn-danger" onclick="handleDelete('salas', ${sala.id})">Eliminar</button></div>` : '';
            return `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title text-truncate">${sala.nombre}</h5>
                        <p class="card-text">Capacidad: ${sala.capacidad} personas</p>
                        <a href="reservas.html?tipo=sala&id=${sala.id}" class="btn btn-primary">Reservar</a>
                    </div>
                    ${adminButtons}
                </div>
            </div>
        `}).join('') : '<p>No hay salas para mostrar.</p>';
    } catch (error) {
        salasList.innerHTML = '<p class="text-danger">Error al cargar las salas.</p>';
    }
}

function showSalaForm(sala = null) {
    const container = document.getElementById('sala-form-container');
    if (!container) return;
    const isUpdate = sala !== null;
    const salaId = isUpdate ? sala.id : null;
    container.innerHTML = `
        <div class="card bg-light"><div class="card-body">
            <h5 class="card-title">${isUpdate ? `Editando Sala ID: ${salaId}` : 'Crear Nueva Sala'}</h5>
            <form id="sala-form">
                <div class="mb-3"><label for="sala-nombre">Nombre</label><input type="text" class="form-control" id="sala-nombre" value="${isUpdate ? sala.nombre : ''}" required></div>
                <div class="mb-3"><label for="sala-capacidad">Capacidad</label><input type="number" class="form-control" id="sala-capacidad" value="${isUpdate ? sala.capacidad : ''}" required></div>
                <button type="submit" class="btn btn-primary">Guardar</button>
                <button type="button" class="btn btn-secondary" onclick="hideSalaForm()">Cancelar</button>
            </form>
        </div></div>
    `;
    document.getElementById('sala-form').addEventListener('submit', (e) => handleSaveSala(e, salaId));
}

function hideSalaForm() {
    const container = document.getElementById('sala-form-container');
    if (container) container.innerHTML = '';
}

async function handleSaveSala(event, salaId) {
    event.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const isUpdate = salaId !== null;
    const salaData = { nombre: document.getElementById('sala-nombre').value, capacidad: parseInt(document.getElementById('sala-capacidad').value, 10) };
    const url = isUpdate ? `${API_BASE_URL}/salas/${salaId}` : `${API_BASE_URL}/salas`;
    const method = isUpdate ? 'PUT' : 'POST';
    try {
        const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'X-User-ID': user.id }, body: JSON.stringify(salaData) });
        if (response.status === 403) throw new Error('No tienes permiso.');
        if (!response.ok) throw new Error('No se pudo guardar la sala.');
        Swal.fire('¡Éxito!', `Sala ${isUpdate ? 'actualizada' : 'creada'} con éxito.`, 'success');
        hideSalaForm();
        loadSalas();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

// --- ARTICULOS ---
async function loadArticulos() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const articulosList = document.getElementById('articulos-list');
    if (!articulosList) return;
    try {
        const response = await fetch(`${API_BASE_URL}/articulos`);
        if (!response.ok) throw new Error(`HTTP error!`);
        const articulos = await response.json();
        articulosList.innerHTML = articulos.length ? articulos.map(articulo => {
            const disponibilidad = articulo.disponible ? '<span class="badge bg-success">Disponible</span>' : '<span class="badge bg-danger">No Disponible</span>';
            const adminButtons = (user && user.rol === 'ADMIN') ? `<div class="card-footer"><button class="btn btn-sm btn-warning" onclick='showArticuloForm(${JSON.stringify(articulo)})'>Editar</button> <button class="btn btn-sm btn-danger" onclick="handleDelete('articulos', ${articulo.id})">Eliminar</button></div>` : '';
            return `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title text-truncate">${articulo.nombre}</h5>
                            <p class="card-text">Estado: ${disponibilidad}</p>
                            <a href="reservas.html?tipo=articulo&id=${articulo.id}" class="btn btn-primary ${!articulo.disponible ? 'disabled' : ''}">Reservar</a>
                        </div>
                        ${adminButtons}
                    </div>
                </div>
            `;
        }).join('') : '<p>No hay artículos para mostrar.</p>';
    } catch (error) {
        articulosList.innerHTML = '<p class="text-danger">Error al cargar los artículos.</p>';
    }
}

function showArticuloForm(articulo = null) {
    const container = document.getElementById('articulo-form-container');
    if (!container) return;
    const isUpdate = articulo !== null;
    const articuloId = isUpdate ? articulo.id : null;
    const formTitle = isUpdate ? `Editando Artículo ID: ${articuloId}` : 'Crear Nuevo Artículo';
    const nombre = isUpdate ? articulo.nombre : '';
    const disponible = isUpdate ? articulo.disponible : true;
    container.innerHTML = `
        <div class="card bg-light"><div class="card-body">
            <h5 class="card-title">${formTitle}</h5>
            <form id="articulo-form">
                <div class="mb-3"><label for="articulo-nombre">Nombre</label><input type="text" class="form-control" id="articulo-nombre" value="${nombre}" required></div>
                <div class="mb-3 form-check"><input type="checkbox" class="form-check-input" id="articulo-disponible" ${disponible ? 'checked' : ''}><label class="form-check-label" for="articulo-disponible">Disponible</label></div>
                <button type="submit" class="btn btn-primary">Guardar</button>
                <button type="button" class="btn btn-secondary" onclick="hideArticuloForm()">Cancelar</button>
            </form>
        </div></div>
    `;
    document.getElementById('articulo-form').addEventListener('submit', (e) => handleSaveArticulo(e, articuloId));
}

function hideArticuloForm() {
    const container = document.getElementById('articulo-form-container');
    if (container) container.innerHTML = '';
}

async function handleSaveArticulo(event, articuloId) {
    event.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const isUpdate = articuloId !== null;
    const articuloData = { nombre: document.getElementById('articulo-nombre').value, disponible: document.getElementById('articulo-disponible').checked };
    const url = isUpdate ? `${API_BASE_URL}/articulos/${articuloId}` : `${API_BASE_URL}/articulos`;
    const method = isUpdate ? 'PUT' : 'POST';
    try {
        const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'X-User-ID': user.id }, body: JSON.stringify(articuloData) });
        if (response.status === 403) throw new Error('No tienes permiso.');
        if (!response.ok) throw new Error('No se pudo guardar el artículo.');
        Swal.fire('¡Éxito!', `Artículo ${isUpdate ? 'actualizado' : 'creado'} con éxito.`, 'success');
        hideArticuloForm();
        loadArticulos();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

// --- USUARIOS ---
async function loadUsuarios() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const container = document.getElementById('user-list-container');
    if (!container) return;
    try {
        const response = await fetch(`${API_BASE_URL}/personas`, { headers: { 'X-User-ID': user.id } });
        if (response.status === 403) throw new Error('No tienes permiso para ver esta lista.');
        if (!response.ok) throw new Error(`HTTP error!`);
        const usuarios = await response.json();
        container.innerHTML = `
            <table class="table table-striped">
                <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead>
                <tbody>
                    ${usuarios.map(u => `
                        <tr>
                            <td>${u.id}</td>
                            <td>${u.nombre}</td>
                            <td>${u.email}</td>
                            <td>${u.rol}</td>
                            <td>
                                <button class="btn btn-sm btn-warning" onclick='showUsuarioForm(${JSON.stringify(u)})'>Editar</button>
                                <button class="btn btn-sm btn-danger" onclick="handleDelete('personas', ${u.id})">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        container.innerHTML = `<p class="text-danger">${error.message}</p>`;
    }
}

function showUsuarioForm(usuario = null) {
    const container = document.getElementById('usuario-form-container');
    if (!container) return;
    const isUpdate = usuario !== null;
    const usuarioId = isUpdate ? usuario.id : null;
    container.innerHTML = `
        <div class="card bg-light"><div class="card-body">
            <h5 class="card-title">${isUpdate ? `Editando Usuario ID: ${usuarioId}` : 'Crear Nuevo Usuario'}</h5>
            <form id="usuario-form">
                <div class="mb-3"><label for="usuario-nombre">Nombre</label><input type="text" class="form-control" id="usuario-nombre" value="${isUpdate ? usuario.nombre : ''}" required></div>
                <div class="mb-3"><label for="usuario-email">Email</label><input type="email" class="form-control" id="usuario-email" value="${isUpdate ? usuario.email : ''}" required></div>
                <div class="mb-3"><label for="usuario-password">Contraseña</label><input type="password" class="form-control" id="usuario-password" ${isUpdate ? 'placeholder="Dejar en blanco para no cambiar"' : 'required'}></div>
                <div class="mb-3"><label for="usuario-rol">Rol</label><select class="form-select" id="usuario-rol"><option value="USER" ${isUpdate && usuario.rol === 'USER' ? 'selected' : ''}>USER</option><option value="ADMIN" ${isUpdate && usuario.rol === 'ADMIN' ? 'selected' : ''}>ADMIN</option></select></div>
                <button type="submit" class="btn btn-primary">Guardar</button>
                <button type="button" class="btn btn-secondary" onclick="hideUsuarioForm()">Cancelar</button>
            </form>
        </div></div>
    `;
    document.getElementById('usuario-form').addEventListener('submit', (e) => handleSaveUsuario(e, usuarioId));
}

function hideUsuarioForm() {
    const container = document.getElementById('usuario-form-container');
    if (container) container.innerHTML = '';
}

async function handleSaveUsuario(event, usuarioId) {
    event.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const isUpdate = usuarioId !== null;
    const password = document.getElementById('usuario-password').value;
    const usuarioData = { nombre: document.getElementById('usuario-nombre').value, email: document.getElementById('usuario-email').value, rol: document.getElementById('usuario-rol').value };
    if (password) usuarioData.password = password;
    const url = isUpdate ? `${API_BASE_URL}/personas/${usuarioId}` : `${API_BASE_URL}/personas`;
    const method = isUpdate ? 'PUT' : 'POST';
    try {
        const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'X-User-ID': user.id }, body: JSON.stringify(usuarioData) });
        if (response.status === 403) throw new Error('No tienes permiso.');
        if (!response.ok) throw new Error('No se pudo guardar el usuario.');
        Swal.fire('¡Éxito!', `Usuario ${isUpdate ? 'actualizado' : 'creado'} con éxito.`, 'success');
        hideUsuarioForm();
        loadUsuarios();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

// --- RESERVAS ---
async function initReservasPage() {
    await Promise.all([loadPersonas(), loadReservas()]);
    document.getElementById('recurso-tipo').addEventListener('change', (e) => populateRecursos(e.target.value));
    document.getElementById('reserva-form').addEventListener('submit', handleCreateReserva);
    const params = new URLSearchParams(window.location.search);
    const tipo = params.get('tipo');
    const id = params.get('id');
    if (tipo && id) {
        const tipoSelect = document.getElementById('recurso-tipo');
        tipoSelect.value = tipo;
        await populateRecursos(tipo);
        document.getElementById('recurso-id').value = id;
    }
}

async function loadPersonas(selectElementId = 'persona', selectedId = null) {
    const personaSelect = document.getElementById(selectElementId);
    try {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        const response = await fetch(`${API_BASE_URL}/personas`, { headers: { 'X-User-ID': user.id } });
        if (!response.ok) throw new Error(`HTTP error!`);
        const personas = await response.json();
        personaSelect.innerHTML = '<option value="" selected disabled>Seleccione una persona</option>' + 
            personas.map(p => `<option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>${p.nombre}</option>`).join('');
    } catch (error) {
        personaSelect.innerHTML = '<option value="" selected disabled>Error al cargar personas</option>';
    }
}

async function populateRecursos(tipo, selectedId = null) {
    const recursoSelect = document.getElementById('recurso-id');
    if (!tipo) {
        recursoSelect.innerHTML = '<option value="" selected disabled>Seleccione un tipo primero</option>';
        recursoSelect.disabled = true;
        return;
    }
    const endpoint = tipo === 'sala' ? '/salas' : '/articulos';
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP error!`);
        let recursos = await response.json();
        if (tipo === 'articulo') {
            recursos = recursos.filter(r => r.disponible);
        }
        recursoSelect.innerHTML = '<option value="" selected disabled>Seleccione un recurso</option>' + 
            recursos.map(r => `<option value="${r.id}" ${r.id === selectedId ? 'selected' : ''}>${r.nombre}</option>`).join('');
        recursoSelect.disabled = false;
    } catch (error) {
        recursoSelect.innerHTML = '<option value="" selected disabled>Error al cargar recursos</option>';
    }
}

async function loadReservas() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const reservasList = document.getElementById('reservas-list');
    try {
        const response = await fetch(`${API_BASE_URL}/reservas`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const reservas = await response.json();
        reservasList.innerHTML = reservas.length ? reservas.map(reserva => {
            const recurso = reserva.articulo ? `<span class="badge bg-info me-2">Artículo</span> ${reserva.articulo.nombre}` : `<span class="badge bg-primary me-2">Sala</span> ${reserva.sala.nombre}`;
            const adminButtons = (user && (user.rol === 'ADMIN' || reserva.persona.id === user.id))
                ? `<a href="editar-reserva.html?id=${reserva.id}" class="btn btn-warning btn-sm me-2">Editar</a><button class="btn btn-danger btn-sm" onclick="handleDelete('reservas', ${reserva.id})">Eliminar</button>` 
                : '';

            return `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex w-100 justify-content-between align-items-start">
                            <h5 class="card-title text-truncate me-2">${recurso}</h5>
                            <small class="text-muted">${new Date(reserva.fechaHoraInicio).toLocaleDateString()}</small>
                        </div>
                        <p class="card-text mb-1">Reservado por: <strong>${reserva.persona.nombre}</strong></p>
                        <small class="text-muted">De: ${new Date(reserva.fechaHoraInicio).toLocaleString()} a ${new Date(reserva.fechaHoraFin).toLocaleString()}</small>
                    </div>
                    ${adminButtons ? `<div class="card-footer d-flex justify-content-end">${adminButtons}</div>` : ''}
                </div>
            `;
        }).join('') : '<div class="list-group-item">No hay reservas para mostrar.</div>';
    } catch (error) {
        reservasList.innerHTML = '<div class="list-group-item text-danger">Error al cargar las reservas.</div>';
    }
}

async function handleCreateReserva(event) {
    event.preventDefault();
    const form = event.target;
    const reserva = { persona: { id: form.elements.persona.value }, fechaHoraInicio: form.elements['fecha-inicio'].value, fechaHoraFin: form.elements['fecha-fin'].value };
    const tipoRecurso = form.elements['recurso-tipo'].value;
    const idRecurso = form.elements['recurso-id'].value;
    if (tipoRecurso === 'sala') {
        reserva.sala = { id: idRecurso };
        reserva.articulo = null;
    } else {
        reserva.articulo = { id: idRecurso };
        reserva.sala = null;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/reservas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reserva),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error del servidor: ${errorData.message || response.status}`);
        }
        Swal.fire('¡Éxito!', '¡Reserva creada con éxito!', 'success');
        form.reset();
        loadReservas();
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error al crear la reserva', text: error.message });
    }
}

async function initEditReservaPage() {
    const params = new URLSearchParams(window.location.search);
    const reservaId = params.get('id');
    if (!reservaId) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'ID de reserva no encontrado.' }).then(() => {
            window.location.href = 'reservas.html';
        });
        return;
    }

    document.getElementById('reserva-id-display').textContent = reservaId;
    document.getElementById('edit-reserva-form').addEventListener('submit', (e) => handleUpdateReserva(e, reservaId));
    document.getElementById('recurso-tipo').addEventListener('change', (e) => populateRecursos(e.target.value));

    try {
        const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`);
        if (!response.ok) throw new Error('No se pudo cargar la reserva.');
        const reserva = await response.json();

        await loadPersonas('persona', reserva.persona.id);
        
        const tipo = reserva.sala ? 'sala' : 'articulo';
        const recursoId = reserva.sala ? reserva.sala.id : reserva.articulo.id;
        document.getElementById('recurso-tipo').value = tipo;
        await populateRecursos(tipo, recursoId);

        document.getElementById('fecha-inicio').value = new Date(new Date(reserva.fechaHoraInicio).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        document.getElementById('fecha-fin').value = new Date(new Date(reserva.fechaHoraFin).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}

async function handleUpdateReserva(event, reservaId) {
    event.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const form = event.target;
    const reservaActualizada = { id: reservaId, persona: { id: form.elements.persona.value }, fechaHoraInicio: form.elements['fecha-inicio'].value, fechaHoraFin: form.elements['fecha-fin'].value };
    const tipoRecurso = form.elements['recurso-tipo'].value;
    const idRecurso = form.elements['recurso-id'].value;
    if (tipoRecurso === 'sala') {
        reservaActualizada.sala = { id: idRecurso };
        reservaActualizada.articulo = null;
    } else {
        reservaActualizada.articulo = { id: idRecurso };
        reservaActualizada.sala = null;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-User-ID': user.id }, body: JSON.stringify(reservaActualizada),
        });
        if (response.status === 403) throw new Error('No tienes permiso.');
        if (!response.ok) throw new Error('No se pudo actualizar la reserva.');
        Swal.fire('¡Éxito!', 'Reserva actualizada con éxito.', 'success').then(() => {
            window.location.href = 'reservas.html';
        });
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    }
}
