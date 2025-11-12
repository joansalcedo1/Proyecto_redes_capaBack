const express = require("express")
const controller = require('../controllers/convocatoriaController.js')
const router = express.Router()

//Para crear otra ruta primero se debe saber que operación hacer: get,put,post,delete
//Luego de eso pensar en como va a ser la url, la base es /apiRedes/<nombre del mirco servicio>/

router.post('/', controller.crearConvocatoria); //Crear una nueva convocatoria
router.get('/', controller.consultarConvocatorias);
router.get('/:idConvocatoria', controller.consultarInformacionConvocatoria);
router.put('/:idConvocatoria/estado', controller.actualizarEstadoConvocatoria);

// ==============================================
// ================ PARTICIPANTES ===============
// ==============================================

router.post('/participantes', controller.crearParticipante);
router.get('/participantes/:idConvocatoria', controller.consultarParticipantes);


module.exports = router;