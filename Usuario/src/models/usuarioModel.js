//Sript para crear el modelo que se va a guardar en la base de datos 

const mysql = require('mysql2/promise');
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'usuarios_redes',
    port: 3307
});

async function obtenerUsuarios() {
    try {
        const result = await connection.query('SELECT * FROM usuarios');
        return result[0];
    } catch (error) {
        console.error('Error del modelo en obtenerUsuarios:', error);
        throw error;
    }
}

async function crearUsuarios(nombre, apellido, email, password, rol, perfil) {
    try {
        const result = await connection.query('INSERT INTO usuarios VALUES(null,?,?,?,?,?,?)', [email, nombre, apellido, password, rol, perfil]);
        return result;
    } catch (error) {
        console.error('Error del modelo en crearUsuarios:', error);
        throw error;
    }
}
//id	nombre	apellido	email	password	rol	
async function obtenerUsuarioPorId(id) {
    try {
        const result = await connection.query(
            'SELECT * FROM usarios WHERE id = ?',
            [id]
        );
        return result[0][0]; // devuelve solo el primer producto
    } catch (error) {
        console.error('Error del modelo en obtenerUsuarioPorId:', error);
        throw error;
    }
}

async function editarUsuario(id, nombre, precio, cantidad) {
    try {
        const result = await connection.query(
            'UPDATE usarios SET nombre = ?, precio = ?, cantidad = ? WHERE id = ?',
            [nombre, precio, cantidad, id]
        );
        return result;
    } catch (error) {
        console.error('Error del modelo en editarUsuario:', error);
        throw error;
    }
}

async function eliminarUsuario(id) {
    try {
        const result = await connection.query(
            'DELETE FROM usuarios WHERE id = ?',
            [id]
        );
        return result;
    } catch (error) {
        console.error('Error del modelo en eliminarUsuario:', error);
        throw error;
    }
}
async function consultarNombrexEmail(email) {
    try {
        const result = await connection.query(
            "SELECT CONCAT(`nombre`, ' ', `apellido`) AS nombreCompleto FROM `usuarios` WHERE email = ?", [email]
        )
        return result[0][0]
    } catch (error) {
        console.error("Error del modelo en consultarNombrexEmail", error)
    }
}
async function consultarInfoxEmail(email) {
    try {
        const result = await connection.query(
            'SELECT * FROM `usuarios` WHERE email = ?', [email]
        )
        return result[0][0]

    } catch (error) {
        console.error('Error del modelo en consultarInfoxEmail', error)
    }
}

module.exports = {
    crearUsuarios, editarUsuario, eliminarUsuario, obtenerUsuarioPorId,
    obtenerUsuarios, consultarInfoxEmail, consultarNombrexEmail
}; 