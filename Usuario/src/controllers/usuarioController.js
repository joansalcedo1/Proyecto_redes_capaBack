const userModel = require("../models/usuarioModel")
const axios = require('axios');

// URL del microservicio de proyectos 
const PROYECTO_API_URL = 'http://localhost:3312/apiRedes/proyecto/';
const MS_OFERTANTE_URL = 'http://localhost:3303/apiRedes/ofertante';
const MS_POSTULANTE_URL = 'http://localhost:3314/apiRedes/postulante';
const MS_CONVOCATORIA_URL = 'http://localhost:3308/apiRedes/convocatoria';


/**
 * Helper para obtener el nombre completo del usuario por ID.
 */
async function obtenerNombreUsuarioInterno(idUser) {
    const user = await userModel.consultarNombrexId(idUser); 
    return user.nombreCompleto;
}

async function obtenerAreaUsuarioInterno(idUser) {
    const user = await userModel.consultarAreaxId(idUser); 
    return user.area;
}


// ==========================================
// FUNCIONALIDADES PROPIAS (CRUD)
// ==========================================


/**
 * @function createUser
 * @description Crea un nuevo usuario validando campos obligatorios.
 * @route POST /apiRedes/usuarios
 */
exports.createUser = async (req, res) => {
    const { nombre, apellido, email, password, rol, perfil } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !email || !password || !rol) {
        console.warn('⚠️ Log: Intento de crear usuario con datos incompletos.');
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    try {
        const insertId = await userModel.crearUsuarios(nombre, apellido, email, password, rol, perfil);
        console.log(`✅ Log: Usuario creado con ID: ${insertId}`);
        return res.status(201).json({ 
            message: 'Usuario creado exitosamente', 
            id: insertId 
        });
    } catch (error) {
        console.error(`❌ Log: Error al crear usuario: ${error.message}`);
        return res.status(500).json({ error: `Error interno del servidor: ${error.message}` });
    }
};

/**
 * @function getUsers
 * @description Obtiene todos los usuarios.
 * @route GET /apiRedes/usuarios
 */
exports.getUsers = async (req, res) => {
    try {
        const result = await userModel.obtenerUsuarios();
        console.log(`✅ Log: Se consultaron ${result.length} usuarios.`);
        return res.status(200).json(result);
    } catch (error) {
        console.error(`❌ Log: Error al obtener usuarios: ${error.message}`);
        return res.status(500).json({ error: 'Error interno al obtener usuarios.' });
    }
};

/**
 * @function getUserById
 * @description Obtiene un usuario por su ID.
 * @route GET /apiRedes/usuarios/:id
 */
