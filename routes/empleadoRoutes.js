const express = require('express');
const bcrypt = require('bcryptjs');
const connection = require('../db');

const router = express.Router();

// CRUD Operations for Empleados
router.get('/', (req, res) => {
  const query = `SELECT u.ID, u.Nombre, u.Correo, u.Direccion, u.Telefono, r.Nombre as Rol FROM Empleados u JOIN Roles r ON u.ID_Rol = r.ID`;
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
  const query = `SELECT u.ID, u.Nombre, u.Correo, u.Direccion, u.Telefono, r.Nombre as Rol FROM Empleados u JOIN Roles r ON u.ID_Rol = r.ID WHERE u.ID = ?`;
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
  const { nombre, correo, contraseña, direccion, telefono, rol, idAdministrador } = req.body;
  const hashedPassword = await bcrypt.hash(contraseña, 10);

  const getRolIdQuery = 'SELECT ID FROM Roles WHERE Nombre = ?';
  connection.query(getRolIdQuery, [rol], (err, results) => {
    if (err) {
      res.status(500).send('Error al obtener el rol');
      return;
    }

    const rolId = results[0].ID;

    // Insertar empleado en la tabla de Empleados
    const query = `INSERT INTO Empleados (Nombre, Correo, Contraseña, Direccion, Telefono, ID_Administrador, ID_Rol) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [nombre, correo, hashedPassword, direccion, telefono, idAdministrador, rolId], (err, results) => {
      if (err) {
        res.status(500).send('Error al crear el empleado');
      } else {
        const empleadoId = results.insertId;

        // Insertar rol de empleado en la tabla Roles_Empleados
        const empleadoRolIdQuery = 'SELECT ID FROM Roles WHERE Nombre = "Empleado"';
        connection.query(empleadoRolIdQuery, (err, rolResults) => {
          if (err) {
            res.status(500).send('Error al obtener el rol de empleado');
            return;
          }

          const empleadoRolId = rolResults[0].ID;
          const insertRolesEmpleadoQuery = 'INSERT INTO Roles_Empleados (ID_Empleado, ID_Rol) VALUES (?, ?), (?, ?)';
          connection.query(insertRolesEmpleadoQuery, [empleadoId, empleadoRolId, empleadoId, rolId], (err, results) => {
            if (err) {
              res.status(500).send('Error al asignar roles al empleado');
            } else {
              res.json({ message: 'Empleado creado exitosamente' });
            }
          });
        });
      }
    });
  });
});

// Actualizar empleado
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, contraseña, direccion, telefono, rol } = req.body;
  let query, queryParams;

  if (contraseña) {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    query = `UPDATE Empleados SET Nombre = ?, Correo = ?, Contraseña = ?, Direccion = ?, Telefono = ? WHERE ID = ?`;
    queryParams = [nombre, correo, hashedPassword, direccion, telefono, id];
  } else {
    query = `UPDATE Empleados SET Nombre = ?, Correo = ?, Direccion = ?, Telefono = ? WHERE ID = ?`;
    queryParams = [nombre, correo, direccion, telefono, id];
  }

  connection.query(query, queryParams, (err, results) => {
    if (err) {
      res.status(500).send('Error al actualizar el empleado');
    } else {
      // Actualizar rol en la tabla Roles_Empleados
      const getRolIdQuery = 'SELECT ID FROM Roles WHERE Nombre = ?';
      connection.query(getRolIdQuery, [rol], (err, rolResults) => {
        if (err) {
          res.status(500).send('Error al obtener el rol');
          return;
        }

        const rolId = rolResults[0].ID;
        const updateRolesEmpleadoQuery = 'UPDATE Roles_Empleados SET ID_Rol = ? WHERE ID_Empleado = ?';
        connection.query(updateRolesEmpleadoQuery, [rolId, id], (err, results) => {
          if (err) {
            res.status(500).send('Error al actualizar el rol del empleado');
          } else {
            res.json({ message: 'Empleado y rol actualizados exitosamente' });
          }
        });
      });
    }
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM Empleados WHERE ID = ?`;
  connection.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send('Error al eliminar el empleado');
    } else {
      // Eliminar roles asociados al empleado en la tabla Roles_Empleados
      const deleteRolesEmpleadoQuery = 'DELETE FROM Roles_Empleados WHERE ID_Empleado = ?';
      connection.query(deleteRolesEmpleadoQuery, [id], (err, results) => {
        if (err) {
          res.status(500).send('Error al eliminar roles del empleado');
        } else {
          res.json({ message: 'Empleado y roles eliminados exitosamente' });
        }
      });
    }
  });
});

module.exports = router;
