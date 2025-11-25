const postulanteModel = require('../models/postulanteModel');
const axios = require('axios'); // Usamos axios para consistencia

// URL del microservicio de Convocatoria

const MS_CONVOCATORIA_BASE = "http://localhost:3308/apiRedes/convocatoria";

/**
 * @function listar
 * @description Lista todas las postulaciones.
 * @route GET /apiRedes/postulante
 */
exports.listar = async (req, res) => {
    try {
        const data = await postulanteModel.obtenerPostulaciones();
        console.log(`✅ Log: Se listaron ${data.length} postulaciones.`);
        res.status(200).json(data);
    } catch (err) {
        console.error(`❌ Log: Error listando postulaciones: ${err.message}`);
        res.status(500).json({ message: 'Error interno al listar postulaciones.' });
    }
};

/**
 * @function obtener
 * @description Obtiene el detalle de una postulación.
 * @route GET /apiRedes/postulante/:idPost
 */
exports.obtener = async (req, res) => {
    const { idPost } = req.params;
    
    if (isNaN(idPost)) {
        return res.status(400).json({ message: 'El ID debe ser numérico.' });
    }

    try {
        const item = await postulanteModel.obtenerPostulacionPorId(idPost);
        if (!item) {
            console.warn(`⚠️ Log: Postulación ID ${idPost} no encontrada.`);
            return res.status(404).json({ message: 'Postulación no encontrada.' });
        }
        console.log(`✅ Log: Postulación ID ${idPost} consultada.`);
        res.status(200).json(item);
    } catch (err) {
        console.error(`❌ Log: Error obteniendo postulación: ${err.message}`);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

/**
 * @function crear
 * @description Crea una postulación localmente.
 * @route POST /apiRedes/postulante
 */
exports.crear = async (req, res) => {
    const { usuarioPos, tituloConvocatoria, mensajePres } = req.body;

    if (!usuarioPos || !tituloConvocatoria) {
        console.warn('⚠️ Log: Datos incompletos para crear postulación.');
        return res.status(400).json({ message: 'Faltan campos requeridos (usuarioPos, tituloConvocatoria).' });
    }

    try {
        const id = await postulanteModel.crearPostulacion({ 
            usuarioPos, 
            tituloConvocatoria, 
            mensajePres, 
            estadoPost: 'libre' 
        });
        
        console.log(`✅ Log: Postulación creada con ID ${id} para el usuario ${usuarioPos}.`);
        res.status(201).json({ 
            message: 'Postulación creada exitosamente.', 
            idPost: id 
        });
    } catch (err) {
        console.error(`❌ Log: Error creando postulación: ${err.message}`);
        res.status(500).json({ message: 'Error interno al crear la postulación.' });
    }
};


/**
 * @function actualizarEstado
 * @description Actualiza el estado de una postulación (ej. aceptado/rechazado).
 * @route PATCH /apiRedes/postulante/:idPost/estado
 */
exports.actualizarEstado = async (req, res) => {
    const { idPost } = req.params;
    const { estado } = req.body;

    if (!estado) return res.status(400).json({ message: 'Estado requerido.' });

    try {
        // 1. Obtener datos de la postulación antes de actualizar (necesitamos usuario y título)
        const postulacion = await postulanteModel.obtenerPostulacionPorId(idPost);
        if (!postulacion) return res.status(404).json({ message: 'Postulación no encontrada.' });

        // 2. Actualizar estado local
        await postulanteModel.actualizarEstadoPostulacion(idPost, estado);
        console.log(`✅ Log: Postulación ${idPost} a estado "${estado}".`);

        // 3. Lógica de Relación: Si es "aceptado"
        if (estado.toLowerCase() === 'aceptado') {
            try {
                // Buscar ID de convocatoria usando el título almacenado en postulación
                const respConv = await axios.get(MS_CONVOCATORIA_BASE);
                const todasConvocatorias = respConv.data;

                // Match por Título de Convocatoria
                const convocatoriaMatch = todasConvocatorias.find(c => 
                    c.tituloCon === postulacion.tituloConvocatoria
                );

                if (convocatoriaMatch) {
                    // Crear Participante
                    await axios.post(`${MS_CONVOCATORIA_BASE}/participantes`, {
                        nombre: postulacion.usuarioPos,
                        idConvocatoria: convocatoriaMatch.idConvocatoria
                    });
                    console.log(`✅ Relación: Participante ${postulacion.usuarioPos} creado en Convocatoria ${convocatoriaMatch.idConvocatoria}`);
                } else {
                    console.warn(`⚠️ No se encontró convocatoria con título "${postulacion.tituloConvocatoria}" para vincular participante.`);
                }

            } catch (relError) {
                console.error("❌ Error creando participante automático:", relError.message);
            }
        }

        res.status(200).json({ message: 'Estado actualizado correctamente.' });

    } catch (err) {
        console.error(`❌ Log: Error actualizando estado: ${err.message}`);
        res.status(500).json({ message: 'Error interno.' });
    }
};