const db = require('../config/db');

// Obtener todos los choferes
exports.obtenerChoferes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM chofer');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtener chofer por ID
exports.obtenerChoferPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM chofer WHERE id_chofer = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, mensaje: 'Chofer no encontrado' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Crear chofer
exports.crearChofer = async (req, res) => {
  try {
    const { nombre, numero_licencia, telefono, estatus } = req.body;

    if (!nombre || !numero_licencia) {
      return res.status(400).json({ success: false, mensaje: 'Nombre y número de licencia son obligatorios' });
    }

    const [result] = await db.query(
      `INSERT INTO chofer (nombre, numero_licencia, telefono, estatus) VALUES (?, ?, ?, ?)`,
      [nombre, numero_licencia, telefono || null, estatus || 'disponible']
    );

    res.status(201).json({
      success: true,
      mensaje: 'Chofer registrado con éxito',
      id_chofer: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Actualizar chofer
exports.actualizarChofer = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, numero_licencia, telefono, estatus } = req.body;

    const [result] = await db.query(
      `UPDATE chofer SET nombre = ?, numero_licencia = ?, telefono = ?, estatus = ? WHERE id_chofer = ?`,
      [nombre, numero_licencia, telefono, estatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Chofer no encontrado' });
    }

    res.json({ success: true, mensaje: 'Chofer actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Eliminar chofer
exports.eliminarChofer = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM chofer WHERE id_chofer = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Chofer no encontrado' });
    }

    res.json({ success: true, mensaje: 'Chofer eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};