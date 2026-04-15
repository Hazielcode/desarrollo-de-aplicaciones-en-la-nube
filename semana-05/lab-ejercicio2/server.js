const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('App Node.js conectada a PostgreSQL\n');
});

server.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
  console.log('Base de datos esperada en:', process.env.DB_HOST || 'db');
});
