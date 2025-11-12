//Script que contiene la logica de cada uno de los metodos que se van a hacer
const {Router} = require("express");
const router = Router(); 
const convocatoriaModel = require("../models/convocatoriaModel");

exports.crearConvocatoria = async (req, res) => {
  try {
    const {tituloCon, descripcion, areaRequerida, estado, fecha_cierre, numPersSolicitad, tituloProyecto} = req.body;
    const result = await convocatoriaModel.createConvocatoria(tituloCon, descripcion, areaRequerida, estado, fecha_cierre, numPersSolicitad, tituloProyecto);
    res.status(201).json({message: "Convocatoria creada exitosamente"});
}
  catch (error) {
    console.error('[ERROR] Error al crear convocatoria:', error);
    res.status(500).json({message: "Error al crear la convocatoria"});
  }
};

/**
 * Consultar todas las convocatorias
 * Método: GET /api/convocatorias
 */
exports.consultarConvocatorias = async (req, res) => {
  try {
    const [convocatorias] = await convocatoriaModel.consultConvocatoria();
    res.status(200).json(convocatorias);

  } catch (error) {
    res.status(500).json({ message: 'Error al consultar las convocatorias.' });
  }
};

/**
 * Consultar una convocatoria específica por ID
 * Método: GET /api/convocatorias/:idConvocatoria
 */
exports.consultarInformacionConvocatoria = async (req, res) => {
  try {
    const {idConvocatoria} = req.params;
    console.log(`[LOG] Consultando convocatoria con ID ${idConvocatoria}...`);

    const convocatoria = await convocatoriaModel.consultInformacionConvocatoria(idConvocatoria);

    if (!convocatoria) {
      console.warn(`[WARN] No se encontró convocatoria con ID ${idConvocatoria}.`);
      return res.status(404).json({ message: 'Convocatoria no encontrada.' });
    }

    console.log(`[SUCCESS] Convocatoria con ID ${idConvocatoria} recuperada.`);
    res.status(200).json(convocatoria);

  } catch (error) {
    console.error('[ERROR] Error al consultar información de convocatoria:', error);
    res.status(500).json({ message: 'Error al consultar la información de la convocatoria.' });
  }
};

/**
 * Actualizar el estado de una convocatoria
 * Método: PUT /api/convocatorias/:idConvocatoria/estado
 */
exports.actualizarEstadoConvocatoria = async (req, res) => {
  try {
    const { idConvocatoria } = req.params;
    const { estado } = req.body;

    console.log(`[LOG] Actualizando estado de convocatoria ID ${idConvocatoria} → ${estado}`);

    const result = await convocatoriaModel.updateEstadoConvocatoria(idConvocatoria, estado);

    if (result[0].affectedRows === 0) {
      console.warn(`[WARN] No se encontró convocatoria con ID ${idConvocatoria} para actualizar.`);
      return res.status(404).json({ message: 'Convocatoria no encontrada.' });
    }

    console.log(`[SUCCESS] Estado de convocatoria ID ${idConvocatoria} actualizado a "${estado}".`);
    res.status(200).json({ message: 'Estado de convocatoria actualizado correctamente.' });

  } catch (error) {
    console.error('[ERROR] Error al actualizar estado de convocatoria:', error);
    res.status(500).json({ message: 'Error al actualizar el estado de la convocatoria.' });
  }
};

/**
 * Crear un participante asociado a una convocatoria
 * Método: POST /api/participantes
 */
exports.crearParticipante = async (req, res) => {
  try {
    const { nombre, idConvocatoria } = req.body;
    console.log(`[LOG] Creando participante "${nombre}" en convocatoria ${idConvocatoria}`);

    await convocatoriaModel.createParticipante(nombre, idConvocatoria);

    console.log(`[SUCCESS] Participante "${nombre}" creado correctamente.`);
    res.status(201).json({ message: 'Participante creado exitosamente.' });

  } catch (error) {
    res.status(500).json({ message: 'Error al crear participante.' });
  }
};

/**
 * Consultar todos los participantes de una convocatoria
 * Método: GET /api/participantes/:idConvocatoria
 */
exports.consultarParticipantes = async (req, res) => {
  try {
    const { idConvocatoria } = req.params;
    console.log(`[LOG] Consultando participantes de convocatoria ID ${idConvocatoria}`);

    const [participantes] = await convocatoriaModel.consultParticipante(idConvocatoria);

    console.log(`[SUCCESS] Se encontraron ${participantes.length} participantes.`);
    res.status(200).json(participantes);

  } catch (error) {
    console.error('[ERROR] Error al consultar participantes:', error);
    res.status(500).json({ message: 'Error al consultar los participantes.' });
  }
};
