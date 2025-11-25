const { debug } = require("console");
const convocatoriaModel = require("../models/convocatoriaModel");
const axios = require('axios');
// --- CONFIGURACIÓN DE URLs DE MICROSERVICIOS ---
const MS_OFERTANTE_URL = 'http://localhost:3303/apiRedes/ofertante';
const MS_POSTULANTE_URL = 'http://localhost:3314/apiRedes/postulante';
const MS_USUARIO_URL = 'http://localhost:3310/apiRedes/usuarios';
const MS_PROYECTO_URL = 'http://localhost:3312/apiRedes/proyecto';


// ==========================================
// FUNCIONALIDADES PROPIAS (CRUD EXISTENTE)
// ==========================================

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
    console.log(`✅ Log: Convocatoria creada con ID: ${result}`);
        res.status(201).json({
            message: "Convocatoria creada exitosamente",
            idConvocatoria: result
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
    const convocatorias = await convocatoriaModel.consultConvocatoria();
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

// ==========================================
// FUNCIONALIDADES RELACIONES (ORQUESTACIÓN)
// ==========================================

/**
 * @function consultarMatchOfertas Consultar Ofertas Match (Convocatoria <-> Ofertante)
 * Valida coincidencia de fechas y área requerida.
 * @route GET /apiRedes/convocatoria/:idConvocatoria/match-ofertas
 */
exports.consultarMatchOfertas = async (req, res) => {
    const { idConvocatoria } = req.params;

    try {
        // 1. Obtener datos de la convocatoria
        const convocatoria = await convocatoriaModel.consultInformacionConvocatoria(idConvocatoria);
        if (!convocatoria) return res.status(404).json({ message: "Convocatoria no encontrada." });

        // 2. Obtener todas las ofertas del MS Ofertante
        const responseOfertas = await axios.get(MS_OFERTANTE_URL);
        const ofertas = responseOfertas.data;

        // 3. Filtrar ofertas que coincidan (Área y Fechas)
        const matches = ofertas.filter(oferta => {
            const areaMatch = oferta.area && convocatoria.areaRequerida && 
                              oferta.area.toLowerCase() === convocatoria.areaRequerida.toLowerCase();
            
            // Validar fechas: la fecha fin de la oferta debe ser >= a la fecha cierre de la convocatoria
            const fechaOferta = new Date(oferta.fecha_fin);
            const fechaConvocatoria = new Date(convocatoria.fecha_cierre);
            const fechaMatch = (fechaOferta <= fechaConvocatoria); 
            console.log("Área Match:", areaMatch, "Fecha Match:", fechaMatch, "Fecha Oferta:", oferta.fecha_fin, "Fecha Convocatoria", convocatoria.fecha_cierre);

            return areaMatch && fechaMatch && oferta.estado_of === 'disponible';

            
        });

        console.log(`✅ Log: Se encontraron ${matches.length} ofertas compatibles para Convocatoria ${idConvocatoria}.`);
        res.status(200).json(matches);

    } catch (error) {
        console.error("Error en match de ofertas:", error.message);
        res.status(500).json({ message: "Error al consultar ofertas compatibles." });
    }
};

exports.confirmarPostulante = async (req, res) => {
    const { idPostulacion } = req.params;

    try {
        // Llamada al MS Postulante (usamos PATCH/PUT según tu router de postulante)
        // Tu router de Postulante usa PATCH para /:idPost/estado
        await axios.patch(`${MS_POSTULANTE_URL}/${idPostulacion}/estado`, { 
            estado: 'aceptado' 
        });

        console.log(`✅ Log: Postulación ${idPostulacion} confirmada (aceptada).`);
        res.status(200).json({ message: "Postulante confirmado exitosamente." });

    } catch (error) {
        console.error("Error confirmando postulante:", error.message);
        const status = error.response ? error.response.status : 500;
        res.status(status).json({ message: "Error al comunicarse con el servicio de Postulaciones." });
    }
};

/**
 * @function Solicitar Usuario (Convocatoria -> Ofertante)
 * Actualiza el estado de la oferta a "Solicitado".
 * @route PUT /apiRedes/convocatoria/oferta/:idOferta/solicitar
 */
exports.solicitarOfertaUsuario = async (req, res) => {
    const { idOferta, idConvocatoria } = req.params;
    const convocatoria = await convocatoriaModel.consultInformacionConvocatoria(idConvocatoria);
    if (!convocatoria) return res.status(404).json({ message: "Convocatoria no encontrada." });
    try {
        // Llamada al MS Ofertante para actualizar estado
        await axios.put(`${MS_OFERTANTE_URL}/${idOferta}`, { 
            estado_of: `Solicitado`,
            convocatoria: convocatoria.tituloProyecto
        });

        console.log(`✅ Log: Oferta ${idOferta} marcada como 'Solicitado'.`);
        res.status(200).json({ message: "Usuario solicitado exitosamente para la convocatoria." });

    } catch (error) {
        console.error("Error solicitando oferta:", error.message);
        const status = error.response ? error.response.status : 500;
        res.status(status).json({ message: "Error al comunicarse con el servicio de Ofertas." });
    }
};


/**
 * @function Consultar Postulaciones de una Convocatoria (Convocatoria -> Postulante)
 * Filtra por ID de convocatoria (o título, según como guarde Postulante).
 * @route GET /apiRedes/convocatoria/:idConvocatoria/postulaciones
 */
exports.consultarPostulacionesDeConvocatoria = async (req, res) => {
    const { idConvocatoria } = req.params;

    try {
        // 1. Obtener información de la convocatoria para saber el TÍTULO
        const convocatoria = await convocatoriaModel.consultInformacionConvocatoria(idConvocatoria);
        if (!convocatoria) return res.status(404).json({ message: "Convocatoria no encontrada." });

        const tituloBusqueda = convocatoria.tituloCon;

        // 2. Obtener todas las postulaciones
        const response = await axios.get(MS_POSTULANTE_URL);
        const todasPostulaciones = response.data;

        // 3. Filtrar
        const postulacionesFiltradas = todasPostulaciones.filter(p => 
            p.tituloConvocatoria === tituloBusqueda
        );

        res.status(200).json(postulacionesFiltradas);

    } catch (error) {
        console.error("Error consultando postulaciones:", error.message);
        res.status(500).json({ message: "Error al obtener las postulaciones." });
    }
};

/**
 * @function Consultar Convocatorias de un Usuario (Usuario -> Proyecto -> Convocatoria)
 * Flujo: idUsuario -> Nombre(MS Usuario) -> Proyectos(MS Proyecto) -> Convocatorias(Local)
 * @route GET /apiRedes/convocatoria/usuario/:idUsuario
 */
exports.consultarConvocatoriasDeUsuario = async (req, res) => {
    const { idUsuario } = req.params;

    try {
        // 1. Consultar Nombre del Usuario en MS Usuario
        let nombreUsuario = '';
        try {
            const userRes = await axios.get(`${MS_USUARIO_URL}/nombre/${idUsuario}`);
            nombreUsuario = userRes.data.nombreCompleto;
        } catch (err) {
            return res.status(404).json({ message: "Usuario no encontrado en el sistema." });
        }

        // 2. Consultar Proyectos donde el usuario es Organizador en MS Proyecto
        const proyectosRes = await axios.get(MS_PROYECTO_URL);
        const proyectosUsuario = proyectosRes.data.filter(p => p.organizador === nombreUsuario);
        
        if (proyectosUsuario.length === 0) {
            return res.status(200).json([]); // El usuario no tiene proyectos, por tanto no tiene convocatorias
        }

        // Extraer títulos de proyectos
        const titulosProyectos = proyectosUsuario.map(p => p.titulo);

        // 3. Consultar Convocatorias Locales que coincidan con esos títulos de proyecto
        const todasConvocatorias = await convocatoriaModel.consultConvocatoria();
        
        const convocatoriasUsuario = todasConvocatorias.filter(c => 
            titulosProyectos.includes(c.tituloProyecto)
        );

        res.status(200).json(convocatoriasUsuario);

    } catch (error) {
        console.error("Error en orquestación compleja de usuario:", error.message);
        res.status(500).json({ message: "Error interno procesando la consulta de convocatorias del usuario." });
    }
};