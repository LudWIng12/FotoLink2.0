const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const connection = require('./db');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const serviciosRoutes = require('./routes/serviciosRoutes');
const ordenesRoutes = require('./routes/ordenesRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
const authRoutes = require('./routes/loginRoutes'); // Nueva importación

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/administradores', adminRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/', authRoutes); // Usar las rutas de autenticación

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  } else {
    res.redirect('/');
  }
});

app.get('/empleado', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'public', 'empleado.html'));
  } else {
    res.redirect('/');
  }
});

app.get('/usuario', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'public', 'usuario.html'));
  } else {
    res.redirect('/');
  }
});

app.get('/crud-admin', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'public', 'crud-admin.html'));
  } else {
    res.redirect('/');
  }
});

app.get('/crud-empleado', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'public', 'crud-empleado.html'));
  } else {
    res.redirect('/');
  }
});

app.get('/crud-usuario', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'public', 'crud-usuario.html'));
  } else {
    res.redirect('/');
  }
});

app.get('/api/session', (req, res) => {
  if (req.session.userName) {
    res.json({ userName: req.session.userName });
  } else {
    res.status(401).send('No autorizado');
  }
});

app.get('/ordenes', (req, res) => {
  if (req.session.userId) {
      res.sendFile(path.join(__dirname, 'public', 'crud-ordenes.html'));
  } else {
      res.redirect('/');
  }
});

app.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000');
});
