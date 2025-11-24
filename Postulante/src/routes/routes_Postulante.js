
const express = require("express");
const router = express.Router();

const controllerPostulante = require("../controllers/postulanteController");

// Rutas CRUD y Lógica de Negocio
router.get("/", controllerPostulante.listar);                           // Listar todas
router.get("/:idPost", controllerPostulante.obtener);                   // Obtener detalle
router.post("/", controllerPostulante.crear);                           // Crear simple
router.patch("/:idPost/estado", controllerPostulante.actualizarEstado); // Actualizar estado

module.exports = router;
