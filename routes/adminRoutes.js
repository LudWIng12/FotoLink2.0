const express = require('express');
const bcrypt = require('bcryptjs');
const connection = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
    const query = `SELECT a.ID, a.Nombre, a.Correo, a.Direccion, a.Latitud, a.Longitud, r.Nombre as Rol FROM Administradores a JOIN Roles r ON a.ID_Rol = r.ID`;
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener administradores' });
        }
        res.json(results);
    });
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = `SELECT a.ID, a.Nombre, a.Correo, a.Direccion, a.Latitud, a.Longitud, r.Nombre as Rol FROM Administradores a JOIN Roles r ON a.ID_Rol = r.ID WHERE a.ID = ?`;
    connection.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener el administrador' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Administrador no encontrado' });
        }
        res.json(results[0]);
    });
});

router.post('/', async (req, res) => {
    const { nombre, correo, contraseña, direccion, latitud, longitud } = req.body;
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const getRolIdQuery = 'SELECT ID FROM Roles WHERE Nombre = "Administrador"';
    connection.query(getRolIdQuery, (err, results) => {
        if (err) {
            res.status(500).send('Error al obtener el rol');
            return;
        }

        if (results.length === 0) {
            res.status(400).send('Rol no encontrado');
            return;
        }

        const rolId = results[0].ID;
        const query = `INSERT INTO Administradores (Nombre, Correo, Contraseña, Direccion, Latitud, Longitud, ID_Rol) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        connection.query(query, [nombre, correo, hashedPassword, direccion, latitud, longitud, rolId], (err, results) => {
            if (err) {
                if (err.sqlState === '45000') {
                    res.status(400).send(err.sqlMessage); // El mensaje personalizado del trigger
                } else {
                    res.status(500).send('Error al crear el administrador');
                }
            } else {
                res.json({ message: 'Administrador creado exitosamente' });
            }
        });
    });
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, correo, contraseña, direccion, latitud, longitud } = req.body;
    let query, queryParams;

    if (contraseña) {
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        query = `UPDATE Administradores SET Nombre = ?, Correo = ?, Contraseña = ?, Direccion = ?, Latitud = ?, Longitud = ? WHERE ID = ?`;
        queryParams = [nombre, correo, hashedPassword, direccion, latitud, longitud, id];
    } else {
        query = `UPDATE Administradores SET Nombre = ?, Correo = ?, Direccion = ?, Latitud = ?, Longitud = ? WHERE ID = ?`;
        queryParams = [nombre, correo, direccion, latitud, longitud, id];
    }

    connection.query(query, queryParams, (err, results) => {
        if (err) {
            if (err.sqlState === '45000') {
                res.status(400).send(err.sqlMessage); // El mensaje personalizado del trigger
            } else {
                res.status(500).send('Error al actualizar el administrador');
            }
        } else {
            res.json({ message: 'Administrador actualizado exitosamente' });
        }
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM Administradores WHERE ID = ?`;
    connection.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).send('Error al eliminar el administrador');
        } else {
            res.json({ message: 'Administrador eliminado exitosamente' });
        }
    });
});

module.exports = router;
