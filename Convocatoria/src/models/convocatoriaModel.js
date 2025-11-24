const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'convocatoria',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * @function createConvocatoria
 * @description Inserta una nueva convocatoria en la base de datos.
 */
async function createConvocatoria(tituloCon, descripcion, areaRequerida, estado, fecha_cierre, numPersSolicitad, tituloProyecto) {
    const sql = `
        INSERT INTO convocatoria 
        (tituloCon, descripcion, areaRequerida, estado, fecha_cierre, numPersSolicitad, tituloProyecto)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [tituloCon, descripcion, areaRequerida, estado, fecha_cierre, numPersSolicitad, tituloProyecto];

    try {
        const [result] = await connection.execute(sql, values);
        return result.insertId;
    } catch (error) {
        console.error('❌ Error del modelo en createConvocatoria:', error.message);
        throw error;
    }
}


/**
 * @function consultConvocatoria
 * @description Obtiene todas las convocatorias.
 */
async function consultConvocatoria() {
    try {
        const [rows] = await connection.query('SELECT * FROM convocatoria');
        return rows;
    } catch (error) {
        console.error('❌ Error del modelo en consultConvocatoria:', error.message);
        throw error;
    }
}
/**
 * @function updateEstadoConvocatoria
 * @description Actualiza el estado de una convocatoria por ID.
 */
async function updateEstadoConvocatoria(idConvocatoria, estado) {
    try {
        const [result] = await connection.execute(
            'UPDATE convocatoria SET estado = ? WHERE idConvocatoria = ?',
            [estado, idConvocatoria]
        );
        return result.affectedRows;
    } catch (error) {
        console.error('❌ Error del modelo en updateEstadoConvocatoria:', error.message);
        throw error;
    }
}

/**
 * @function consultInformacionConvocatoria
 * @description Obtiene el detalle de una convocatoria por ID.
 */
async function consultInformacionConvocatoria(idConvocatoria) {
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM convocatoria WHERE idConvocatoria = ?',
            [idConvocatoria]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('❌ Error del modelo en consultInformacionConvocatoria:', error.message);
        throw error;
    }
}

/**
 * @function createParticipante
 * @description Crea un registro en la tabla participante.
 */
async function createParticipante(nombre, idConvocatoria) {
    try {
        const [result] = await connection.execute(
            'INSERT INTO participante (nombre, convID) VALUES (?, ?)',
            [nombre, idConvocatoria]
        );
        return result.insertId;
    } catch (error) {
        console.error('❌ Error del modelo en createParticipante:', error.message);
        throw error;
    }
}

/**
 * @function consultParticipante
 * @description Consulta los participantes de una convocatoria específica.
 */
async function consultParticipante(idConvocatoria) {
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM participante WHERE convID = ?',
            [idConvocatoria]
        );
        return rows;
    } catch (error) {
        console.error('❌ Error del modelo en consultParticipante:', error.message);
        throw error;
    }
}

module.exports = {
    createConvocatoria,
    consultConvocatoria,
    updateEstadoConvocatoria,
    consultInformacionConvocatoria,
    createParticipante,
    consultParticipante
};