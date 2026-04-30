const API_BASE = '/api';
let jwtToken = null;

// Elementos DOM
const authSection = document.getElementById('auth-section');
const crudSection = document.getElementById('crud-section');
const loginForm = document.getElementById('login-form');
const createForm = document.getElementById('create-form');
const btnFetch = document.getElementById('btn-fetch');
const logoutBtn = document.getElementById('logout-btn');
const itemsList = document.getElementById('items-list');
const authStatus = document.getElementById('auth-status');
const crudStatus = document.getElementById('crud-status');
const serverDisplay = document.getElementById('server-id-display');

// Actualizar el UI del Servidor
function updateServerDisplay(serverId) {
    if(!serverId) return;
    serverDisplay.textContent = serverId;
    serverDisplay.classList.remove('highlight');
    void serverDisplay.offsetWidth; // reiniciar animación
    serverDisplay.classList.add('highlight');
}

// Envoltorio para Fetch que añade JWT y extrae ID de servidor
async function apiFetch(endpoint, options = {}) {
    if (jwtToken) {
        options.headers = { ...options.headers, 'Authorization': `Bearer ${jwtToken}` };
    }
    // Evitar caché del navegador para ver el balanceo en tiempo real
    options.cache = 'no-store';
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();
        
        // Identificar quién procesó la petición!
        if (data.server) updateServerDisplay(data.server);
        
        if (!response.ok) throw new Error(data.error || 'Error en la API');
        return data;
    } catch (err) {
        throw err;
    }
}

// LOGIN
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    authStatus.innerHTML = 'Iniciando sesión...';
    try {
        const res = await apiFetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        jwtToken = res.token;
        authSection.classList.remove('active');
        crudSection.classList.add('active');
        fetchItems(); // Cargar items de inmediato
    } catch (error) {
        authStatus.innerHTML = `<span style="color:var(--danger)">${error.message}</span>`;
    }
});

// LOGOUT
logoutBtn.addEventListener('click', () => {
    jwtToken = null;
    crudSection.classList.remove('active');
    authSection.classList.add('active');
    authStatus.innerHTML = 'Sesión cerrada.';
    serverDisplay.textContent = 'Esperando petición...';
});

// GET ITEMS
async function fetchItems() {
    crudStatus.innerHTML = 'Cargando items...';
    try {
        const res = await apiFetch('/items');
        renderItems(res.data);
        crudStatus.innerHTML = `<span style="color:var(--success)">Se cargaron ${res.data.length} items.</span>`;
    } catch (error) {
        crudStatus.innerHTML = `<span style="color:var(--danger)">${error.message}</span>`;
    }
}
btnFetch.addEventListener('click', fetchItems);

// POST ITEM
createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('new-item-name');
    const name = input.value;
    crudStatus.innerHTML = 'Creando item...';
    try {
        await apiFetch('/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        input.value = '';
        fetchItems(); // Refrescar lista
    } catch (error) {
        crudStatus.innerHTML = `<span style="color:var(--danger)">${error.message}</span>`;
    }
});

// PUT (UPDATE) ITEM
async function editItem(id, currentName) {
    const newName = prompt("Ingresa el nuevo nombre para este item:", currentName);
    if (!newName || newName === currentName) return;
    
    crudStatus.innerHTML = `Actualizando item #${id}...`;
    try {
        await apiFetch(`/items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName })
        });
        fetchItems(); // Refrescar lista
    } catch (error) {
        crudStatus.innerHTML = `<span style="color:var(--danger)">${error.message}</span>`;
    }
}

// DELETE ITEM
async function deleteItem(id) {
    crudStatus.innerHTML = `Eliminando item #${id}...`;
    try {
        await apiFetch(`/items/${id}`, { method: 'DELETE' });
        fetchItems(); // Refrescar lista
    } catch (error) {
        crudStatus.innerHTML = `<span style="color:var(--danger)">${error.message}</span>`;
    }
}

// RENDER DOM
function renderItems(items) {
    itemsList.innerHTML = '';
    if (!items.length) {
        itemsList.innerHTML = '<p style="color:var(--text-muted); padding: 10px;">No hay items. Crea uno nuevo.</p>';
        return;
    }
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
            <span><strong>#${item.id}</strong> - ${item.name}</span>
            <div>
                <button class="btn outline-btn" style="padding: 6px 12px; margin-right: 5px; color: white; border-color: rgba(255,255,255,0.2);" onclick="editItem(${item.id}, '${item.name}')">Editar</button>
                <button class="btn danger-btn" onclick="deleteItem(${item.id})">Borrar</button>
            </div>
        `;
        itemsList.appendChild(div);
    });
}
