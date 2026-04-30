const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const SERVER_ID = process.env.SERVER_ID || `Backend-${PORT}`;
const SECRET_KEY = 'mi_secreto_super_seguro';

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'db', // nombre del servicio en docker-compose
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'testdb',
  port: 5432,
});

// Inicializar tabla si no existe automáticamente al iniciar el servidor
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            );
        `);
        console.log(`[${SERVER_ID}] Base de datos conectada e inicializada.`);
    } catch (err) {
        console.error(`[${SERVER_ID}] Error conectando a BD:`, err.message);
    }
};
initDB();

// Helper para envolver respuestas y añadir la identidad del servidor
const respond = (res, status, data) => {
    res.status(status).json({
        server: SERVER_ID,
        port: PORT,
        ...data
    });
};

// --- LOGIN ENDPOINT ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        return respond(res, 200, { message: 'Login exitoso', token });
    }
    respond(res, 401, { error: 'Credenciales inválidas (usa admin/admin)' });
});

// --- JWT MIDDLEWARE ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return respond(res, 403, { error: 'Token requerido' });
    
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return respond(res, 401, { error: 'Token inválido' });
        req.user = decoded;
        next();
    });
};

// --- CRUD ENDPOINTS CON POSTGRESQL ---

// GET All
app.get('/api/items', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM items ORDER BY id ASC');
        respond(res, 200, { data: result.rows });
    } catch (err) {
        respond(res, 500, { error: 'Error en BD: ' + err.message });
    }
});

// POST Create
app.post('/api/items', verifyToken, async (req, res) => {
    const { name } = req.body;
    if (!name) return respond(res, 400, { error: 'El nombre es obligatorio' });
    try {
        const result = await pool.query('INSERT INTO items (name) VALUES ($1) RETURNING *', [name]);
        respond(res, 201, { message: 'Item creado', data: result.rows[0] });
    } catch (err) {
        respond(res, 500, { error: 'Error en BD: ' + err.message });
    }
});

// PUT Update
app.put('/api/items/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id);
    const { name } = req.body;
    try {
        const result = await pool.query('UPDATE items SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
        if (result.rowCount > 0) {
            respond(res, 200, { message: 'Item actualizado', data: result.rows[0] });
        } else {
            respond(res, 404, { error: 'Item no encontrado' });
        }
    } catch (err) {
        respond(res, 500, { error: 'Error en BD: ' + err.message });
    }
});

// DELETE
app.delete('/api/items/:id', verifyToken, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await pool.query('DELETE FROM items WHERE id = $1', [id]);
        if (result.rowCount > 0) {
            respond(res, 200, { message: 'Item eliminado' });
        } else {
            respond(res, 404, { error: 'Item no encontrado' });
        }
    } catch (err) {
        respond(res, 500, { error: 'Error en BD: ' + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`[${SERVER_ID}] Iniciado en puerto ${PORT}`);
});
