//Script que contiene la logica de cada uno de los metodos que se van a hacer

const proyectoModel = require("../models/proyectoModel")
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

/**
 * @async
 * @function lanzarConvocatorias
 * @description Obtiene los detalles de un proyecto y crea las convocatorias asociadas en el Microservicio de Convocatorias usando fetch.
 * @route POST /apiRedes/proyecto/:id/lanzar-convocatorias
 * @param {object} req - Objeto de la solicitud HTTP (contiene params y body con datos de convocatoria).
 * @param {object} res - Objeto de la respuesta HTTP.
 * @documentation Utiliza la estructura nativa 'fetch' para realizar la comunicación entre microservicios.
 */
exports.lanzarConvocatorias = async (req, res) => {
    const idProyecto = req.params.id;
    
    // Desestructuración directa de los inputs del usuario (datos de la convocatoria)
    const { 
        titulo, 
        descripcion, 
        estado, 
        numPersSolicitad, 
        fechaCierre 
    } = req.body; 

    // 1. Validación de datos obligatorios
    if (isNaN(idProyecto) || !titulo || !descripcion || !estado || !numPersSolicitad || !fechaCierre) {
        console.warn('⚠️ Log: Datos incompletos o inválidos para lanzar convocatorias.');
        return res.status(400).json({
            error: 'Faltan campos obligatorios para la convocatoria o el ID es inválido.'
        });
    }

    try {
        // 2. Obtener los datos del proyecto de la BD local
        const proyecto = await proyectoModel.consultarInformacionProyecto(idProyecto);

        if (!proyecto) {
            console.warn(`⚠️ Log: Proyecto ID ${idProyecto} no encontrado para lanzar convocatorias.`);
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }
        
        // 3. Crear y lanzar las convocatorias
        const departamentos = ['lucesDep', 'arteDep', 'camaraDep', 'postProdDep', 'direccionDep'];
        let convocatoriasLanzadas = 0;
        let erroresConvocatoria = [];
        const fechaInicio = new Date().toISOString().slice(0, 10); // Fecha actual

        for (const depKey of departamentos) {
            if (proyecto[depKey] === 1) {
                
                // 3a. Construcción concisa del payload (se evita una función auxiliar)
                const payload = {
                    // Datos ingresados por el usuario
                    tituloCon: titulo, // Título de la convocatoria
                    descripcion: descripcion,
                    estado: estado,
                    numPersSolicitad: numPersSolicitad,
                    fecha_cierre: fechaCierre, 

                    // Datos derivados del back-end
                    tituloProyecto: proyecto.titulo, // Título del proyecto
                    areaRequerida: mapDepartamentoToArea(depKey), // Área (ej: 'Luces')
                    fecha_inicio: fechaInicio 
                };
                
                // 3b. Petición POST al Microservicio de Convocatorias (usando fetch)
                try {
                    const response = await fetch(CONVOCATORIA_API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    // Manejar errores HTTP 4xx/5xx del otro microservicio
                    if (!response.ok) {
                        const errText = await response.text();
                        console.error(`❌ Log: Error HTTP (${response.status}) al crear convocatoria para ${depKey}. Detalles: ${errText}`);
                        erroresConvocatoria.push(`Error al crear ${mapDepartamentoToArea(depKey)}: ${errText.substring(0, 50)}...`);
                        continue; // Continúa con el siguiente departamento si este falla
                    }

                    // Petición exitosa
                    convocatoriasLanzadas++;
                    console.log(`📡 Log: Convocatoria para ${depKey} del Proyecto ID ${idProyecto} creada con éxito.`);

                } catch (fetchError) {
                    // Manejar errores de red (ej. Microservicio de Convocatorias caído)
                    console.error(`❌ Log: Error de RED/FETCH al crear convocatoria para ${depKey}. Detalles: ${fetchError.message}`);
                    erroresConvocatoria.push(`Error de red al crear ${mapDepartamentoToArea(depKey)}.`);
                }
            }
        }

        // 4. Respuesta HTTP final
        const baseMessage = `Se crearon ${convocatoriasLanzadas} convocatorias exitosamente.`;
        
        if (erroresConvocatoria.length > 0) {
            // Reportar éxito parcial con advertencias
            console.warn(`⚠️ Log: Éxito parcial. Fallaron ${erroresConvocatoria.length} convocatorias.`);
            return res.status(202).json({ // 202 Accepted, éxito parcial
                message: baseMessage,
                advertencias: erroresConvocatoria,
                idProyecto: idProyecto
            });
        }
        
        // Éxito total
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