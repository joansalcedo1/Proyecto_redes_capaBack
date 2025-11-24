const express = require("express")
const controllerUsuario = require('../controllers/usuarioController.js')
const router = express.Router()

// Rutas CRUD Básicas de Usuario
router.post("/", controllerUsuario.createUser);           // Crear usuario
router.get("/", controllerUsuario.getUsers);              // Obtener todos
router.get("/:idUser", controllerUsuario.getUserById);        // Obtener uno por ID
router.put("/", controllerUsuario.editUser);              // Editar usuario
router.delete("/:id", controllerUsuario.deleteUser);         // Eliminar usuario

// Rutas de lógica de negocio y orquestación
router.get("/nombre/:idUser", controllerUsuario.consultarNombre);      // Consultar nombre por email
router.post("/:idlUser/proyecto", controllerUsuario.crearProyecto);     // Orquestar creación de proyecto

module.exports = router;