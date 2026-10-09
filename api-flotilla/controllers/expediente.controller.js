const db = require('../config/db');

// Obtener todos los expedientes técnicos
exports.obtenerExpedientes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, v.placas, v.marca, v.modelo 
      FROM expediente_tecnico e
      JOIN vehiculo v ON e.id_vehiculo = v.id_vehiculo
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtener expediente por ID o por ID de Vehículo
exports.obtenerExpedientePorVehiculo = async (req, res) => {
  try {
    const { id_vehiculo } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM expediente_tecnico WHERE id_vehiculo = ?',
      [id_vehiculo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, mensaje: 'Expediente no encontrado para este vehículo' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Crear expediente técnico
exports.crearExpediente = async (req, res) => {
  try {
    const { id_vehiculo, numero_serie, aseguradora, numero_poliza, vigencia_seguro } = req.body;

    if (!id_vehiculo || !numero_serie || !aseguradora || !numero_poliza || !vigencia_seguro) {
      return res.status(400).json({ success: false, mensaje: 'Campos requeridos faltantes' });
    }

    const [result] = await db.query(
      `INSERT INTO expediente_tecnico (id_vehiculo, numero_serie, aseguradora, numero_poliza, vigencia_seguro)
       VALUES (?, ?, ?, ?, ?)`,
      [id_vehiculo, numero_serie, aseguradora, numero_poliza, vigencia_seguro]
    );

    res.status(201).json({
      success: true,
      mensaje: 'Expediente técnico creado con éxito',
      id_expediente: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Actualizar expediente técnico
exports.actualizarExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero_serie, aseguradora, numero_poliza, vigencia_seguro } = req.body;

    const [result] = await db.query(
      `UPDATE expediente_tecnico 
       SET numero_serie = ?, aseguradora = ?, numero_poliza = ?, vigencia_seguro = ?
       WHERE id_expediente = ?`,
      [numero_serie, aseguradora, numero_poliza, vigencia_seguro, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Expediente no encontrado' });
    }

    res.json({ success: true, mensaje: 'Expediente técnico actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Eliminar expediente técnico
exports.eliminarExpediente = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM expediente_tecnico WHERE id_expediente = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Expediente no encontrado' });
    }

    res.json({ success: true, mensaje: 'Expediente técnico eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};