const express = require('express');
const router = express.Router();
const mantenimientoController = require('../controllers/mantenimiento.controller');

router.get('/mantenimientos', mantenimientoController.obtenerMantenimientos);
router.get('/mantenimientos/vehiculo/:id_vehiculo', mantenimientoController.obtenerMantenimientosPorVehiculo);
router.post('/mantenimientos', mantenimientoController.crearMantenimiento);
router.put('/mantenimientos/:id', mantenimientoController.actualizarMantenimiento);
router.delete('/mantenimientos/:id', mantenimientoController.eliminarMantenimiento);

module.exports = router;