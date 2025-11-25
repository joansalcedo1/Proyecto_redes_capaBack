const proyectoModel = require("../models/proyectoModel");
const axios = require('axios');
const CONVOCATORIA_API_URL = 'http://localhost:3308/apiRedes/convocatoria/';

function mapDepartamentoToArea(departamentoKey) {
    const map = {
        'lucesDep': 'Luces',
        'arteDep': 'Arte',
        'camaraDep': 'Cámara',
        'postProdDep': 'Post-Producción',
        'direccionDep': 'Dirección'
    };
    return map[departamentoKey] || 'General';
}

/**
 * @function crearProyecto
 * @description Crea un nuevo proyecto y responde con el ID del proyecto creado.
 * @route POST /apiRedes/proyecto
 * @param {object} req - Objeto de la solicitud HTTP (contiene body con datos).
 * @param {object} res - Objeto de la respuesta HTTP.
 */
exports.crearProyecto = async (req, res) => {
    const nuevoProyecto = req.body; 

    // --- Validaciones básicas de los datos obligatorios ---
    if (!nuevoProyecto.titulo || !nuevoProyecto.fechaInicio) {
        console.warn('⚠️ Log: Intento de crear proyecto con datos incompletos.');
        return res.status(400).json({
            error: 'Faltan campos obligatorios: título y fechaInicio.'
        });
    }

    // --- Crear mas validaciones según sea necesario

    try {
        const idGenerado = await proyectoModel.crearProyecto(nuevoProyecto);
        console.log(`✅ Log: Proyecto creado con ID: ${idGenerado}.`);
        res.status(201).json({
            message: 'Proyecto creado exitosamente.',
            idProyecto: idGenerado
        });
    } catch (error) {
        console.error('❌ Log: Error al crear proyecto en BD:', error.message);
        res.status(500).json({
            error: 'Error interno del servidor al crear el proyecto.'
        });
    }
};

/**
 * @function actualizarEstadoProyecto
 * @description Actualiza el estado de un proyecto específico.
 * @route PUT /api/proyectos/estado/:id
 * @param {object} req - Objeto de la solicitud HTTP (contiene params y body).
 * @param {object} res - Objeto de la respuesta HTTP.
 */
exports.actualizarEstadoProyecto = async (req, res) => {
    const idProyecto = req.params.id;
    const { estado } = req.body; 

    // --- Validación de datos ---
    if (isNaN(idProyecto) || !estado || (estado !== 'activo' && estado !== 'finalizado')) {
        console.warn(`⚠️ Log: Datos de actualización inválidos. ID: ${idProyecto}, Estado: ${estado}`);
        return res.status(400).json({
            error: 'ID de proyecto inválido o el estado debe ser "activo" o "finalizado".'
        });
    }

    try {
        const filasAfectadas = await proyectoModel.actualizarEstadoProyecto(idProyecto, estado);
        if (filasAfectadas === 0) {
            console.warn(`⚠️ Log: No se encontró proyecto con ID: ${idProyecto} para actualizar.`);
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }
        console.log(`✅ Log: Estado del Proyecto ID ${idProyecto} actualizado a: ${estado}.`);
        res.status(200).json({
            message: `Estado del proyecto ID ${idProyecto} actualizado exitosamente.`
        });
    } catch (error) {
        console.error('❌ Log: Error al actualizar estado del proyecto:', error.message);
        res.status(500).json({
            error: 'Error interno del servidor al actualizar el estado.'
        });
    }
};

/**
 * @function consultarProyectos
 * @description Obtiene la lista de todos los proyectos.
 * @route GET /api/proyectos
 * @param {object} req - Objeto de la solicitud HTTP.
 * @param {object} res - Objeto de la respuesta HTTP.
 */
