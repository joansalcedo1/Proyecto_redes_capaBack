const express = require("express")
const ofertanteController = require('../controllers/ofertanteController')
const router = express.Router()

// Rutas principales del microservicio Ofertante
router.get("/", ofertanteController.obtenerOfertas);
router.get("/:id_oferta", ofertanteController.obtenerOfertaPorId);
router.post("/", ofertanteController.crearOferta);
router.put("/:id_oferta", ofertanteController.actualizarEstadoOferta);
router.delete("/:id_oferta", ofertanteController.eliminarOferta);


module.exports = router