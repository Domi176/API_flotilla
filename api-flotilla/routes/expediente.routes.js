const express = require('express');
const router = express.Router();
const expedienteController = require('../controllers/expediente.controller');

router.get('/expedientes', expedienteController.obtenerExpedientes);
router.get('/expedientes/vehiculo/:id_vehiculo', expedienteController.obtenerExpedientePorVehiculo);
router.post('/expedientes', expedienteController.crearExpediente);
router.put('/expedientes/:id', expedienteController.actualizarExpediente);
router.delete('/expedientes/:id', expedienteController.eliminarExpediente);

module.exports = router;