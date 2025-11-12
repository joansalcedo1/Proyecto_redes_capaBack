// src/routes/postulanteRoutes.js
/**
 * Rutas del microservicio POSTULANTE
 * Base path (app.js): /proyecto_redes_capasback/postulante
 *
 * Endpoints expuestos por este router:
 *  GET    /                     -> Listar postulaciones
 *  GET    /:idPost              -> Obtener una postulación por id
 *  POST   /                     -> Crear una postulación
 *  PATCH  /:idPost/estado       -> Actualizar el estado de una postulación
 *
 * Nota: Los handlers son provistos por el controlador.
 */

// const express = require("express");
// const router = express.Router();

// Cambiar "controllerAuth" por el microservicio real:
// -> controllerPostulante
// const controllerPostulante = require("../controllers/postulanteController");

// -------------------------------------------------------------
// Rutas REST
// -------------------------------------------------------------

// GET /proyecto_redes_capasback/postulante/
// Listar todas las postulaciones (acepta query: ?estado=&limit=&offset=)
// router.get("/", controllerPostulante.listar);

// GET /proyecto_redes_capasback/postulante/:idPost
// Conseguir una postulación por ID (idPost vía params)
// router.get("/:idPost", controllerPostulante.obtener);

// POST /proyecto_redes_capasback/postulante/
// Crear una postulación (body: {usuarioPos, tituloConvocatoria, ...})
// router.post("/", controllerPostulante.crear);

// PATCH /proyecto_redes_capasback/postulante/:idPost/estado
// Actualizar SOLO el estado (body: { estado: 'aceptado'|'libre' })
// router.patch("/:idPost/estado", controllerPostulante.actualizarEstado);

// -------------------------------------------------------------
// Exportar router
// -------------------------------------------------------------
module.exports = require('../controllers/postulanteController');
