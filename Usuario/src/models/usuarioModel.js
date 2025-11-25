const mysql = require('mysql2/promise');

// Configuración del Pool de conexiones
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'usuarios_redes',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * @function obtenerUsuarios
 * @description Obtiene la lista de todos los usuarios registrados.
 * @returns {Promise<object[]>} Array con los usuarios.
 */
async function obtenerUsuarios() {
    try {
        const [rows] = await connection.query('SELECT * FROM usuarios');
        return rows;
    } catch (error) {
        console.error('❌ Error del modelo en obtenerUsuarios:', error.message);
        throw error;
    }
}

/**
 * @function crearUsuarios
 * @description Crea un nuevo usuario en la base de datos.
 * @param {string} nombre 
 * @param {string} apellido 
 * @param {string} email 
 * @param {string} password 
 * @param {string} rol 
 * @param {string} perfil 
 * @returns {Promise<number>} ID del usuario insertado.
 */
async function crearUsuarios(nombre, apellido, email, password, rol, perfil) {
    const sql = 'INSERT INTO usuarios (email, nombre, apellido, contrasenia, rol, perfil) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [email, nombre, apellido, password, rol, perfil];

    try {
        const [result] = await connection.execute(sql, values);
        return result.insertId;
    } catch (error) {
        console.error('❌ Error del modelo en crearUsuarios:', error.message);
        throw error;
    }
}

/**
 * @function obtenerUsuarioPorId
 * @description Busca un usuario por su ID.
 * @param {number} id 
 * @returns {Promise<object|null>} Objeto usuario o null.
 */
async function obtenerUsuarioPorId(id) {
    try {
        const [rows] = await connection.execute('SELECT * FROM usuarios WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('❌ Error del modelo en obtenerUsuarioPorId:', error.message);
        throw error;
    }
}

/**
 * @function editarUsuario
 * @description Actualiza la información de un usuario.
 * @param {object} usuario - Objeto con los datos a actualizar (debe incluir id).
 * @returns {Promise<number>} Número de filas afectadas.
 */
async function editarUsuario(id, nombre, apellido, rol, perfil) {
    try {
        // Nota: Ajusté la query basándome en los campos reales de la tabla usuarios mostrados en el diseño
        const sql = 'UPDATE usuarios SET nombre = ?, apellido = ?, rol = ?, perfil = ? WHERE id = ?';
        const [result] = await connection.execute(sql, [nombre, apellido, rol, perfil, id]);
        return result.affectedRows;
    } catch (error) {
        console.error('❌ Error del modelo en editarUsuario:', error.message);
        throw error;
    }
}

/**
 * @function eliminarUsuario
 * @description Elimina un usuario por su ID.
 * @param {number} id 
 * @returns {Promise<number>} Número de filas afectadas.
 */
async function eliminarUsuario(id) {
    try {
        const [result] = await connection.execute('DELETE FROM usuarios WHERE id = ?', [id]);
        return result.affectedRows;
    } catch (error) {
        console.error('❌ Error del modelo en eliminarUsuario:', error.message);
        throw error;
    }
}


/**
 * @function consultarNombrexId
 * @description Obtiene el nombre completo de un usuario dado su id.
 * @param {number} idUser 
 * @returns {Promise<object|null>} Objeto con nombreCompleto.
 */
async function consultarNombrexId(idUser) {
    try {
        const sql = "SELECT CONCAT(nombre, ' ', apellido) AS nombreCompleto, id FROM usuarios WHERE id = ?";
        const [rows] = await connection.execute(sql, [idUser]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("❌ Error del modelo en consultarNombrexEmail:", error.message);
        throw error;
    }
}


/**
 * @function consultarAreaxId la info de un usuario por email.
 * @param {string} idUser 
 * @returns {Promise<object|null>}
 */
async function consultarAreaxId(idUser) {
    try {
        const [rows] = await connection.execute('SELECT rol AS area, id FROM usuarios WHERE id = ?', [idUser]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('❌ Error del modelo en consultarAreaxId:', error.message);
        throw error;
    }
}

module.exports = {
    crearUsuarios, 
    editarUsuario, 
    eliminarUsuario, 
    obtenerUsuarioPorId,
    obtenerUsuarios, 
    consultarAreaxId, 
    consultarNombrexId
}; 