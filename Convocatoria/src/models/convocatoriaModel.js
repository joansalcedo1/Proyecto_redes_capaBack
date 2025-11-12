//Sript para crear el modelo que se va a guardar en la base de datos 

const mysql = require('mysql2/promise');

const conection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'convocatoria'
});

async function createConvocatoria(
  tituloCon,
  descripcion,
  areaRequerida,
  estado,
  fecha_cierre,
  numPersSolicitad,
  tituloProyecto
) {
  const result = await conection.query(
    `INSERT INTO convocatoria 
     (tituloCon, descripcion, areaRequerida, estado, fecha_cierre, numPersSolicitad, tituloProyecto)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [tituloCon, descripcion, areaRequerida, estado, fecha_cierre, numPersSolicitad, tituloProyecto]
  );
  return result;
}


async function consultConvocatoria() {
    const result = await conection.query(
        'SELECT * FROM convocatoria'
    );
    return result;
}

async function updateEstadoConvocatoria(idConvocatoria, estado) {
    const result = await conection.query(
        'UPDATE convocatoria SET estado = ? WHERE idConvocatoria = ?',
        [estado, idConvocatoria]
    );
    return result;
}

async function consultInformacionConvocatoria(idConvocatoria) {
    // El método query devuelve un array: [rows, fields]. Usamos desestructuración.
    const [rows] = await conection.query(
        'SELECT * FROM convocatoria WHERE idConvocatoria = ?',
        [idConvocatoria]
    );
    
    // Si se encuentra una fila, devuelve el primer elemento (la convocatoria). Si no, devuelve null.
    return rows.length > 0 ? rows[0] : null;
}

async function createParticipante(nombre, idConvocatoria) {
    const result = await conection.query(
        'INSERT INTO participante VALUES (null, ?, ?)',
        [nombre, idConvocatoria]
    );
    return result;
}

async function consultParticipante(idConvocatoria) {
    const result = await conection.query(
        'SELECT * FROM participante WHERE convID = ?',
        [idConvocatoria]
    );
    return result;
}

module.exports = {
    createConvocatoria,
    consultConvocatoria,
    updateEstadoConvocatoria,
    consultInformacionConvocatoria,
    createParticipante,
    consultParticipante
};