//Script que contiene la logica de cada uno de los metodos que se van a hacer
const axios = require('axios');
const ofertanteModel = require("../models/ofertanteModel")

// URL del microservicio de Convocatoria (Participantes)
const MS_CONVOCATORIA_BASE = "http://localhost:3308/apiRedes/convocatoria";

/**
 * @function crearOferta
 * @description Crea una nueva oferta validando los campos requeridos.
 * @route POST /apiRedes/ofertante
 */
async function crearOferta(req, res) {
  const { nombre_usuario, area, fecha_inicio, fecha_fin, estado_of } = req.body;

    if (!nombre_usuario || !area || !fecha_inicio || !fecha_fin) {
        console.warn('⚠️ Log: Intento de crear oferta con datos incompletos.');
        return res.status(400).json({ error: "Faltan campos obligatorios (nombre_usuario, area, fechas)." });
    }

    try {
        const idOferta = await ofertanteModel.crearOferta(nombre_usuario, area, fecha_inicio, fecha_fin, estado_of);
        console.log(`✅ Log: Oferta creada con éxito. ID: ${idOferta}`);
        res.status(201).json({ 
            mensaje: "Oferta creada con éxito", 
            id_oferta: idOferta 
        });
    } catch (error) {
        console.error("❌ Log: Error al crear oferta:", error.message);
        res.status(500).json({ error: "Error interno del servidor al crear la oferta" });
    }
}

/**
 * @function obtenerOfertas
 * @description Obtiene todas las ofertas disponibles.
 * @route GET /apiRedes/ofertante
 */
async function obtenerOfertas(req, res) {
  try {
    const ofertas = await ofertanteModel.obtenerOfertas();
    console.log(`✅ Log: Se consultaron ${ofertas.length} ofertas.`);
    res.status(200).json(ofertas);
  } catch (error) {
    console.error("❌ Log: Error al obtener ofertas:", error.message);
    res.status(500).json({ error: "Error del servidor al obtener las ofertas" });
  }
}


/**
 * @function obtenerOfertasPorEstado
 * @description Obtiene todas las ofertas disponibles.
 * @route GET /apiRedes/ofertante
 */
async function obtenerOfertasPorEstado(req, res) {
  const { estado } = req.params;
  try {
    const ofertas = await ofertanteModel.obtenerOfertaPorEstado(estado);
    console.log(`✅ Log: Se consultaron ${ofertas.length} ofertas con estado ${estado}.`);
    res.status(200).json(ofertas);
  } catch (error) {
    console.error("❌ Log: Error al obtener ofertas:", error.message);
    res.status(500).json({ error: "Error del servidor al obtener las ofertas" });
  }
}



/**
 * @function obtenerOfertaPorId
 * @description Consulta una oferta por su ID.
 * @route GET /apiRedes/ofertante/:id_oferta
 */
async function obtenerOfertaPorId(req, res) {
  const { id_oferta } = req.params;
  if (isNaN(id_oferta)) {
      return res.status(400).json({ error: 'El ID debe ser numérico.' });
  }

  try {
    const oferta = await ofertanteModel.obtenerOfertaPorId(id_oferta);
    if (!oferta) {
      console.warn(`⚠️ Log: Oferta ID ${id_oferta} no encontrada.`);
      return res.status(404).json({ error: "Oferta no encontrada" });
    }
    console.log(`✅ Log: Oferta ID ${id_oferta} consultada.`);
    res.status(200).json(oferta);
  } catch (error) {
    console.error("Error al obtener oferta por ID:", error);
    res.status(500).json({ error: "Error del servidor al obtener la oferta" });
  }
}

/**
 * @function actualizarEstadoOferta
 * @description Actualiza el estado de la oferta y notifica al MS Convocatoria si se confirma.
 * @route PUT /apiRedes/ofertante/:id_oferta
 */
async function actualizarEstadoOferta(req, res) {
  const { id_oferta } = req.params;
    const { estado_of, convocatoria } = req.body;

  if (!estado_of) {
      return res.status(400).json({ error: "El nuevo estado es requerido." });
  }
  try {
      // 1. Verificar si la oferta existe
      const ofertaExistente = await ofertanteModel.obtenerOfertaPorId(id_oferta);
      if (!ofertaExistente) {
          return res.status(404).json({ error: "Oferta no encontrada para actualizar." });
      }

      // 2. Actualizar estado localmente
      await ofertanteModel.actualizarEstadoOferta(id_oferta, estado_of, convocatoria);
      
      console.log(`✅ Log: Estado de oferta ${id_oferta} actualizado a "${estado_of}"`);

      // 3. Lógica de Relación: Si el estado pasa a "Confirmado"
        if (estado_of.toLowerCase() === 'confirmado') {
            try {
                const convocatoriaTitulo = ofertaExistente.convocatoria;
                const areaBusqueda = ofertaExistente.area;

                    // Consultamos todas las convocatorias para filtrar
                    const respConv = await axios.get(MS_CONVOCATORIA_BASE);
                    
                    const todasConvocatorias = respConv.data;
                    console.log(`✅ Log: ${todasConvocatorias.length} convocatorias recibidas para relación.`);
                    

                    // Filtramos: Match Título Proyecto y Área
                    const convocatoriaMatch = todasConvocatorias.find(c => {

                      const convocatoriaMatch = c.tituloProyecto === convocatoriaTitulo && 
                        c.areaRequerida === areaBusqueda;
                      console.log("Evaluando convocatoria:", c.tituloProyecto, convocatoriaTitulo, "Área requerida:", c.areaRequerida, "=> Match:", areaBusqueda, convocatoriaMatch);
                      return convocatoriaMatch;
                    });


                    if (convocatoriaMatch) {
                        // Crear Participante
                        await axios.post(`${MS_CONVOCATORIA_BASE}/participantes`, {
                            nombre: ofertaExistente.nombre_usuario,
                            idConvocatoria: convocatoriaMatch.idConvocatoria
                        });
                        console.log(`✅ Relación: Participante creado en Convocatoria ${convocatoriaMatch.idConvocatoria}`);
                    } else {
                        console.warn("⚠️ No se encontró convocatoria match para crear participante automáticamente.");
                    }
                
            } catch (relError) {
                console.error("❌ Error creando participante automático:", relError.message);
                // No fallamos la petición principal, solo logueamos el error de relación
            }
        }

      res.status(200).json({ mensaje: "Estado de la oferta actualizado con éxito" });
    } catch (error) {
        console.error("❌ Log: Error al actualizar estado de la oferta:", error.message);
        res.status(500).json({ error: "Error interno del servidor al actualizar el estado" });
    }
}

/**
 * @function eliminarOferta
 * @description Elimina una oferta de la base de datos.
 * @route DELETE /apiRedes/ofertante/:id_oferta
 */
async function eliminarOferta(req, res) {
    const { id_oferta } = req.params;

    try {
        const affectedRows = await ofertanteModel.eliminarOferta(id_oferta);
        if (affectedRows === 0) {
            return res.status(404).json({ error: "Oferta no encontrada para eliminar." });
        }
        console.log(`✅ Log: Oferta ID ${id_oferta} eliminada.`);
        res.status(200).json({ mensaje: "Oferta eliminada con éxito" });
    } catch (error) {
        console.error("❌ Log: Error al eliminar oferta:", error.message);
        res.status(500).json({ error: "Error interno del servidor al eliminar la oferta" });
    }
}

module.exports = {
  obtenerOfertas,
  obtenerOfertasPorEstado,
  obtenerOfertaPorId,
  crearOferta,
  actualizarEstadoOferta,
  eliminarOferta
};
