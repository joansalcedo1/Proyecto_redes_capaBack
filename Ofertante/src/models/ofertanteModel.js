const mysql = require('mysql2/promise');

// Configuración del Pool de conexiones
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ofertante',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * @function obtenerOfertas
 * @description Obtiene todas las ofertas registradas en la base de datos.
 * @returns {Promise<object[]>} Lista de ofertas.
 */
// Obtener todas las ofertas
async function obtenerOfertas() {
  try {
        const [rows] = await connection.query('SELECT * FROM ofertante');
        return rows;
    } catch (error) {
        console.error('❌ Error del modelo en obtenerOfertas:', error.message);
        throw error;
    }
}

/**
 * @function obtenerOfertaPorEstado
 * @description Busca una ofertas por su Estado.
 * @param {number} estado - estado de la oferta.
 * @returns {Promise<object[]>} Lista de ofertas.
 */
async function obtenerOfertaPorEstado(estado) {
  try {
        const [rows] = await connection.execute(
            'SELECT * FROM ofertante WHERE estado_of = ?',
            [estado]
        );
        return rows;
    } catch (error) {
        console.error('❌ Error del modelo en obtenerOfertaPorEstado:', error.message);
        throw error;
    }
}

/**
 * @function obtenerOfertaPorId
 * @description Busca una oferta específica por su ID.
 * @param {number} id_oferta - ID de la oferta.
 * @returns {Promise<object|null>} La oferta encontrada o null.
 */
async function obtenerOfertaPorId(id_oferta) {
  try {
        const [rows] = await connection.execute(
            'SELECT * FROM ofertante WHERE id_oferta = ?',
            [id_oferta]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('❌ Error del modelo en obtenerOfertaPorId:', error.message);
        throw error;
    }
}

/**
 * @function crearOferta
 * @description Crea una nueva oferta en la base de datos.
 * @param {string} nombre_usuario 
 * @param {string} area 
 * @param {string} fecha_inicio 
 * @param {string} fecha_fin 
 * @param {string} estado_of 
 * @returns {Promise<number>} ID de la oferta insertada.
 */
async function crearOferta(nombre_usuario, area, fecha_inicio, fecha_fin, estado_of) {
    const sql = `
        INSERT INTO ofertante (nombre_usuario, area, fecha_inicio, fecha_fin, estado_of) 
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [nombre_usuario, area, fecha_inicio, fecha_fin, estado_of || 'disponible'];

    try {
        const [result] = await connection.execute(sql, values);
        return result.insertId;
    } catch (error) {
        console.error('❌ Error del modelo en crearOferta:', error.message);
        throw error;
    }
}

/**
 * @function actualizarEstadoOferta
 * @description Actualiza estado y opcionalmente la columna 'convocatoria' (varchar).
 */
async function actualizarEstadoOferta(id_oferta, estado_of, convocatoriaTitulo = null) {
    try {
        let sql, params;
        // Si viene el título de la convocatoria, lo actualizamos (Caso: Solicitado)
        if (convocatoriaTitulo) {
            sql = 'UPDATE ofertante SET estado_of = ?, convocatoria = ? WHERE id_oferta = ?';
            params = [estado_of, convocatoriaTitulo, id_oferta];
        } else {
            // Solo actualizamos estado (Caso: Confirmado/Rechazado por usuario)
            sql = 'UPDATE ofertante SET estado_of = ? WHERE id_oferta = ?';
            params = [estado_of, id_oferta];
        }
        
        const [result] = await connection.execute(sql, params);
        return result.affectedRows;
    } catch (error) {
        console.error('❌ Error del modelo en actualizarEstadoOferta:', error.message);
        throw error;
    }
}

/**
 * @function eliminarOferta
 * @description Elimina una oferta por su ID.
 * @param {number} id_oferta 
 * @returns {Promise<number>} Número de filas afectadas.
 */
async function eliminarOferta(id_oferta) {
    try {
        const [result] = await connection.execute(
            'DELETE FROM ofertante WHERE id_oferta = ?',
            [id_oferta]
        );
        return result.affectedRows;
    } catch (error) {
        console.error('❌ Error del modelo en eliminarOferta:', error.message);
        throw error;
    }
}

module.exports = {
  obtenerOfertas,
  obtenerOfertaPorEstado,
  obtenerOfertaPorId,
  crearOferta,
  actualizarEstadoOferta,
  eliminarOferta
};