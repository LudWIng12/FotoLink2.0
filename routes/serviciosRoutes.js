const express = require('express');
const connection = require('../db');

const router = express.Router();

// Obtener todos los servicios
router.get('/', (req, res) => {
    const query = 'SELECT * FROM Servicios';
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Error al obtener servicios');
        } else {
            res.json(results);
        }
    });
});

// Obtener un servicio por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM Servicios WHERE ID = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).send('Error al obtener el servicio');
        } else if (results.length === 0) {
            res.status(404).send('Servicio no encontrado');
        } else {
            res.json(results[0]);
        }
    });
});

// Crear un nuevo servicio
router.post('/', (req, res) => {
    const { nombre, descripcion, precio } = req.body;
    const query = 'INSERT INTO Servicios (Nombre, Descripcion, Precio) VALUES (?, ?, ?)';
    connection.query(query, [nombre, descripcion, precio], (err, results) => {
        if (err) {
            res.status(500).send('Error al crear el servicio');
        } else {
            res.json({ message: 'Servicio creado exitosamente' });
        }
    });
});

// Actualizar un servicio
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;
    const query = 'UPDATE Servicios SET Nombre = ?, Descripcion = ?, Precio = ? WHERE ID = ?';
    connection.query(query, [nombre, descripcion, precio, id], (err) => {
        if (err) {
            res.status(500).send('Error al actualizar el servicio');
        } else {
            res.json({ message: 'Servicio actualizado exitosamente' });
        }
    });
});

// Eliminar un servicio
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Servicios WHERE ID = ?';
    connection.query(query, [id], (err) => {
        if (err) {
            res.status(500).send('Error al eliminar el servicio');
        } else {
            res.json({ message: 'Servicio eliminado exitosamente' });
        }
    });
});

module.exports = router;