exports.getUserById = async (req, res) => {
    const idUser = req.params.id;

    if (isNaN(idUser)) {
        return res.status(400).json({ error: 'El ID debe ser numérico.' });
    }

    try {
        const result = await userModel.obtenerUsuarioPorId(idUser);
        if (!result) {
            console.warn(`⚠️ Log: Usuario con ID ${idUser} no encontrado.`);
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        console.log(`✅ Log: Usuario ID ${idUser} consultado.`);
        return res.status(200).json(result);
    } catch (error) {
        console.error(`❌ Log: Error al obtener usuario por ID: ${error.message}`);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

/**
 * @function editUser
 * @description Edita la información de un usuario.
 * @route PUT /apiRedes/usuarios
 */
exports.editUser = async (req, res) => {
    const { id, nombre, apellido, rol, perfil } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Se requiere el ID del usuario para editar.' });
    }

    try {
        const affectedRows = await userModel.editarUsuario(id, nombre, apellido, rol, perfil);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado o sin cambios.' });
        }
        console.log(`✅ Log: Usuario ID ${id} actualizado.`);
        return res.status(200).json({ message: 'Usuario actualizado exitosamente.' });
    } catch (error) {
        console.error(`❌ Log: Error al editar usuario: ${error.message}`);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

/**
 * @function deleteUser
 * @description Elimina un usuario.
 * @route DELETE /apiRedes/usuarios
 */
exports.deleteUser = async (req, res) => {

    const idUser = req.params.idUser;

    if (!idUser) {
        return res.status(400).json({ error: 'Se requiere el ID para eliminar.' });
    }

    try {
        const affectedRows = await userModel.eliminarUsuario(idUser);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        console.log(`✅ Log: Usuario ID ${idUser} eliminado.`);
        return res.status(200).json({ message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error(`❌ Log: Error al eliminar usuario: ${error.message}`);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

/**
 * @function consultarNombre
 * @description Consulta el nombre completo de un usuario por email.
 * @route GET /apiRedes/usuarios/nombre/:emailUser
 */
exports.consultarNombre = async (req, res) => {
    const idUser = req.params.idUser;
    try {
        const result = await userModel.consultarNombrexId(idUser);
        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado con ese email.' });
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error(`❌ Log: Error consultando nombre: ${error.message}`);
        return res.status(500).json({ error: 'Error interno.' });
    }
};



// ==========================================
// FUNCIONALIDADES RELACIONES (ORQUESTACIÓN)
// ==========================================


/**
 * @async
 * @function crearProyecto
 * @description Orquesta la creación de un proyecto. Verifica el usuario y luego llama al MS Proyectos.
 * @route POST /apiRedes/usuarios/:emailUser/proyecto
 */
exports.crearProyecto = async (req, res) => {
    const idUser = req.params.idUser;
    
    try {
        const {
            titulo, descripcion, estado, url, fechaInicio, fechaFin, 
            lucesDep, arteDep, camaraDep, postProdDep, direccionDep
        } = req.body;

        // 1. Validaciones iniciales
        if (!titulo || !descripcion || !fechaInicio) {
            console.warn('⚠️ Log: Datos mínimos incompletos para crear proyecto.');
            return res.status(400).json({
                error: 'Faltan campos obligatorios (titulo, descripcion, fechaInicio).'
            });
        }

        // 2. Verificar existencia del usuario (Organizador)
        const nombreOrganizador = await obtenerNombreUsuarioInterno(idUser);

        // 3. Preparar payload para el MS de Proyectos
        const proyectoPayload = {
            titulo,
            organizador: nombreOrganizador,
            descripcion,
            estado: estado || 'activo', 
            url,
            fechaInicio,
            fechaFin,
            lucesDep: lucesDep || 0,
            arteDep: arteDep || 0,
            camaraDep: camaraDep || 0,
            postProdDep: postProdDep || 0,
            direccionDep: direccionDep || 0
        };

        // 4. Comunicación entre microservicios
        try {
            const response = await axios.post(PROYECTO_API_URL, proyectoPayload);
            console.log(`📡 Log: Proyecto creado exitosamente en MS Proyectos. ID: ${response.data.idProyecto}`);
            
            return res.status(201).json({
                message: 'Proyecto creado exitosamente.',
                user: nombreOrganizador.nombreCompleto,
                tituloProyecto: proyectoPayload.titulo,
                idProyecto: response.data.idProyecto
            });

        } catch (axiosError) {
            console.error(`❌ Log: Error de comunicación con MS Proyectos: ${axiosError.message}`);
            if (axiosError.response) {
                return res.status(axiosError.response.status).json({ 
                    error: 'Error en el microservicio de proyectos.',
                    detalle: axiosError.response.data 
                });
            }
            return res.status(503).json({ error: 'El servicio de proyectos no está disponible.' });
        }

    } catch (error) {
        console.error('❌ Log: Error fatal en crearProyecto (Usuario):', error.message);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

/**
 * Microservicio Ofertante: Crear una oferta
 * @route POST /apiRedes/usuarios/:idUser/oferta
 */
exports.crearOfertaUsuario = async (req, res) => {
    const { idUser } = req.params;
    const { fechaInicio, fechaFin} = req.body;

    // 1. Obtener datos del usuario para relacionar
        // Nota: Asumimos que el 'area' viene del body o del perfil del usuario.
        // Si el 'rol' del usuario es el área, deberíamos sacar el rol de la DB.
        const usuarioCompleto = await obtenerNombreUsuarioInterno(idUser);
        const areaFinal = await obtenerAreaUsuarioInterno(idUser);

    try {
        
        
        if (!usuarioCompleto) return res.status(404).json({ error: "Usuario no encontrado" });
        if (!areaFinal) return res.status(404).json({ error: "Usuario no encontrado" });


        const payload = {
            nombre_usuario: usuarioCompleto,
            area: areaFinal,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            estado_of: 'disponible'
        };

        

        // 2. Llamar al MS Ofertante
        const response = await axios.post(MS_OFERTANTE_URL, payload);

        res.status(201).json({
            message: "Oferta creada exitosamente vinculada al usuario",
            data: response.data
        });

    } catch (error) {
        console.error("Error creando oferta:", error.message);
        console.log(usuarioCompleto, areaFinal);
        res.status(500).json({ error: "Error al comunicarse con Microservicio Ofertante" });
    }
};

/**
 * Microservicio Ofertante: Consultar Ofertas por estado "Solicitado" por IdUsuario
 * @route GET /apiRedes/usuarios/:idUser/ofertas/solicitadas
 */
exports.consultarOfertasSolicitadas = async (req, res) => {
    const { idUser } = req.params;

    try {
        // 1. Obtener nombre del usuario
        const nombreUsuario = await obtenerNombreUsuarioInterno(idUser);

        // 2. Obtener TODAS las ofertas
        const response = await axios.get(MS_OFERTANTE_URL);
        const todasLasOfertas = response.data;

        // 3. Filtrar en memoria (Lógica de negocio)
        const ofertasSolicitadas = todasLasOfertas.filter(oferta => 
            oferta.nombre_usuario === nombreUsuario && 
            oferta.estado_of && oferta.estado_of.toLowerCase() === 'solicitado'
        );

        res.status(200).json(ofertasSolicitadas);

    } catch (error) {
        console.error("Error consultando ofertas:", error.message);
        res.status(500).json({ error: "Error al consultar ofertas del usuario" });
    }
};

/**
 * Microservicio Ofertante: Actualizar el estado de la oferta por IdUsuario
 * @route PUT /apiRedes/usuarios/:idUser/oferta/:idOferta
 */
exports.actualizarEstadoOfertaUsuario = async (req, res) => {
    const { idUser, idOferta } = req.params;
    const { estado_of } = req.body;

    try {
        // 1. Validar que el usuario sea el dueño de la oferta (Seguridad básica)
        const nombreUsuario = await obtenerNombreUsuarioInterno(idUser);
        
        // Verificamos la oferta antes de actualizar
        const ofertaResponse = await axios.get(`${MS_OFERTANTE_URL}/${idOferta}`);
        const oferta = ofertaResponse.data;

        if (oferta.nombre_usuario !== nombreUsuario) {
            return res.status(403).json({ error: "Esta oferta no pertenece al usuario indicado." });
        }

        // 2. Actualizar en MS Ofertante
        const updateResponse = await axios.put(`${MS_OFERTANTE_URL}/${idOferta}`, { estado_of });

        res.status(200).json({
            message: "Estado de oferta actualizado correctamente",
            data: updateResponse.data
        });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: "Oferta no encontrada en el microservicio remoto." });
        }
        console.error("Error actualizando oferta:", error.message);
        res.status(500).json({ error: "Error de comunicación con MS Ofertante" });
    }
};

/**
 * Microservicio Postulaciones: Crear una postulación
 * @route POST /apiRedes/usuarios/:idUser/postulacion/:idConvocatoria
 */
exports.crearPostulacionUsuario = async (req, res) => {
    const { idUser, idConvocatoria } = req.params;

    try {
        // 1. Obtener nombre del Usuario
        const nombreUsuario = await obtenerNombreUsuarioInterno(idUser);

        // 2. Obtener detalles de la Convocatoria para sacar el título
        const convResponse = await axios.get(`${MS_CONVOCATORIA_URL}/${idConvocatoria}`);
        const convocatoria = convResponse.data;

        if (!convocatoria) {
            return res.status(404).json({ error: "La convocatoria especificada no existe." });
        }

        // 3. Construir payload para MS Postulante
        const payload = {
            usuarioPos: nombreUsuario,
            tituloConvocatoria: convocatoria.tituloCon, 
            mensajePres: "Estoy interesado en participar.",
            estadoPost: 'en espera'
        };

        // 4. Crear postulación
        const postResponse = await axios.post(MS_POSTULANTE_URL, payload);

        res.status(201).json({
            message: "Postulación creada exitosamente",
            data: postResponse.data
        });

    } catch (error) {
        console.error("Error creando postulación:", error.message);
        res.status(500).json({ error: "Error al procesar la postulación entre microservicios." });
    }
};

/**
 * Microservicio Postulaciones: Consultar Postulaciones por IdUsuario
 * @route GET /apiRedes/usuarios/:idUser/postulaciones
 */
exports.consultarPostulacionesUsuario = async (req, res) => {
    const { idUser } = req.params;

    try {
        // 1. Obtener nombre del usuario
        const nombreUsuario = await obtenerNombreUsuarioInterno(idUser);

        // 2. Obtener TODAS las postulaciones
        const response = await axios.get(MS_POSTULANTE_URL);
        const todasLasPostulaciones = response.data;

        // 3. Filtrar por nombre de usuario
        const misPostulaciones = todasLasPostulaciones.filter(post => 
            post.usuarioPos === nombreUsuario
        );

        res.status(200).json(misPostulaciones);

    } catch (error) {
        console.error("Error consultando postulaciones:", error.message);
        res.status(500).json({ error: "Error al obtener postulaciones del usuario." });
    }
};
