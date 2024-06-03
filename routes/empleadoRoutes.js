// routes/empleadoRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const connection = require('../db');

const router = express.Router();

// CRUD Operations for Empleados
router.get('/', (req, res) => {
  const query = `SELECT u.ID, u.Nombre, u.Correo, r.Nombre as Rol FROM Empleados u JOIN Roles r ON u.ID_Rol = r.ID`;
  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener empleados');
    } else {
      res.json(results);
    }
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `SELECT u.ID, u.Nombre, u.Correo, r.Nombre as Rol FROM Empleados u JOIN Roles r ON u.ID_Rol = r.ID WHERE u.ID = ?`;
  connection.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener el empleado');
    } else if (results.length === 0) {
      res.status(404).send('Empleado no encontrado');
    } else {
      res.json(results[0]);
    }
  });
});

router.post('/', async (req, res) => {
  const { nombre, correo, contraseña, rol } = req.body;
  const hashedPassword = await bcrypt.hash(contraseña, 10);

  const getRolIdQuery = 'SELECT ID FROM Roles WHERE Nombre = ?';
  connection.query(getRolIdQuery, [rol], (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener el rol');
      return;
    }

    const rolId = results[0].ID;
    const query = `INSERT INTO Empleados (Nombre, Correo, Contraseña, ID_Rol) VALUES (?, ?, ?, ?)`;
    connection.query(query, [nombre, correo, hashedPassword, rolId], (err, results) => {
      if (err) {
        res.status(500).send('Error al crear el empleado');
      } else {
        res.json({ message: 'Empleado creado exitosamente' });
      }
    });
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol } = req.body;

  const getRolIdQuery = 'SELECT ID FROM Roles WHERE Nombre = ?';
  connection.query(getRolIdQuery, [rol], (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener el rol');
      return;
    }

    const rolId = results[0].ID;
    const query = `UPDATE Empleados SET Nombre = ?, Correo = ?, ID_Rol = ? WHERE ID = ?`;
    connection.query(query, [nombre, correo, rolId, id], (err, results) => {
      if (err) {
        res.status(500).send('Error al actualizar el empleado');
      } else {
        res.json({ message: 'Empleado actualizado exitosamente' });
      }
    });
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM Empleados WHERE ID = ?`;
  connection.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send('Error al eliminar el empleado');
    } else {
      res.json({ message: 'Empleado eliminado exitosamente' });
    }
  });
});

module.exports = router;
