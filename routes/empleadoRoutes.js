const express = require('express');
const connection = require('../db');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Obtener todos los empleados
router.get('/', (req, res) => {
    const query = 'SELECT e.*, GROUP_CONCAT(r.Nombre SEPARATOR ",") AS Roles FROM Empleados e JOIN Roles_Empleados re ON e.ID = re.ID_Empleado JOIN Roles r ON re.ID_Rol = r.ID GROUP BY e.ID';
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Error al obtener empleados');
        } else {
            res.json(results);
        }
    });
});

// Obtener un empleado por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT e.*, GROUP_CONCAT(r.Nombre SEPARATOR ",") AS Roles FROM Empleados e JOIN Roles_Empleados re ON e.ID = re.ID_Empleado JOIN Roles r ON re.ID_Rol = r.ID WHERE e.ID = ? GROUP BY e.ID';
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

// Crear un nuevo empleado
router.post('/', async (req, res) => {
    const { nombre, correo, contraseña, direccion, telefono, rol } = req.body;
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const empleadoRolId = 2; // ID para el rol de Empleado

    const query = 'INSERT INTO Empleados (Nombre, Correo, Contraseña, Direccion, Telefono, ID_Administrador, ID_Rol) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [nombre, correo, hashedPassword, direccion, telefono, 1, empleadoRolId], (err, results) => {
        if (err) {
            res.status(500).send('Error al crear el empleado');
            return;
        }

        const empleadoId = results.insertId;

        // Insertar en Roles_Empleados solo los roles específicos del 4 al 7
        const roles = rol.split(',');
        const rolesEmpleadosQueries = roles.map(rolId => {
            return new Promise((resolve, reject) => {
                const query = 'INSERT INTO Roles_Empleados (ID_Empleado, ID_Rol) VALUES (?, ?)';
                connection.query(query, [empleadoId, rolId], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });

        Promise.all(rolesEmpleadosQueries)
            .then(() => {
                res.json({ message: 'Empleado creado exitosamente' });
            })
            .catch(err => {
                res.status(500).send('Error al asignar roles: ' + err);
            });
    });
});

// Actualizar un empleado
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, correo, direccion, telefono, rol } = req.body;
    const query = 'UPDATE Empleados SET Nombre = ?, Correo = ?, Direccion = ?, Telefono = ? WHERE ID = ?';
    connection.query(query, [nombre, correo, direccion, telefono, id], (err) => {
        if (err) {
            res.status(500).send('Error al actualizar el empleado');
            return;
        }

        // Actualizar los roles en Roles_Empleados
        const roles = rol.split(',');
        const deleteRolesQuery = 'DELETE FROM Roles_Empleados WHERE ID_Empleado = ?';
        connection.query(deleteRolesQuery, [id], (err) => {
            if (err) {
                res.status(500).send('Error al actualizar los roles');
                return;
            }

            const rolesEmpleadosQueries = roles.map(rolId => {
                return new Promise((resolve, reject) => {
                    const query = 'INSERT INTO Roles_Empleados (ID_Empleado, ID_Rol) VALUES (?, ?)';
                    connection.query(query, [id, rolId], (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            });

            Promise.all(rolesEmpleadosQueries)
                .then(() => {
                    res.json({ message: 'Empleado actualizado exitosamente' });
                })
                .catch(err => {
                    res.status(500).send('Error al asignar roles: ' + err);
                });
        });
    });
});

// Eliminar un empleado
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const deleteRolesQuery = 'DELETE FROM Roles_Empleados WHERE ID_Empleado = ?';
    connection.query(deleteRolesQuery, [id], (err) => {
        if (err) {
            res.status(500).send('Error al eliminar roles del empleado');
            return;
        }

        const deleteEmpleadoQuery = 'DELETE FROM Empleados WHERE ID = ?';
        connection.query(deleteEmpleadoQuery, [id], (err) => {
            if (err) {
                res.status(500).send('Error al eliminar el empleado');
            } else {
                res.json({ message: 'Empleado eliminado exitosamente' });
            }
        });
    });
});

module.exports = router;
