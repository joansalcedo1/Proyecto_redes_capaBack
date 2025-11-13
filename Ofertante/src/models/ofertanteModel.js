//Sript para crear el modelo que se va a guardar en la base de datos 

const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',       // usuario por defecto de XAMPP
  password: '',       // deja vacío si no configuramos contraseña
  database: 'ofertante', // nombre de la base de datos
});

// Obtener todas las ofertas
async function obtenerOfertas() {
  const [result] = await connection.query('SELECT * FROM ofertante');
  return result;
}

// Obtener una oferta por ID
async function obtenerOfertaPorId(id_oferta) {
  const [result] = await connection.query(
    'SELECT * FROM ofertante WHERE id_oferta = ?',
    [id_oferta]
  );
  return result[0];
}

// Crear una nueva oferta
async function crearOferta(nombre_usuario, area, fecha_inicio, fecha_fin, estado_of) {
  const [result] = await connection.query(
    'INSERT INTO ofertante (nombre_usuario, area, fecha_inicio, fecha_fin, estado_of) VALUES (?, ?, ?, ?, ?)',
    [nombre_usuario, area, fecha_inicio, fecha_fin, estado_of || 'disponible']
  );
  return result;
}

// Actualizar estado de una oferta
async function actualizarEstadoOferta(id_oferta, estado_of) {
  const [result] = await connection.query(
    'UPDATE ofertante SET estado_of = ? WHERE id_oferta = ?',
    [estado_of, id_oferta]
  );
  return result;
}

// Eliminar oferta
async function eliminarOferta(id_oferta) {
  const [result] = await connection.query(
    'DELETE FROM ofertante WHERE id_oferta = ?',
    [id_oferta]
  );
  return result;
}

module.exports = {
  obtenerOfertas,
  obtenerOfertaPorId,
  crearOferta,
  actualizarEstadoOferta,
  eliminarOferta
};