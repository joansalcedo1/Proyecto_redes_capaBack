const express = require("express")
const controller = require('../controllers/convocatoriaController.js')
const router = express.Router()

// Rutas de Convocatoria
router.post('/', controller.crearConvocatoria);                                 // Crear
router.get('/', controller.consultarConvocatorias);                             // Listar todas
router.get('/:idConvocatoria', controller.consultarInformacionConvocatoria);    // Detalle por ID
router.put('/:idConvocatoria/estado', controller.actualizarEstadoConvocatoria); // Actualizar Estado

// Rutas de Participantes dentro de Convocatoria
router.post('/participantes', controller.crearParticipante);                    // Agregar participante
router.get('/participantes/:idConvocatoria', controller.consultarParticipantes);// Listar participantes por convocatoria


module.exports = router;