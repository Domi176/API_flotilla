const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignacion.controller');

router.get('/asignaciones', asignacionController.obtenerAsignaciones);
router.post('/asignaciones', asignacionController.crearAsignacion);
router.put('/asignaciones/:id/finalizar', asignacionController.finalizarAsignacion);
router.delete('/asignaciones/:id', asignacionController.eliminarAsignacion);

module.exports = router;