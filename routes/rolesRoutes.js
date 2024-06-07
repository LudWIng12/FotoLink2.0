// rolesRoutes.js
const express = require('express');
const connection = require('../db');

const router = express.Router();

// Obtener todos los roles
router.get('/', (req, res) => {
    const query = 'SELECT * FROM Roles';
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Error al obtener roles');
        } else {
            res.json(results);
        }
    });
});

module.exports = router;
