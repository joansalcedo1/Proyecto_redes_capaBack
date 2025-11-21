const userModel = require("../models/usuarioModel")
const PROYECTO_API_URL = 'http://localhost:3312/apiRedes/proyecto/';

exports.createUser = async (req, res) => {
    try {
        const { nombre, apellido, email, password, rol, perfil } = req.body;
        const user = await userModel.crearUsuarios(nombre, apellido, email, password, rol,perfil)
        if (!user) {
            return res.status(400).json(`La respuesta fue vacia: ${user}}`)
        }
        return res.status(201).json(user)
    } catch (error) {
        console.error(`Hubo un error:${error}`)
        return res.status(500).json(`Hubo un error creando el usuario ${error}`)
    }
}

exports.getUsers = async (req, res) => {
    try {
        const result = await userModel.obtenerUsuarios()
        if (!result) {
            return res.status(400).json(`La respuesta fue vacia: ${result}}`)
        }
        return res.status(200).json(result)
    } catch (error) {
        console.error(`Hubo un error manito ${error}`)
        return res.status(500).json(`Hubo error en el servidor ${error}`)
    }
}

exports.getUserById = async (req, res) => {
    try {
        const idUser = req.params.id;
        const result = await userModel.obtenerUsuarioPorId(idUser)
        if (!result) {
            return res.status(400).json(`La respuesta fue vacia: ${idUser}}`)

        }
        return res.status(200).json(result)

    } catch (error) {
        console.error(`Hubo un error manito ${error}`)
        return res.status(500).json(`Hubo error en el servidor ${error}`)
    }
}

exports.editUser = async (req, res) => {
    try {
        const content = req.body
        const result = await userModel.editarUsuario(content)
        if (!result) {
            return res.status(400).json(`La respuesta fue vacia: ${user}}`)

        }
        return res.status(200).json(result)

    } catch (error) {
        console.error(`Hubo un error manito ${error}`)
        return res.status(500).json(`Hubo error en el servidor ${error}`)
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const email = req.body
        const result = await userModel.eliminarUsuario(email)
        if (!result) {
            return res.status(400).json(`La respuesta fue vacia: ${user}}`)
        }
        return res.status(200).json(result)

    } catch (error) {
        console.error(`Hubo un error manito ${error}`)
        return res.status(500).json(`Hubo error en el servidor ${error}`)
    }
}

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

exports.consultarNombre = async (req, res) => {
    const email = req.params.emailUser;
    try {
        const result = await userModel.consultarNombrexEmail(email);

        if (!result) {
            return res.status(404).json(`La respuesta fue vacia`)
        }
        return res.status(200).json(result)
    } catch (error) {
        console.error(error);
        return error;
    }
}


/**
 * @async
 * @function crearProyecto
 * @description Crea un nuevo proyecto en el Microservicio de Proyectos, obteniendo primero el nombre del director (organizador) del Microservicio de Usuarios.
 * @route POST /apiRedes/usuario/crear-proyecto (Ruta de ejemplo para el Microservicio de Usuarios)
 * @param {object} req - Objeto de la solicitud HTTP (contiene body con todos los datos del proyecto, incluido el email del director).
 * @param {object} res - Objeto de la respuesta HTTP.
 * @documentation Este método orquesta dos llamadas: GET al propio MS de Usuarios (para el nombre) y POST al MS de Proyectos (para la creación).
 */
exports.crearProyecto = async (req, res) => {

    const organizadorEmail = req.params.emailUser;
    try {

        const {
        titulo, descripcion, estado, url, fechaInicio, fechaFin, lucesDep, arteDep, camaraDep, postProdDep, direccionDep
        } = req.body;

        // --- Validación inicial ---
        if (!titulo || !descripcion || !fechaInicio) {
            console.warn('⚠️ Log: Datos mínimos incompletos para crear proyecto.');
            return res.status(400).json({
                error: 'Faltan campos obligatorios (titulo, descripcion, fechaInicio).'
            });
        }

        const userName = await userModel.consultarNombrexEmail(organizadorEmail);
        if (!userName) {
            console.warn(`⚠️ Log: Email User ${organizadorEmail} no encontrado para crear proyecto.`);
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const proyectoPayload = {
            titulo,
            organizador: userName.nombreCompleto, 
            descripcion,
            estado: estado || 'activo', 
            url,
            fechaInicio,
            fechaFin,
            lucesDep,
            arteDep,
            camaraDep,
            postProdDep,
            direccionDep
        };

        try {
            const response = await axios.post(PROYECTO_API_URL, proyectoPayload);
            console.log(`📡 Log: Proyecto creado por ${userName.nombreCompleto} con éxito. ${response.text()}`);
        } catch (axiosError) {
            if (axiosError.response) {
                console.error(`❌ Log: Error HTTP (${axiosError.response.status}) al crear Proyecto para ${userName.nombreCompleto}. Detalles: ${JSON.stringify(axiosError.response.data)}`);
                erroresConvocatoria.push(`Error al crear Proyecto: ${JSON.stringify(axiosError.response.data).substring(0, 50)}...`);
            } else {
                console.error(`❌ Log: Error de RED/AXIOS al crear Proyecto Detalles: ${axiosError.message}`);
                erroresConvocatoria.push(`Error de red al crear Proyecto.`);
            }
        }

        console.log(`✅ Log: Creacion del Proyecto completado para el usuario ${userName.nombreCompleto}.`);
        res.status(200).json({
            user: userName.nombreCompleto,
            tituloProyecto: proyectoPayload.titulo
        });

    } catch (error) {
        console.error(error);
        return error;
    }

}

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