exports.consultarProyectos = async (req, res) => {
    try {
        const proyectos = await proyectoModel.consultarProyectos();
        console.log(`✅ Log: Se consultaron ${proyectos.length} proyectos.`);
        res.status(200).json(proyectos);
    } catch (error) {
        console.error('❌ Log: Error al consultar la lista de proyectos:', error.message);
        res.status(500).json({
            error: 'Error interno del servidor al obtener la lista de proyectos.'
        });
    }
};

/**
 * @function consultarInformacionProyecto
 * @description Obtiene la información detallada de un proyecto por su ID.
 * @route GET /api/proyectos/:id
 * @param {object} req - Objeto de la solicitud HTTP (contiene params).
 * @param {object} res - Objeto de la respuesta HTTP.
 */
exports.consultarInformacionProyecto = async (req, res) => {
    const idProyecto = req.params.id;

    // --- Validación de datos ---
    if (isNaN(idProyecto)) {
        console.warn(`⚠️ Log: Intento de consulta con ID no numérico: ${idProyecto}.`);
        return res.status(400).json({ error: 'El ID del proyecto debe ser un valor numérico.' });
    }

    try {
        const proyecto = await proyectoModel.consultarInformacionProyecto(idProyecto);
        if (!proyecto) {
            console.warn(`⚠️ Log: Proyecto con ID ${idProyecto} no encontrado.`);
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }
        console.log(`✅ Log: Información del proyecto ID ${idProyecto} consultada exitosamente.`);
        res.status(200).json(proyecto);
    } catch (error) {
        console.error('❌ Log: Error al consultar información detallada:', error.message);
        res.status(500).json({
            error: 'Error interno del servidor al consultar el proyecto.'
        });
    }
};

/**
 * @function lanzarConvocatorias
 * @description Obtiene los detalles de un proyecto y crea las convocatorias asociadas en el Microservicio de Convocatorias.
 * @route POST /apiRedes/proyecto/:id/lanzar-convocatorias
 * @param {object} req - Objeto de la solicitud HTTP (contiene params y body con datos de convocatoria).
 * @param {object} res - Objeto de la respuesta HTTP.
 * @documentation Utiliza la estructura nativa 'fetch' para realizar la comunicación entre microservicios.
 */
