//Script que contiene la logica de cada uno de los metodos que se van a hacer
const axios = require('axios');
const ofertanteModel = require("../models/ofertanteModel")

// Crear una nueva oferta
async function crearOferta(req, res) {
  try {
    const { nombre_usuario, area, fecha_inicio, fecha_fin, estado_of } = req.body;
    const result = await ofertanteModel.crearOferta(nombre_usuario, area, fecha_inicio, fecha_fin, estado_of);
    res.status(201).json({ mensaje: "Oferta creada con éxito", id_oferta: result.insertId });
  } catch (error) {
    console.error("Error al crear oferta:", error);
    res.status(500).json({ error: "Error del servidor al crear la oferta" });
  }
}

// Consultar todas las ofertas
async function obtenerOfertas(req, res) {
  try {
    const ofertas = await ofertanteModel.obtenerOfertas();
    res.status(200).json(ofertas);
  } catch (error) {
    console.error("Error al obtener ofertas:", error);
    res.status(500).json({ error: "Error del servidor al obtener las ofertas" });
  }
}
// Consultar una oferta específica por ID
async function obtenerOfertaPorId(req, res) {
  try {
    const {id_oferta} = req.params;
    const oferta = await ofertanteModel.obtenerOfertaPorId(id_oferta);
    if (!oferta) {
      return res.status(404).json({ error: "Oferta no encontrada" });
    }
    res.status(200).json(oferta);
  } catch (error) {
    console.error("Error al obtener oferta por ID:", error);
    res.status(500).json({ error: "Error del servidor al obtener la oferta" });
  }
}

// Actualizar el estado de una oferta por ID
async function actualizarEstadoOferta(req, res) {
  try {
    const { id_oferta } = req.params;
    const { estado_of} = req.body;
    await ofertanteModel.actualizarEstadoOferta(id_oferta, estado_of);

    if (estado_of === "ocupado" || estado_of === "confirmado") {
      try {
        // Llamada al microservicio Participante (ajustae el puerto según la config)
        await axios.post("http://localhost:3308/apiRedes/convocatoria/participantes", {
          id_oferta: id_oferta,
          //estadoParticipante: "activo"
        });

        console.log(`Se creó un participante automáticamente para la oferta ${id_oferta}`);
      } catch (err) {
        console.error("Error al crear participante desde ofertante:", err.message);
      }
    }

    res.status(200).json({ mensaje: "Estado de la oferta actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar estado de la oferta:", error);
    res.status(500).json({ error: "Error del servidor al actualizar el estado" });
  }
}

// Eliminar una oferta por su ID
async function eliminarOferta(req, res) {
  try {
    const { id_oferta } = req.params;
    await ofertanteModel.eliminarOferta(id_oferta);
    res.status(200).json({ mensaje: "Oferta eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar oferta:", error);
    res.status(500).json({ error: "Error del servidor al eliminar la oferta" });
  }
}

module.exports = {
  obtenerOfertas,
  obtenerOfertaPorId,
  crearOferta,
  actualizarEstadoOferta,
  eliminarOferta
};
