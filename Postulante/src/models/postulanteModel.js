// src/models/postulanteModel.js
/**
 * Modelo: POSTULANTE
 * Estructura de tabla:
 *  - idPost INT UNSIGNED PK AI
 *  - usuarioPos VARCHAR(255) NOT NULL
 *  - tituloConvocatoria VARCHAR(150) NOT NULL
 *  - fechaPost DATETIME                (sin DEFAULT en BD)
 *  - mensajePres VARCHAR(500) NULL
 *  - estadoPost ENUM('aceptado','libre') NOT NULL DEFAULT 'libre'
 */

const mysql = require('mysql2/promise');

// Pool de conexión (mismo estilo que convocatoriasModel.js)
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'proyecto', // usa el mismo esquema de tu ejemplo
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ---------------- Utilidades locales ----------------
const ESTADOS_VALIDOS = new Set(['aceptado', 'libre']);

/**
 * Normaliza/valida el estado contra el ENUM de la BD.
 * Si viene vacío o inválido, fuerza 'libre'.
 */
function sanitizeEstado(estado) {
  const e = String(estado || '').toLowerCase().trim();
  return ESTADOS_VALIDOS.has(e) ? e : 'libre';
}

// ---------- QUERIES (tabla: POSTULANTE) ----------

/**
 * Consultar postulaciones (lista)
 * Ordena por fechaPost DESC, idPost DESC
 * @returns {Promise<Array>}
 */
async function obtenerPostulaciones() {
  const [rows] = await connection.query(
    'SELECT * FROM `POSTULANTE` ORDER BY `fechaPost` DESC, `idPost` DESC'
  );
  return rows;
}

/**
 * Consultar una postulación por id
 * @param {number} idPost
 * @returns {Promise<Object|null>}
 */
async function obtenerPostulacionPorId(idPost) {
  const [rows] = await connection.query(
    'SELECT * FROM `POSTULANTE` WHERE `idPost` = ? LIMIT 1',
    [idPost]
  );
  return rows[0] || null;
}

/**
 * Crear postulación
 * Nota: la columna fechaPost NO tiene DEFAULT en la BD,
 * por lo que aquí usamos COALESCE(?, NOW()) para permitir
 * que el backend ponga la fecha actual si no llega desde el cliente.
 * @param {Object} payload
 * @param {string} payload.usuarioPos
 * @param {string} payload.tituloConvocatoria
 * @param {string|Date} [payload.fechaPost]  - opcional
 * @param {string|null} [payload.mensajePres]
 * @param {'aceptado'|'libre'} [payload.estadoPost='libre']
 * @returns {Promise<number>} idPost insertado
 */
async function crearPostulacion({
  usuarioPos,
  tituloConvocatoria,
  fechaPost = null,
  mensajePres = null,
  estadoPost = 'libre',
}) {
  // Validaciones mínimas
  if (!usuarioPos || !tituloConvocatoria) {
    throw new Error('usuarioPos y tituloConvocatoria son obligatorios');
  }

  const estado = sanitizeEstado(estadoPost);

  // Insert parametrizado (usa NOW() si fechaPost no viene)
  const [result] = await connection.query(
    `INSERT INTO \`POSTULANTE\`
      (usuarioPos, tituloConvocatoria, fechaPost, mensajePres, estadoPost)
     VALUES (?, ?, COALESCE(?, NOW()), ?, ?)`,
    [usuarioPos, tituloConvocatoria, fechaPost, mensajePres, estado]
  );

  return result.insertId;
}

/**
 * Actualizar el estado de la postulación
 * Solo modifica la columna estadoPost.
 * @param {number} idPost
 * @param {'aceptado'|'libre'} nuevoEstado
 * @returns {Promise<number>} 0 o 1 filas afectadas
 */
async function actualizarEstadoPostulacion(idPost, nuevoEstado) {
  const estado = sanitizeEstado(nuevoEstado);
  const [result] = await connection.query(
    'UPDATE `POSTULANTE` SET `estadoPost` = ? WHERE `idPost` = ?',
    [estado, idPost]
  );
  return result.affectedRows; // 0 o 1
}

module.exports = {
  obtenerPostulaciones,
  obtenerPostulacionPorId,
  crearPostulacion,
  actualizarEstadoPostulacion,
};
