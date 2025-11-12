const express = require("express")
//Cambiar el nombre de de la variable "controllerAuth" a el nombre de su microservicio
//Por ejemplo: "controllerPostulante"
//Al
const controllerConvocatoria = require('../controllers/convocatoriaController.js')
const router = express.Router()

//Para crear otra ruta primero se debe saber que operación hacer: get,put,post,delete
//Luego de eso pensar en como va a ser la url, la base es /apiRedes/<nombre del mirco servicio>/
router.get("/", controllerConvocatoria.getUsers);

/*
router.get("/:id", controllerAuth.getUserById) conseguir id a traves de los params 
router.post("/", controllerAuth.createUser); para postear el elemento correspondiente
router.put("/", controllerAuth.editUser);  para editar cualquier elemento correspondiente
router.delete("/:id",deleteHueco) para eliminar cualquier elemento correspondiente
 */ 
module.exports = router