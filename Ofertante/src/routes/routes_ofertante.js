const express = require("express")
//Cambiar el nombre de de la variable "controllerAuth" a el nombre de su microservicio
//Por ejemplo: "controllerPostulante"
//Al
const ofertanteController = require('../controllers/ofertanteController')
const router = express.Router()

//Para crear otra ruta primero se debe saber que operación hacer: get,put,post,delete
//Luego de eso pensar en como va a ser la url, la base es /apiRedes/<nombre del mirco servicio>/

// Rutas principales del microservicio Ofertante

// Obtener todas las ofertas
router.get("/", ofertanteController.obtenerOfertas);

// Consultar la información de una oferta por su ID
router.get("/:id_oferta", ofertanteController.obtenerOfertaPorId);

// Crear una nueva oferta
router.post("/", ofertanteController.crearOferta);

// Actualizar el estado de una oferta por ID
router.put("/:id_oferta", ofertanteController.actualizarEstadoOferta);

// Eliminar una oferta
router.delete("/:id_oferta", ofertanteController.eliminarOferta);

/*
router.get("/:id", controllerAuth.getUserById) conseguir id a traves de los params 
router.post("/", controllerAuth.createUser); para postear el elemento correspondiente
router.put("/", controllerAuth.editUser);  para editar cualquier elemento correspondiente
router.delete("/:id",deleteHueco) para eliminar cualquier elemento correspondiente
 */ 
module.exports = router