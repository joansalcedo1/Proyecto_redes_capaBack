const express = require("express")
const controllerUsuario = require('../controllers/usuarioController.js')
const router = express.Router()

// Rutas CRUD Básicas de Usuario
router.post("/", controllerUsuario.createUser);           // Crear usuario
router.get("/", controllerUsuario.getUsers);              // Obtener todos
router.get("/:idUser", controllerUsuario.getUserById);        // Obtener uno por ID
router.put("/", controllerUsuario.editUser);              // Editar usuario
router.delete("/:idUser", controllerUsuario.deleteUser);         // Eliminar usuario
router.get("/nombre/:idUser", controllerUsuario.consultarNombre);      // Consultar nombre por email

// Ruta de Login
router.post("/login", controllerUsuario.login);           // Login del usuario

// --- FUNCIONALIDADES RELACIONES (Orquestación de Microservicios) ---


router.post("/:idUser/proyecto", controllerUsuario.crearProyecto);                                  //Proyecto: Crear un proyecto asociado al usuario

// 2. Ofertante: Crear una oferta (User -> Ofertante)
router.post("/:idUser/oferta", controllerUsuario.crearOfertaUsuario);

// 3. Ofertante: Consultar Ofertas con estado "Solicitado" de este usuario
router.get("/:idUser/ofertas/solicitadas", controllerUsuario.consultarOfertasSolicitadas);

// 4. Ofertante: Actualizar estado de una oferta específica del usuario
router.put("/:idUser/oferta/:idOferta", controllerUsuario.actualizarEstadoOfertaUsuario);

// 5. Postulaciones: Crear postulación (User + Convocatoria -> Postulante)
router.post("/:idUser/postulacion/:idConvocatoria", controllerUsuario.crearPostulacionUsuario);

// 6. Postulaciones: Ver postulaciones propias
router.get("/:idUser/postulaciones", controllerUsuario.consultarPostulacionesUsuario);

router.get("/:idUser/proyectos", controllerUsuario.consultarProyectosUsuario);

module.exports = router;