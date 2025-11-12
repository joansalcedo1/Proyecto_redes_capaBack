//Script que contiene la logica de cada uno de los metodos que se van a hacer

const proyectoModel = require("../models/proyectoModel")

/**
 * @async
 * @function crearProyecto
 * @description Crea un nuevo proyecto y responde con el ID del proyecto creado.
 * @route POST /api/proyectos
 * @param {object} req - Objeto de la solicitud HTTP (contiene body con datos).
 * @param {object} res - Objeto de la respuesta HTTP.
 */
exports.crearProyecto = async (req, res) => {
    // 1. Obtener datos del cuerpo de la solicitud
    const nuevoProyecto = req.body; 

    // 2. Validación básica de datos obligatorios
    if (!nuevoProyecto.titulo || !nuevoProyecto.fechaInicio) {
        console.warn('⚠️ Log: Intento de crear proyecto con datos incompletos.');
        return res.status(400).json({
            error: 'Faltan campos obligatorios: título y fechaInicio.'
        });
    }

    try {
        // 3. Llamar al Modelo para ejecutar la lógica de BD
        const idGenerado = await proyectoModel.crearProyecto(nuevoProyecto);

        // 4. Respuesta HTTP exitosa
        console.log(`✅ Log: Proyecto creado con ID: ${idGenerado}.`);
        res.status(201).json({
            message: 'Proyecto creado exitosamente.',
            idProyecto: idGenerado
        });
    } catch (error) {
        // 5. Manejo de errores del Modelo (errores de BD)
        console.error('❌ Log: Error al crear proyecto en BD:', error.message);
        res.status(500).json({
            error: 'Error interno del servidor al crear el proyecto.'
        });
    }
};

// ---

/**
 * @async
 * @function actualizarEstadoProyecto
 * @description Actualiza el estado de un proyecto específico.
 * @route PUT /api/proyectos/estado/:id
 * @param {object} req - Objeto de la solicitud HTTP (contiene params y body).
 * @param {object} res - Objeto de la respuesta HTTP.
 */
exports.actualizarEstadoProyecto = async (req, res) => {
    // 1. Obtener ID de los parámetros y el nuevo estado del cuerpo
    const idProyecto = req.params.id;
    const { estado } = req.body; 

    // 2. Validación: ID debe ser numérico y estado debe ser válido
    if (isNaN(idProyecto) || !estado || (estado !== 'activo' && estado !== 'finalizado')) {
        console.warn(`⚠️ Log: Datos de actualización inválidos. ID: ${idProyecto}, Estado: ${estado}`);
        return res.status(400).json({
            error: 'ID de proyecto inválido o el estado debe ser "activo" o "finalizado".'
        });
    }

    try {
        // 3. Llamar al Modelo para actualizar
        const filasAfectadas = await proyectoModel.actualizarEstadoProyecto(idProyecto, estado);

        // 4. Respuesta HTTP
        if (filasAfectadas === 0) {
            console.warn(`⚠️ Log: No se encontró proyecto con ID: ${idProyecto} para actualizar.`);
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }
        
        console.log(`✅ Log: Estado del Proyecto ID ${idProyecto} actualizado a: ${estado}.`);
        res.status(200).json({
            message: `Estado del proyecto ID ${idProyecto} actualizado exitosamente.`
        });
    } catch (error) {
        // 5. Manejo de errores
        console.error('❌ Log: Error al actualizar estado del proyecto:', error.message);
        res.status(500).json({
            error: 'Error interno del servidor al actualizar el estado.'
        });
    }
};

// ---

/**
 * @async
 * @function consultarProyectos
 * @description Obtiene la lista de todos los proyectos.
 * @route GET /api/proyectos
 * @param {object} req - Objeto de la solicitud HTTP.
 * @param {object} res - Objeto de la respuesta HTTP.
 */
exports.consultarProyectos = async (req, res) => {
    try {
        // 1. Llamar al Modelo para obtener la lista
        const proyectos = await proyectoModel.consultarProyectos();

        // 2. Respuesta HTTP exitosa
        console.log(`✅ Log: Se consultaron ${proyectos.length} proyectos.`);
        res.status(200).json(proyectos);
    } catch (error) {
        // 3. Manejo de errores
        console.error('❌ Log: Error al consultar la lista de proyectos:', error.message);
        res.status(500).json({
            error: 'Error interno del servidor al obtener la lista de proyectos.'
        });
    }
};

// ---

/**
 * @async
 * @function consultarInformacionProyecto
 * @description Obtiene la información detallada de un proyecto por su ID.
 * @route GET /api/proyectos/:id
 * @param {object} req - Objeto de la solicitud HTTP (contiene params).
 * @param {object} res - Objeto de la respuesta HTTP.
 */
exports.consultarInformacionProyecto = async (req, res) => {
    // 1. Obtener ID de los parámetros
    const idProyecto = req.params.id;

    // 2. Validación
    if (isNaN(idProyecto)) {
        console.warn(`⚠️ Log: Intento de consulta con ID no numérico: ${idProyecto}.`);
        return res.status(400).json({ error: 'El ID del proyecto debe ser un valor numérico.' });
    }

    try {
        // 3. Llamar al Modelo para obtener el detalle
        const proyecto = await proyectoModel.consultarInformacionProyecto(idProyecto);

        // 4. Respuesta HTTP
        if (!proyecto) {
            console.warn(`⚠️ Log: Proyecto con ID ${idProyecto} no encontrado.`);
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }

        console.log(`✅ Log: Información del proyecto ID ${idProyecto} consultada exitosamente.`);
        res.status(200).json(proyecto);
    } catch (error) {
        // 5. Manejo de errores
        console.error('❌ Log: Error al consultar información detallada:', error.message);
        res.status(500).json({
            error: 'Error interno del servidor al consultar el proyecto.'
        });
    }
};