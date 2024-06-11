const express = require('express');
const bcrypt = require('bcryptjs');
const connection = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { nombre, correo, contraseña, direccion, telefono, latitud, longitud } = req.body;
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const getRolIdQuery = 'SELECT ID FROM Roles WHERE Nombre = "Usuario"';
    connection.query(getRolIdQuery, (err, results) => {
        if (err) {
            res.status(500).send('Error en el registro');
            return;
        }

        const rolId = results[0].ID;

        const query = 'INSERT INTO Usuarios (Nombre, Correo, Contraseña, Direccion, Telefono, Latitud, Longitud, ID_Rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(query, [nombre, correo, hashedPassword, direccion, telefono, latitud, longitud, rolId], (err, results) => {
            if (err) {
                res.status(500).send('Error en el registro');
            } else {
                res.send('Registro exitoso');
            }
        });
    });
});

router.post('/login', (req, res) => {
    const { correo, contraseña } = req.body;

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

    verifyCredentials('Administradores', (user) => {
        if (user) {
            req.session.userId = user.ID;
            req.session.userName = user.Nombre;
            req.session.userRole = 'Administrador';
            res.json({ message: `Login exitoso. Bienvenido ${user.Nombre}`, user, redirect: '/admin' });
        } else {
            verifyCredentials('Empleados', (user) => {
                if (user) {
                    req.session.userId = user.ID;
                    req.session.userName = user.Nombre;
                    req.session.userRole = 'Empleado';
                    res.json({ message: `Login exitoso. Bienvenido ${user.Nombre}`, user, redirect: '/empleado' });
                } else {
                    verifyCredentials('Usuarios', (user) => {
                        if (user) {
                            req.session.userId = user.ID;
                            req.session.userName = user.Nombre;
                            req.session.userRole = 'Usuario';
                            res.json({ message: `Login exitoso. Bienvenido ${user.Nombre}`, user, redirect: '/usuario' });
                        } else {
                            res.status(404).send('No se encontró una cuenta con ese correo');
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;
