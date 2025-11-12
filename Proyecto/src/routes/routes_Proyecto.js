const express = require("express")
//Cambiar el nombre de de la variable "controllerAuth" a el nombre de su microservicio
//Por ejemplo: "controllerPostulante"
//Al
const proyectoController = require('../controllers/proyectoController.js')
const router = express.Router()

/**
 * @route POST /apiRedes/proyecto/
 * @description Crea un nuevo proyecto en la base de datos.
 * @access Public
 */
router.post('/', proyectoController.crearProyecto);

/**
 * @route GET /apiRedes/proyecto/
 * @description Consulta y obtiene la lista completa de todos los proyectos.
 * @access Public
 */
router.get('/', proyectoController.consultarProyectos);

/**
 * @route PUT /apiRedes/proyecto/estado/:id
 * @description Actualiza únicamente el campo 'estado' de un proyecto específico.
 * @access Public
 * @param {number} id - El ID del proyecto.
 */
// NOTA: Se ha elegido una ruta más específica ('/estado/:id') para indicar
// que esta es una actualización parcial (solo el estado) y no una edición completa (PUT general).
router.put('/estado/:id', proyectoController.actualizarEstadoProyecto);

/**
 * @route GET /apiRedes/proyecto/:id
 * @description Consulta la información detallada de un proyecto por su ID.
 * @access Public
 * @param {number} id - El ID del proyecto (obtenido de los parámetros de la URL).
 */
router.get('/:id', proyectoController.consultarInformacionProyecto);

/**
 * @route POST /apiRedes/proyecto/:id/lanzar-convocatorias
 * @description Activa la creación de las convocatorias asociadas a un proyecto específico.
 * @access Public
 * @param {number} id - El ID del proyecto.
 * @body {object} numPersSolicitad, fechaCierre - Datos ingresados por el usuario.
 */
router.post('/:id/lanzar-convocatorias', proyectoController.lanzarConvocatorias);

// Exportamos el router para que pueda ser usado en app.js
module.exports = router;