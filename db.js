const mysql = require('mysql');

const connection = mysql.createConnection({
  host: '192.168.100.136', // Reemplaza con la IP de tu servidor Linux
  user: 'Admin', // Reemplaza con tu usuario de MySQL
  password: 'BDcontrasena', // Reemplaza con tu contraseña de MySQL
  database: 'FotoLink'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado a la base de datos');
});

module.exports = connection;
