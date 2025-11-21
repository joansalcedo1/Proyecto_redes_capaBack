const express = require("express")
//Cambiar el nombre de de la variable "controllerAuth" a el nombre de su microservicio
//Por ejemplo: "controllerPostulante"
const controllerUsuario = require('../controllers/usuarioController.js')
const router = express.Router()

//Para crear otra ruta primero se debe saber que operación hacer: get,put,post,delete
//Luego de eso pensar en como va a ser la url, la base es /apiRedes/<nombre del mirco servicio>/

router.post("/", controllerUsuario.createUser);                         //para postear el elemento correspondiente
router.get("/", controllerUsuario.getUsers);                            //obtener todos los usuarios
router.get("/:id", controllerUsuario.getUserById);                      //obtener todos los usuarios
router.put("/", controllerUsuario.editUser);                            //para editar cualquier elemento correspondiente
router.delete("/",controllerUsuario.deleteUser)                         //para eliminar cualquier elemento correspondiente
router.get("/:emailUser", controllerUsuario.consultarNombre)            //consultar el nombre del usuario
router.get("/:emailUser/proyecto", controllerUsuario.consultarNombre)   //consultar el nombre del usuario



module.exports = router