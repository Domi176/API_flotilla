const express = require('express');
const router = express.Router();
const choferController = require('../controllers/chofer.controller');

router.get('/choferes', choferController.obtenerChoferes);
router.get('/choferes/:id', choferController.obtenerChoferPorId);
router.post('/choferes', choferController.crearChofer);
router.put('/choferes/:id', choferController.actualizarChofer);
router.delete('/choferes/:id', choferController.eliminarChofer);

module.exports = router;