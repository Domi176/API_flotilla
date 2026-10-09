const db = require('../config/db');

// Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id_usuario, username, rol, nombre, creado_en FROM usuario'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtener un usuario por ID
exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT id_usuario, username, rol, nombre, creado_en FROM usuario WHERE id_usuario = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Crear usuario
exports.crearUsuario = async (req, res) => {
  try {
    const { username, password, rol, nombre } = req.body;

    if (!username || !password || !nombre) {
      return res.status(400).json({ success: false, mensaje: 'Faltan campos obligatorios' });
    }

    const [result] = await db.query(
      `INSERT INTO usuario (username, password, rol, nombre) VALUES (?, ?, ?, ?)`,
      [username, password, rol || 'trabajador', nombre]
    );

    res.status(201).json({
      success: true,
      mensaje: 'Usuario creado exitosamente',
      id_usuario: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, rol, nombre } = req.body;

    const [result] = await db.query(
      `UPDATE usuario SET username = ?, password = ?, rol = ?, nombre = ? WHERE id_usuario = ?`,
      [username, password, rol, nombre, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
    }

    res.json({ success: true, mensaje: 'Usuario actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
    }

    res.json({ success: true, mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};