//Sript para crear el modelo que se va a guardar en la base de datos 
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',      // O la IP de tu servidor de BD
    user: 'root',     // ¡Cambia esto por tu usuario de BD!
    password: '', // ¡Cambia esto por tu contraseña!
    database: 'capaproyectos' // El nombre de tu base de datos (por ejemplo, 'ProyectosDB')
};

async function connectDB() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a MySQL establecida correctamente.');
        return connection;
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error.message);
        throw new Error('No se pudo establecer conexión con la base de datos.');
    }
}

/**
 * @async
 * @function crearProyecto
 * @description Inserta un nuevo proyecto en la tabla 'Proyectos'.
 * @param {object} nuevoProyecto - Objeto con los datos del proyecto a crear.
 * @returns {Promise<number>} El ID del proyecto recién creado.
 */
async function crearProyecto(nuevoProyecto) {
    const connection = await connectDB();
    const sql = `
        INSERT INTO Proyectos (
            titulo, organizador, descripcion, estado, url, fechaInicio, fechaFin,
            lucesDep, arteDep, camaraDep, postProdDep, direccionDep
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Desestructuración y mapeo de los datos del objeto para el array de valores.
    const values = [
        nuevoProyecto.titulo,
        nuevoProyecto.organizador,
        nuevoProyecto.descripcion,
        nuevoProyecto.estado, // Debe ser 'activo' o 'finalizado'
        nuevoProyecto.url,
        nuevoProyecto.fechaInicio,
        nuevoProyecto.fechaFin,
        nuevoProyecto.lucesDep,
        nuevoProyecto.arteDep,
        nuevoProyecto.camaraDep,
        nuevoProyecto.postProdDep,
        nuevoProyecto.direccionDep
    ];

    try {
        // El método execute() devuelve un array donde el primer elemento son los resultados
        const [result] = await connection.execute(sql, values);
        return result.insertId; // Devuelve el ID generado por AUTO_INCREMENT
    } catch (error) {
        console.error('Error al crear proyecto:', error);
        throw error;
    } finally {
        await connection.end(); // Cierra la conexión después de la operación
    }
}


/**
 * @async
 * @function actualizarEstadoProyecto
 * @description Actualiza el campo 'estado' de un proyecto específico.
 * @param {number} idProyecto - El ID del proyecto a actualizar.
 * @param {('activo'|'finalizado')} nuevoEstado - El nuevo estado a asignar.
 * @returns {Promise<number>} Número de filas afectadas (0 o 1).
 */
async function actualizarEstadoProyecto(idProyecto, nuevoEstado) {
    const connection = await connectDB();
    const sql = `
        UPDATE Proyectos
        SET estado = ?
        WHERE idProyecto = ?
    `;

    // El tipo ENUM garantiza que 'nuevoEstado' sea uno de los valores permitidos.
    const values = [nuevoEstado, idProyecto];

    try {
        const [result] = await connection.execute(sql, values);
        return result.affectedRows;
    } catch (error) {
        console.error('Error al actualizar el estado del proyecto:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

/**
 * @async
 * @function consultarProyectos
 * @description Consulta todos los proyectos (o una lista filtrada).
 * @returns {Promise<object[]>} Un array con todos los proyectos encontrados.
 */
async function consultarProyectos() {
    const connection = await connectDB();
    // Se recomienda ordenar por fecha de inicio para una mejor visualización.
    const sql = `
        SELECT
            idProyecto, titulo, organizador, estado, url, fechaInicio
        FROM Proyectos
        ORDER BY fechaInicio DESC
    `;

    try {
        // Se usa query() para consultas SELECT simples que no necesitan sanitización por parámetros.
        // Aunque execute() también funciona, query() es más directo para SELECTs sin parámetros.
        const [rows] = await connection.query(sql);
        return rows;
    } catch (error) {
        console.error('Error al consultar proyectos:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

/**
 * @async
 * @function consultarInformacionProyecto
 * @description Consulta la información detallada de un proyecto por su ID.
 * @param {number} idProyecto - El ID del proyecto a consultar.
 * @returns {Promise<object|null>} El objeto del proyecto o null si no se encuentra.
 */
async function consultarInformacionProyecto(idProyecto) {
    const connection = await connectDB();
    // Consulta todos los campos para obtener la información completa.
    const sql = `
        SELECT *
        FROM Proyectos
        WHERE idProyecto = ?
    `;

    try {
        const [rows] = await connection.execute(sql, [idProyecto]);
        // Si se encuentra una fila, devuelve el primer elemento (el proyecto). Si no, devuelve null.
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error al consultar la información del proyecto:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

module.exports = {
    crearProyecto,
    actualizarEstadoProyecto,
    consultarProyectos,
    consultarInformacionProyecto
};