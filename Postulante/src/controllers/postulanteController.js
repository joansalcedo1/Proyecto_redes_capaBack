const postulanteModel = require('../models/postulanteModel');
const axios = require('axios'); // Usamos axios para consistencia

// URL del microservicio de Convocatoria

const CONVOCATORIA_URL = 'http://localhost:3308/apiRedes/convocatoria';

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

    if (!estado) {
        return res.status(400).json({ message: 'El campo estado es requerido.' });
    }

    try {
        const affected = await postulanteModel.actualizarEstadoPostulacion(idPost, estado);
        
        if (affected === 0) {
            return res.status(404).json({ message: 'Postulación no encontrada.' });
        }

        console.log(`✅ Log: Estado de postulación ${idPost} cambiado a "${estado}".`);
        res.status(200).json({ message: 'Estado actualizado correctamente.' });
    } catch (err) {
        console.error(`❌ Log: Error actualizando estado: ${err.message}`);
        res.status(500).json({ message: 'Error interno al actualizar estado.' });
    }
};