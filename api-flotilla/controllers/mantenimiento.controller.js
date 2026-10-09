const db = require('../config/db');

// Obtener mantenimientos
exports.obtenerMantenimientos = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, v.placas, v.marca, v.modelo 
      FROM mantenimiento m
      JOIN vehiculo v ON m.id_vehiculo = v.id_vehiculo
      ORDER BY m.fecha_servicio DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtener mantenimientos por ID de Vehículo
exports.obtenerMantenimientosPorVehiculo = async (req, res) => {
  try {
    const { id_vehiculo } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM mantenimiento WHERE id_vehiculo = ? ORDER BY fecha_servicio DESC',
      [id_vehiculo]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Registrar un mantenimiento
exports.crearMantenimiento = async (req, res) => {
  try {
    const { id_vehiculo, tipo, concepto, costo, fecha_servicio } = req.body;

    if (!id_vehiculo || !tipo || !concepto || !costo || !fecha_servicio) {
      return res.status(400).json({ success: false, mensaje: 'Todos los campos son obligatorios' });
    }

    const [result] = await db.query(
      `INSERT INTO mantenimiento (id_vehiculo, tipo, concepto, costo, fecha_servicio)
       VALUES (?, ?, ?, ?, ?)`,
      [id_vehiculo, tipo, concepto, costo, fecha_servicio]
    );

    res.status(201).json({
      success: true,
      mensaje: 'Mantenimiento registrado correctamente',
      id_mantenimiento: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Actualizar un mantenimiento
exports.actualizarMantenimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, concepto, costo, fecha_servicio } = req.body;

    const [result] = await db.query(
      `UPDATE mantenimiento SET tipo = ?, concepto = ?, costo = ?, fecha_servicio = ? WHERE id_mantenimiento = ?`,
      [tipo, concepto, costo, fecha_servicio, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Mantenimiento no encontrado' });
    }

    res.json({ success: true, mensaje: 'Mantenimiento actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Eliminar un mantenimiento
exports.eliminarMantenimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM mantenimiento WHERE id_mantenimiento = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Mantenimiento no encontrado' });
    }

    res.json({ success: true, mensaje: 'Mantenimiento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};