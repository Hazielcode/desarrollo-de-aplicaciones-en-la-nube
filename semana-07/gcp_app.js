const express = require('express');
const os = require('os');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// El puerto 80 es requerido por el balanceador de GCP por defecto
const PORT = 80;
// Captura el nombre de la máquina virtual (ej. web-server-1)
const HOSTNAME = os.hostname();

// Base de datos en memoria (estado local)
let items = [
    { id: 1, name: 'Item de prueba' }
];

// Endpoint principal
app.get('/', (req, res) => {
    res.json({
        message: 'Conexión exitosa',
        server_name: HOSTNAME,
        data: items
    });
});

// Endpoint para agregar items
app.post('/', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Falta el nombre' });
    
    const newItem = { id: items.length + 1, name };
    items.push(newItem);
    
    res.status(201).json({
        message: 'Item guardado exitosamente',
        server_name: HOSTNAME,
        data: newItem
    });
});

// Arrancar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado. Host: ${HOSTNAME} | Puerto: ${PORT}`);
});
