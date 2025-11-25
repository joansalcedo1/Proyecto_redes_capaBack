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

// ==========================================
// NUEVAS RUTAS DE RELACIÓN (ORQUESTACIÓN)
// ==========================================

// 1. Match con Ofertas (Convocatoria <-> Ofertante)
router.get('/:idConvocatoria/match-ofertas', controller.consultarMatchOfertas);

// 2. Solicitar Oferta/Usuario (Convocatoria -> Ofertante)
router.put('/oferta/:idOferta/solicitar/:idConvocatoria', controller.solicitarOfertaUsuario);

// 3. Confirmar Postulante (Convocatoria -> Postulante)
router.put('/postulacion/:idPostulacion/confirmar', controller.confirmarPostulante);

// 4. Consultar Postulaciones de la Convocatoria (Convocatoria -> Postulante)
router.get('/:idConvocatoria/postulaciones', controller.consultarPostulacionesDeConvocatoria);

// 5. Consultar Convocatorias de un Usuario (Orquestación Compleja)
router.get('/usuario/:idUsuario', controller.consultarConvocatoriasDeUsuario);

module.exports = router;