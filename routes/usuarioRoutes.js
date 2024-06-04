// routes/usuarioRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const connection = require('../db');

const router = express.Router();

// CRUD Operations for Usuarios
router.get('/', (req, res) => {
  const query = `SELECT u.ID, u.Nombre, u.Correo, u.Direccion, u.Telefono, r.Nombre as Rol FROM Usuarios u JOIN Roles r ON u.ID_Rol = r.ID`;
  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener usuarios');
    } else {
      res.json(results);
    }
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `SELECT u.ID, u.Nombre, u.Correo, u.Direccion, u.Telefono, r.Nombre as Rol FROM Usuarios u JOIN Roles r ON u.ID_Rol = r.ID WHERE u.ID = ?`;
  connection.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener el usuario');
    } else if (results.length === 0) {
      res.status(404).send('Usuario no encontrado');
    } else {
      res.json(results[0]);
    }
  });
});

router.post('/', async (req, res) => {
  const { nombre, correo, contraseña, direccion, telefono, rol } = req.body;
  const hashedPassword = await bcrypt.hash(contraseña, 10);

  const getRolIdQuery = 'SELECT ID FROM Roles WHERE Nombre = ?';
  connection.query(getRolIdQuery, [rol], (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener el rol');
      return;
    }

    const rolId = results[0].ID;
    const query = `INSERT INTO Usuarios (Nombre, Correo, Contraseña, Direccion, Telefono, ID_Rol) VALUES (?, ?, ?, ?, ?, ?)`;
    connection.query(query, [nombre, correo, hashedPassword, direccion, telefono, rolId], (err, results) => {
      if (err) {
        res.status(500).send('Error al crear el usuario');
      } else {
        res.json({ message: 'Usuario creado exitosamente' });
      }
    });
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, correo, direccion, telefono, rol } = req.body;

  const getRolIdQuery = 'SELECT ID FROM Roles WHERE Nombre = ?';
  connection.query(getRolIdQuery, [rol], (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener el rol');
      return;
    }

    const rolId = results[0].ID;
    const query = `UPDATE Usuarios SET Nombre = ?, Correo = ?, Direccion = ?, Telefono = ?, ID_Rol = ? WHERE ID = ?`;
    connection.query(query, [nombre, correo, direccion, telefono, rolId, id], (err, results) => {
      if (err) {
        res.status(500).send('Error al actualizar el usuario');
      } else {
        res.json({ message: 'Usuario actualizado exitosamente' });
      }
    });
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM Usuarios WHERE ID = ?`;
  connection.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send('Error al eliminar el usuario');
    } else {
      res.json({ message: 'Usuario eliminado exitosamente' });
    }
  });
});

module.exports = router;


