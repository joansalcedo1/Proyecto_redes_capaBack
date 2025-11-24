const mysql = require('mysql2/promise');

// Pool de conexión 
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'postulaciones', // usa el mismo esquema de tu ejemplo
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ---------------- Utilidades locales ----------------
const ESTADOS_VALIDOS = new Set(['aceptado', 'libre', 'rechazado', 'en espera']);

/**
 * Normaliza/valida el estado contra el ENUM de la BD.
 * Si viene vacío o inválido, fuerza 'libre'.
 */
function sanitizeEstado(estado) {
  const e = String(estado || '').toLowerCase().trim();
  return ESTADOS_VALIDOS.has(e) ? e : 'libre';
}

/**
 * @function obtenerPostulaciones
 * @description Obtiene todas las postulaciones ordenadas por fecha.
 */
async function obtenerPostulaciones() {
    try {
        const [rows] = await connection.query('SELECT * FROM postulante ORDER BY fechaPost DESC');
        return rows;
    } catch (error) {
        console.error('❌ Error del modelo en obtenerPostulaciones:', error.message);
        throw error;
    }
}

/**
 * @function obtenerPostulacionPorId
 * @description Obtiene una postulación por ID.
 */
async function obtenerPostulacionPorId(idPost) {
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM postulante WHERE idPost = ? LIMIT 1',
            [idPost]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('❌ Error del modelo en obtenerPostulacionPorId:', error.message);
        throw error;
    }
}

/**
 * @function crearPostulacion
 * @description Crea un nuevo registro de postulación.
 */
async function crearPostulacion({ usuarioPos, tituloConvocatoria, mensajePres, estadoPost }) {
    const estado = sanitizeEstado(estadoPost);
    // Usamos NOW() de MySQL para la fecha si no se provee lógica en backend
    const sql = `
        INSERT INTO postulante (usuarioPos, tituloConvocatoria, fechaPost, mensajePres, estadoPost)
        VALUES (?, ?, NOW(), ?, ?)
    `;
    const values = [usuarioPos, tituloConvocatoria, mensajePres, estado];

    try {
        const [result] = await connection.execute(sql, values);
        return result.insertId;
    } catch (error) {
        console.error('❌ Error del modelo en crearPostulacion:', error.message);
        throw error;
    }
}

/**
 * @function actualizarEstadoPostulacion
 * @description Actualiza el estado de una postulación.
 */
async function actualizarEstadoPostulacion(idPost, nuevoEstado) {
    const estado = sanitizeEstado(nuevoEstado);
    try {
        const [result] = await connection.execute(
            'UPDATE postulante SET estadoPost = ? WHERE idPost = ?',
            [estado, idPost]
        );
        return result.affectedRows;
    } catch (error) {
        console.error('❌ Error del modelo en actualizarEstadoPostulacion:', error.message);
        throw error;
    }
}

module.exports = {
  obtenerPostulaciones,
  obtenerPostulacionPorId,
  crearPostulacion,
  actualizarEstadoPostulacion,
};
