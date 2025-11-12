//Script que contiene la logica de cada uno de los metodos que se van a hacer
const userModel = require("../models/usuarioModel")

exports.saludo = async (req, res) => {
    res.json("hola");
}

exports.createUser = async (req, res) => {
    try {
        const { nombre, apellido, email, password, rol, perfil } = req.body;
        const user = await userModel.crearUsuarios(nombre, apellido, email, password, rol,perfil)
        if (!user) {
            return res.status(400).json(`La respuesta fue vacia: ${user}}`)
        }
        return res.status(201).json(user)
    } catch (error) {
        console.error(`Hubo un error manito:${error}`)
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
        const { id } = req.params
        const result = await userModel.obtenerUsuarioPorId(id)
        if (!result) {
            return res.status(400).json(`La respuesta fue vacia: ${user}}`)

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
}

exports.consultarNombre = async (req, res) => {
    try {
        const email = req.body.email;
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

exports.crearProyecto = async (req, res) => {
    try {

        const titulo = req.body.titulo
        const organizador = req.body.organizador
        const descripcion = req.body.descripcion
        const estado = req.body.estado
        const url = req.body.url
        const fechaInicio = req.body.fechaInicio
        const fechaFin = req.body.fechaFin
        const necesitaLuces = req.body.necesitaLuces
        const necesitaArte = req.body.necesitaArte
        const necesitaCamara = req.body.necesitaCamara
        const necesitaPost = req.body.necesitaPost
        const necesitaDirecc = req.body.necesitaDirecc

        const res = await fetch(`url de proyectos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                titulo, organizador, descripcion, estado, url, fechaInicio,
                fechaFin, necesitaLuces, necesitaArte, necesitaCamara,
                necesitaPost, necesitaDirecc
            })
        })
        // Manejar errores HTTP
        if (!res.ok) {
            const errText = await res.text();
            console.log(errText)
            return res
        }
        const data = await res.json();
        return data;

    } catch (error) {
        console.error(error);
        return error;
    }

}

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
}