const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculo.controller');

router.get('/vehiculos', vehiculoController.obtenerVehiculos);
router.get('/vehiculos/:id', vehiculoController.obtenerVehiculoPorId);
router.post('/vehiculos', vehiculoController.crearVehiculo);
router.put('/vehiculos/:id', vehiculoController.actualizarVehiculo);
router.delete('/vehiculos/:id', vehiculoController.eliminarVehiculo);

module.exports = router;