const express = require('express');
const connection = require('../db');

const router = express.Router();

// Obtener todas las órdenes
router.get('/', (req, res) => {
    const query = 'SELECT o.*, u.Nombre as UsuarioNombre FROM Ordenes o JOIN Usuarios u ON o.ID_Usuario = u.ID';
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Error al obtener órdenes');
        } else {
            res.json(results);
        }
    });
});

// Obtener una orden por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT o.*, u.Nombre as UsuarioNombre FROM Ordenes o JOIN Usuarios u ON o.ID_Usuario = u.ID WHERE o.ID = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).send('Error al obtener la orden');
        } else if (results.length === 0) {
            res.status(404).send('Orden no encontrada');
        } else {
            res.json(results[0]);
        }
    });
});

// Crear una nueva orden
router.post('/', (req, res) => {
    const { ID_Usuario, Fecha_Trabajo, Fecha_Entrega, Ubicacion, Total, Saldo, Estado_Orden, Estado_Pago, Metodo_de_Pago, Servicios, Empleados } = req.body;
    const Fecha_Pedido = new Date();
    const query = 'INSERT INTO Ordenes (ID_Usuario, Fecha_Pedido, Fecha_Trabajo, Fecha_Entrega, Ubicacion, Total, Saldo, Estado_Orden, Estado_Pago, Metodo_de_Pago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [ID_Usuario, Fecha_Pedido, Fecha_Trabajo, Fecha_Entrega, Ubicacion, Total, Saldo, Estado_Orden, Estado_Pago, Metodo_de_Pago], (err, results) => {
        if (err) {
            res.status(500).send('Error al crear la orden');
            return;
        }

        const ID_Orden = results.insertId;

        // Insertar en Detalle_Ordenes
        const detalleOrdenesQueries = Servicios.map(servicio => {
            return new Promise((resolve, reject) => {
                const query = 'INSERT INTO Detalle_Ordenes (ID_Orden, ID_Servicio, Cantidad) VALUES (?, ?, ?)';
                connection.query(query, [ID_Orden, servicio.ID_Servicio, servicio.Cantidad], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });

        // Insertar en Empleados_Ordenes
        const empleadosOrdenesQueries = Empleados.map(empleado => {
            return new Promise((resolve, reject) => {
                const query = 'INSERT INTO Empleados_Ordenes (ID_Orden, ID_Empleado) VALUES (?, ?)';
                connection.query(query, [ID_Orden, empleado.ID_Empleado], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });

        // Insertar en Trabajo_Pendiente
        const trabajoPendienteQueries = Empleados.map(empleado => {
            return new Promise((resolve, reject) => {
                const query = 'INSERT INTO Trabajo_Pendiente (ID_Empleado, ID_Orden, Fecha_Trabajo, Fecha_Entrega, Estado) VALUES (?, ?, ?, ?, "Pendiente")';
                connection.query(query, [empleado.ID_Empleado, ID_Orden, Fecha_Trabajo, Fecha_Entrega], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });

        Promise.all([...detalleOrdenesQueries, ...empleadosOrdenesQueries, ...trabajoPendienteQueries])
            .then(() => {
                res.json({ message: 'Orden creada exitosamente' });
            })
            .catch(err => {
                res.status(500).send('Error al crear la orden: ' + err);
            });
    });
});

// Actualizar una orden
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { Fecha_Trabajo, Fecha_Entrega, Ubicacion, Total, Saldo, Estado_Orden, Estado_Pago, Metodo_de_Pago } = req.body;
    const query = 'UPDATE Ordenes SET Fecha_Trabajo = ?, Fecha_Entrega = ?, Ubicacion = ?, Total = ?, Saldo = ?, Estado_Orden = ?, Estado_Pago = ?, Metodo_de_Pago = ? WHERE ID = ?';
    connection.query(query, [Fecha_Trabajo, Fecha_Entrega, Ubicacion, Total, Saldo, Estado_Orden, Estado_Pago, Metodo_de_Pago, id], (err) => {
        if (err) {
            res.status(500).send('Error al actualizar la orden');
        } else {
            res.json({ message: 'Orden actualizada exitosamente' });
        }
    });
});

// Eliminar una orden
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const deleteDetalleOrdenesQuery = 'DELETE FROM Detalle_Ordenes WHERE ID_Orden = ?';
    connection.query(deleteDetalleOrdenesQuery, [id], (err) => {
        if (err) {
            res.status(500).send('Error al eliminar los detalles de la orden');
            return;
        }

        const deleteEmpleadosOrdenesQuery = 'DELETE FROM Empleados_Ordenes WHERE ID_Orden = ?';
        connection.query(deleteEmpleadosOrdenesQuery, [id], (err) => {
            if (err) {
                res.status(500).send('Error al eliminar los empleados de la orden');
                return;
            }

            const deleteTrabajoPendienteQuery = 'DELETE FROM Trabajo_Pendiente WHERE ID_Orden = ?';
            connection.query(deleteTrabajoPendienteQuery, [id], (err) => {
                if (err) {
                    res.status(500).send('Error al eliminar el trabajo pendiente de la orden');
                    return;
                }

                const deleteOrdenQuery = 'DELETE FROM Ordenes WHERE ID = ?';
                connection.query(deleteOrdenQuery, [id], (err) => {
                    if (err) {
                        res.status(500).send('Error al eliminar la orden');
                    } else {
                        res.json({ message: 'Orden eliminada exitosamente' });
                    }
                });
            });
        });
    });
});

module.exports = router;
