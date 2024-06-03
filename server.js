const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const connection = require('./db');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Servir archivos estáticos de la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Use routes
app.use('/api/administradores', adminRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Ruta de Registro para Usuarios
app.post('/register', async (req, res) => {
  const { nombre, correo, contraseña, direccion, telefono } = req.body;
  const hashedPassword = await bcrypt.hash(contraseña, 10);

  // Obtener el ID del rol 'Usuario'
  const getRolIdQuery = 'SELECT ID FROM Roles WHERE Nombre = "Usuario"';
  connection.query(getRolIdQuery, (err, results) => {
    if (err) {
      res.status(500).send('Error en el registro');
      return;
    }

    const rolId = results[0].ID;

    const query = 'INSERT INTO Usuarios (Nombre, Correo, Contraseña, Direccion, Telefono, ID_Rol) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [nombre, correo, hashedPassword, direccion, telefono, rolId], (err, results) => {
      if (err) {
        res.status(500).send('Error en el registro');
      } else {
        res.send('Registro exitoso');
      }
    });
  });
});

// Ruta de Login
app.post('/login', (req, res) => {
  const { correo, contraseña } = req.body;

  // Función para verificar las credenciales
  const verifyCredentials = (table, callback) => {
    const query = `SELECT ID, Nombre, Contraseña, ID_Rol FROM ${table} WHERE Correo = ?`;
    connection.query(query, [correo], async (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        const user = results[0];
        const match = await bcrypt.compare(contraseña, user.Contraseña);
        if (match) {
          callback(user);
        } else {
          res.status(400).send('Contraseña incorrecta');
        }
      } else {
        callback(null);
      }
    });
  };

  // Verificar en la tabla Usuarios
  verifyCredentials('Usuarios', (user) => {
    if (user) {
      res.json({ message: `Login exitoso. Bienvenido ${user.Nombre}`, user });
    } else {
      // Verificar en la tabla Empleados
      verifyCredentials('Empleados', (user) => {
        if (user) {
          res.json({ message: `Login exitoso. Bienvenido ${user.Nombre}`, user });
        } else {
          // Verificar en la tabla Administradores
          verifyCredentials('Administradores', (user) => {
            if (user) {
              res.json({ message: `Login exitoso. Bienvenido ${user.Nombre}`, user });
            } else {
              res.status(404).send('No se encontró una cuenta con ese correo');
            }
          });
        }
      });
    }
  });
});

// Servir el archivo HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas específicas para cada rol
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/empleado', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'empleado.html'));
});

app.get('/usuario', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'usuario.html'));
});

// Rutas para CRUD
app.get('/crud-admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'crud-admin.html'));
});

app.get('/crud-empleado', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'crud-empleado.html'));
});

app.get('/crud-usuario', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'crud-usuario.html'));
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000');
});

