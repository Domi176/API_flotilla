const db = require('../config/db');

// Obtener todas las asignaciones detalladas
exports.obtenerAsignaciones = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, v.placas, v.marca, v.modelo, c.nombre AS nombre_chofer, c.numero_licencia
      FROM asignacion a
      JOIN vehiculo v ON a.id_vehiculo = v.id_vehiculo
      JOIN chofer c ON a.id_chofer = c.id_chofer
      ORDER BY a.fecha_inicio DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Crear nueva asignación
exports.crearAsignacion = async (req, res) => {
  try {
    const { id_vehiculo, id_chofer, observaciones } = req.body;

    if (!id_vehiculo || !id_chofer) {
      return res.status(400).json({ success: false, mensaje: 'Vehículo y Chofer son obligatorios' });
    }

    const [result] = await db.query(
      `INSERT INTO asignacion (id_vehiculo, id_chofer, observaciones) VALUES (?, ?, ?)`,
      [id_vehiculo, id_chofer, observaciones || null]
    );

    // Opcional: Actualizar estatus del chofer a 'asignado'
    await db.query(`UPDATE chofer SET estatus = 'asignado' WHERE id_chofer = ?`, [id_chofer]);

    res.status(201).json({
      success: true,
      mensaje: 'Asignación creada correctamente',
      id_asignacion: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Finalizar asignación (marcar fecha_fin)
exports.finalizarAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_fin, observaciones } = req.body;

    const fechaTermino = fecha_fin || new Date();

    const [result] = await db.query(
      `UPDATE asignacion SET fecha_fin = ?, observaciones = COALESCE(?, observaciones) WHERE id_asignacion = ?`,
      [fechaTermino, observaciones || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Asignación no encontrada' });
    }

    // Liberar estatus del chofer
    const [asig] = await db.query('SELECT id_chofer FROM asignacion WHERE id_asignacion = ?', [id]);
    if (asig.length > 0) {
      await db.query(`UPDATE chofer SET estatus = 'disponible' WHERE id_chofer = ?`, [asig[0].id_chofer]);
    }

    res.json({ success: true, mensaje: 'Asignación finalizada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Eliminar asignación
exports.eliminarAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM asignacion WHERE id_asignacion = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Asignación no encontrada' });
    }

    res.json({ success: true, mensaje: 'Asignación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};