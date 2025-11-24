const convocatoriaModel = require("../models/convocatoriaModel");

/**
 * @function crearConvocatoria
 * @description Crea una nueva convocatoria y responde con el ID de la convocatoria creada.
 * @route POST /apiRedes/convocatoria
 */
exports.crearConvocatoria = async (req, res) => {
  const {tituloCon, descripcion, areaRequerida, estado, fecha_cierre, numPersSolicitad, tituloProyecto} = req.body;
  // Validaciones
    if (!tituloCon || !areaRequerida || !fecha_cierre || !tituloProyecto) {
        console.warn('⚠️ Log: Datos incompletos para crear convocatoria.');
        return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    if (isNaN(numPersSolicitad) || numPersSolicitad <= 0) {
        return res.status(400).json({ message: "El número de personas solicitadas debe ser un número positivo." });
    }
  try {
    const result = await convocatoriaModel.createConvocatoria(tituloCon, descripcion, areaRequerida, estado, fecha_cierre, numPersSolicitad, tituloProyecto);
    console.log(`✅ Log: Convocatoria creada con ID: ${idGenerado}`);
        res.status(201).json({
            message: "Convocatoria creada exitosamente",
            idConvocatoria: idGenerado
        });
  }
  catch (error) {
    console.error('❌ Log: Error al crear convocatoria:', error.message);
    res.status(500).json({
      message: "Error interno al crear la convocatoria"
    });
  }
};

/**
 * @function consultarConvocatorias
 * @description Consulta todas las convocatorias existentes.
 * @route GET /apiRedes/convocatoria
 */
exports.consultarConvocatorias = async (req, res) => {
  try {
    const [convocatorias] = await convocatoriaModel.consultConvocatoria();
    console.log(`✅ Log: Se consultaron ${convocatorias.length} convocatorias.`);
    res.status(200).json(convocatorias);

  } catch (error) {
    console.error('❌ Log: Error al consultar convocatorias:', error.message);
    res.status(500).json({ message: 'Error al consultar las convocatorias.' });
  }
};

/**
 * @function consultarInformacionConvocatoria
 * @description Consulta una convocatoria específica por ID.
 * @route GET /apiRedes/convocatoria/:idConvocatoria
 */
exports.consultarInformacionConvocatoria = async (req, res) => {
  const {idConvocatoria} = req.params;
  if (isNaN(idConvocatoria)) {
        return res.status(400).json({ message: 'El ID debe ser numérico.' });
    }
  try {
    
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
 * @function actualizarEstadoConvocatoria
 * @description Actualiza el estado de una convocatoria.
 * @route PUT /apiRedes/convocatoria/:idConvocatoria/estado
 */
exports.actualizarEstadoConvocatoria = async (req, res) => {
  const { idConvocatoria } = req.params;
  const { estado } = req.body;
  if (!estado) {
        return res.status(400).json({ message: 'El nuevo estado es requerido.' });
    }
  try {
    
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
 * @function crearParticipante
 * @description Asocia un participante a una convocatoria.
 * @route POST /apiRedes/convocatoria/participantes
 */
exports.crearParticipante = async (req, res) => {
    const { nombre, idConvocatoria } = req.body;

    if (!nombre || !idConvocatoria) {
        return res.status(400).json({ message: 'Faltan datos (nombre, idConvocatoria).' });
    }

    try {
        // Verificar primero si la convocatoria existe (opcional, pero buena práctica)
        const conv = await convocatoriaModel.consultInformacionConvocatoria(idConvocatoria);
        if(!conv) {
          return res.status(404).json({ message: 'La convocatoria indicada no existe.' });
        }

        await convocatoriaModel.createParticipante(nombre, idConvocatoria);
        console.log(`✅ Log: Participante "${nombre}" agregado a convocatoria ${idConvocatoria}.`);
        res.status(201).json({ message: 'Participante creado exitosamente.' });
    } catch (error) {
        console.error('❌ Log: Error al crear participante:', error.message);
        res.status(500).json({ message: 'Error al crear participante.' });
    }
};

/**
 * @function consultarParticipantes
 * @description Consulta los participantes de una convocatoria.
 * @route GET /apiRedes/convocatoria/participantes/:idConvocatoria
 */
exports.consultarParticipantes = async (req, res) => {
    const { idConvocatoria } = req.params;

    try {
        const participantes = await convocatoriaModel.consultParticipante(idConvocatoria);
        console.log(`✅ Log: Se encontraron ${participantes.length} participantes para la convocatoria ${idConvocatoria}.`);
        res.status(200).json(participantes);
    } catch (error) {
        console.error('❌ Log: Error al consultar participantes:', error.message);
        res.status(500).json({ message: 'Error al consultar los participantes.' });
    }
};
