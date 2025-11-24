const userModel = require("../models/usuarioModel")
const axios = require('axios');

// URL del microservicio de proyectos 
const PROYECTO_API_URL = 'http://localhost:3312/apiRedes/proyecto/';

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
    // Nota: Asumo que recibes el ID en el body según tu código original, 
    // aunque RESTful prefiere recibirlo por params (DELETE /:id).
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

/*
exports.consultarAllByEmail = async (req, res) => {
    try {
        const email = req.body.email;
        // 🚨 CORRECCIÓN CLAVE: ¡Faltaba el 'await'!
        const result = await userModel.consultarInfoxEmail(email); 

        if (!result || result.length === 0) {
            // El usuario no fue encontrado o la respuesta está vacía
            return res.status(404).json({ message: `Usuario con email ${email} no encontrado.` });
        }
        
        // Devuelve el primer elemento del array (el usuario)
        return res.status(200).json(result); 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor al consultar por email." });
    }
}*/

/**
 * @function consultarNombre
 * @description Consulta el nombre completo de un usuario por email.
 * @route GET /apiRedes/usuarios/nombre/:emailUser
 */
exports.consultarNombre = async (req, res) => {
    const idUser = req.params.idUser;
    try {
        const result = await userModel.consultarNombrexEmail(idUser);
        if (!result) {
            return res.status(404).json({ message: 'Usuario no encontrado con ese email.' });
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error(`❌ Log: Error consultando nombre: ${error.message}`);
        return res.status(500).json({ error: 'Error interno.' });
    }
};


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
        const userData = await userModel.consultarNombrexId(idUser);
        if (!userData) {
            console.warn(`⚠️ Log: Email User ${idUser} no encontrado para crear proyecto.`);
            return res.status(404).json({ message: 'Usuario organizador no encontrado.' });
        }

        // 3. Preparar payload para el MS de Proyectos
        const proyectoPayload = {
            titulo,
            organizador: userData.nombreCompleto, 
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
                user: userData.nombreCompleto,
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

/*
exports.crerOfertante= async(req,res)=>{
    const {fechaInicio,fechaFin,area,estadoOferta} = req.body
    const emailParams= req.params.email 
    const consulta= await userModel.consultarNombrexEmail(emailParams)
    const nombreCompleto = consulta.nombreCompleto
    try {
        const fetchRes = await fetch(`url de ofertantes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fechaInicio,
                fechaFin,
                nombreCompleto, area, estadoOferta
            })
        })
        // 4. Manejar errores HTTP de la API externa
        if (!fetchRes.ok) {
            const errText = await fetchRes.text();
            console.error(`Error de la API externa: ${errText}`);
            
            // 🚨 CORRECCIÓN 2: Sintaxis correcta de res.status().json()
            return res.status(fetchRes.status).json({ 
                message: "Error al crear ofertante en la API de Proyectos.", 
                details: errText 
            });
        }

        const data = await fetchRes.json();
        // 🚨 CORRECCIÓN CLAVE: Devolver la respuesta JSON con el objeto 'res' de Express
        return res.status(201).json(data);
    } catch (error) {
        // 6. Manejar errores de conexión o de la base de datos local
        console.error("Error en la lógica del controlador:", error);
        // 🚨 CORRECCIÓN CLAVE: Devolver un error 500 al cliente con el objeto 'res' de Express
        return res.status(500).json({ 
            message: "Error interno del servidor.", 
            error: error.message 
        });
    }
}*/