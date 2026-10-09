const db = require('../config/db');

// 1. Obtener todos los vehículos (GET)
exports.obtenerVehiculos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vehiculo');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Obtener un vehículo por ID (GET)
exports.obtenerVehiculoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM vehiculo WHERE id_vehiculo = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, mensaje: 'Vehículo no encontrado' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Crear un nuevo vehículo (POST)
exports.crearVehiculo = async (req, res) => {
  try {
    const { placas, marca, modelo, anio, kilometraje_actual, estado } = req.body;
    
    if (!placas || !marca || !modelo || !anio) {
      return res.status(400).json({ success: false, mensaje: 'Campos requeridos faltantes' });
    }

    const [result] = await db.query(
      `INSERT INTO vehiculo (placas, marca, modelo, anio, kilometraje_actual, estado) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [placas, marca, modelo, anio, kilometraje_actual || 0, estado || 'activo']
    );

    res.status(201).json({
      success: true,
      mensaje: 'Vehículo registrado exitosamente',
      id_vehiculo: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Actualizar un vehículo (PUT)
exports.actualizarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { placas, marca, modelo, anio, kilometraje_actual, estado } = req.body;

    const [result] = await db.query(
      `UPDATE vehiculo 
       SET placas = ?, marca = ?, modelo = ?, anio = ?, kilometraje_actual = ?, estado = ? 
       WHERE id_vehiculo = ?`,
      [placas, marca, modelo, anio, kilometraje_actual, estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Vehículo no encontrado' });
    }

    res.json({ success: true, mensaje: 'Vehículo actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. Eliminar un vehículo (DELETE)
exports.eliminarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM vehiculo WHERE id_vehiculo = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Vehículo no encontrado' });
    }

    res.json({ success: true, mensaje: 'Vehículo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};