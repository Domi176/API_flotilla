const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usuarioRoutes = require('./routes/usuario.routes');
const choferRoutes = require('./routes/chofer.routes');
const vehiculoRoutes = require('./routes/vehiculo.routes');
const expedienteRoutes = require('./routes/expediente.routes');
const mantenimientoRoutes = require('./routes/mantenimiento.routes');
const asignacionRoutes = require('./routes/asignacion.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Flotilla activa',
    endpoints: {
      usuarios: '/usuarios', 
      choferes: '/choferes',
      vehiculos: '/vehiculos',
      expedientes: '/expedientes',
      mantenimientos: '/mantenimientos',
      asignaciones: '/asignaciones'
    }
  });
});

app.use(usuarioRoutes);
app.use(choferRoutes);
app.use(vehiculoRoutes);
app.use(expedienteRoutes);
app.use(mantenimientoRoutes);
app.use(asignacionRoutes);

app.use((err, req, res, next) => {
  console.error('Error del servidor:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