exports.lanzarConvocatorias = async (req, res) => {
    const idProyecto = req.params.id;
    const { titulo, numPersSolicitad } = req.body; 

    // --- Validación de datos ---
    if (isNaN(idProyecto) || !titulo || !numPersSolicitad) {
        console.warn('⚠️ Log: Datos incompletos o inválidos para lanzar convocatorias.');
        return res.status(400).json({
            error: 'Faltan campos obligatorios para la convocatoria o el ID es inválido.'
        });
    }

    // --- Validación: numPersSolicitad debe ser un objeto/mapa ---
    if (typeof numPersSolicitad !== 'object' || numPersSolicitad === null) {
        console.warn('⚠️ Log: numPersSolicitad debe ser un mapa/objeto con departamentos.');
        return res.status(400).json({
            error: 'numPersSolicitad debe ser un mapa con estructura: {"Luces": 5, "Arte": 2, ...}'
        });
    }

    try {
        // --- Obtener detalles del proyecto ---
        const proyecto = await proyectoModel.consultarInformacionProyecto(idProyecto);
        if (!proyecto) {
            console.warn(`⚠️ Log: Proyecto ID ${idProyecto} no encontrado para lanzar convocatorias.`);
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }
        
        // --- Variables para el proceso de creación de cada convocatorias ---
        const departamentos = ['lucesDep', 'arteDep', 'camaraDep', 'postProdDep', 'direccionDep'];
        let convocatoriasLanzadas = 0;
        let erroresConvocatoria = [];
        const fechaInicio = new Date().toISOString().slice(0, 10);

        // --- Iterar sobre numPersSolicitad ---
        for (const [area, cantidadSolicitada] of Object.entries(numPersSolicitad)) {
            // 1. Validación: Verificar que la cantidad es un número válido y positivo
            if (typeof cantidadSolicitada !== 'number' || cantidadSolicitada <= 0) {
                console.warn(`⚠️ Log: Cantidad inválida para el área ${area}. Debe ser un número positivo.`);
                erroresConvocatoria.push(`Cantidad inválida para ${area}: debe ser un número positivo.`);
                continue;
            }
            // 2. Validación: Encontrar el departamento que corresponde al área
            let depKeyCorrespondiente = null;
            for (const depKey of departamentos) {
                if (mapDepartamentoToArea(depKey) === area) {
                    depKeyCorrespondiente = depKey;
                    break;
                }
            }
            // 3. Validación: Si el área no existe, reportar error y continuar
            if (!depKeyCorrespondiente) {
                console.warn(`⚠️ Log: Área ${area} no reconocida en la estructura de departamentos.`);
                erroresConvocatoria.push(`Área no reconocida: ${area}. Áreas válidas: Luces, Arte, Cámara, Post-Producción, Dirección.`);
                continue;
            }
            // 4. Validación: Verificar que el proyecto tiene habilitado este departamento
            if (proyecto[depKeyCorrespondiente] !== 1) {
                console.warn(`⚠️ Log: Departamento ${area} (${depKeyCorrespondiente}) no está habilitado en el proyecto.`);
                erroresConvocatoria.push(`Departamento ${area} no está habilitado en este proyecto.`);
                continue;
            }
            // 5. Construcción del payload con validaciones exitosas
            const payload = {
                tituloCon: titulo,
                descripcion: proyecto.descripcion,
                estado: "activo",
                numPersSolicitad: cantidadSolicitada,
                fecha_cierre: proyecto.fechaFin, 
                tituloProyecto: proyecto.titulo,
                areaRequerida: area, 
                fecha_inicio: fechaInicio 
            };
            // 6. Petición POST al Microservicio de Convocatorias
            try {
                const response = await axios.post(CONVOCATORIA_API_URL, payload);
                convocatoriasLanzadas++;
                console.log(`📡 Log: Convocatoria para ${area} (${cantidadSolicitada} personas) del Proyecto ID ${idProyecto} creada con éxito. ${response.text}`);
            } catch (axiosError) {
                if (axiosError.response) {
                    console.error(`❌ Log: Error HTTP (${axiosError.response.status}) al crear convocatoria para ${area}. Detalles: ${JSON.stringify(axiosError.response.data)}`);
                    erroresConvocatoria.push(`Error al crear convocatoria para ${area}: ${JSON.stringify(axiosError.response.data).substring(0, 50)}...`);
                } else {
                    console.error(`❌ Log: Error de RED/AXIOS al crear convocatoria para ${area}. Detalles: ${axiosError.message}`);
                    erroresConvocatoria.push(`Error de red al crear convocatoria para ${area}.`);
                }
            }
        }

        // --- Respuesta Completa HTTP final
        const baseMessage = `Se crearon ${convocatoriasLanzadas} convocatorias exitosamente.`;
        
        if (erroresConvocatoria.length > 0) {
            // Reportar éxito parcial con advertencias
            console.warn(`⚠️ Log: Éxito parcial. Fallaron ${erroresConvocatoria.length} convocatorias.`);
            return res.status(202).json({ 
                message: baseMessage,
                advertencias: erroresConvocatoria,
                idProyecto: idProyecto
            });
        }
        console.log(`✅ Log: Lanzamiento de convocatorias completado para el Proyecto ID ${idProyecto}.`);
        res.status(200).json({
            message: baseMessage,
            idProyecto: idProyecto
        });

    } catch (error) {
        // 5. Manejo de errores fatales (ej. Error de BD en proyectoModel)
        console.error('❌ Log: Error fatal al obtener el proyecto o lanzar convocatorias:', error.message);
        res.status(500).json({
            error: 'Error interno del servidor al procesar la solicitud.'
        });
    }
};