// src/controllers/postulanteController.js
const express = require('express');
const router = express.Router();
const {
  obtenerPostulaciones,
  obtenerPostulacionPorId,
  crearPostulacion,
  actualizarEstadoPostulacion,
} = require('../models/postulanteModel');

const ESTADOS_VALIDOS = new Set(['aceptado', 'libre']);
const lp = (req) => `[postulaciones][${new Date().toISOString()}][rid:${req.headers['x-request-id'] || '-'}]`;

function validarBodyCrear(body) {
  const requeridos = ['usuarioPos', 'tituloConvocatoria'];
  const faltan = requeridos.filter(k => body[k] === undefined || body[k] === null || body[k] === '');
  return { ok: faltan.length === 0, faltan };
}
function validarEstado(estado) {
  const e = String(estado || '').toLowerCase().trim();
  return ESTADOS_VALIDOS.has(e) ? { ok: true, value: e } : { ok: false, value: null };
}

// === RUTAS SIMPLES BAJO /proyecto_redes_capasback/postulante ===

// GET /   -> listar
router.get('/', async (req, res) => {
  try {
    const { estado, limit, offset } = req.query;
    console.info(`${lp(req)} GET /  estado=${estado} limit=${limit} offset=${offset}`);
    const data = await obtenerPostulaciones(); // listado simple; si quieres filtros, pásalos al modelo
    res.status(200).json({ ok: true, total: data.length, data });
  } catch (err) {
    console.error(`${lp(req)} ERR list`, err);
    res.status(500).json({ ok: false, msg: 'Error listando postulaciones', error: err.message });
  }
});

// GET /:idPost  -> detalle
router.get('/:idPost', async (req, res) => {
  try {
    const { idPost } = req.params;
    console.info(`${lp(req)} GET /${idPost}`);
    const item = await obtenerPostulacionPorId(Number(idPost));
    if (!item) return res.status(404).json({ ok: false, msg: 'Postulación no encontrada' });
    res.status(200).json({ ok: true, data: item });
  } catch (err) {
    console.error(`${lp(req)} ERR detail`, err);
    res.status(500).json({ ok: false, msg: 'Error obteniendo postulación', error: err.message });
  }
});

// POST /   -> crear
router.post('/', async (req, res) => {
  try {
    console.info(`${lp(req)} POST /  body=`, req.body);
    const { ok, faltan } = validarBodyCrear(req.body);
    if (!ok) return res.status(400).json({ ok: false, msg: 'Campos requeridos faltantes', faltan });

    const id = await crearPostulacion(req.body);         // usa COALESCE(?, NOW()) para fechaPost
    const creada = await obtenerPostulacionPorId(id);
    res.status(201).json({ ok: true, msg: 'Postulación creada', id, data: creada });
  } catch (err) {
    console.error(`${lp(req)} ERR create`, err);
    res.status(500).json({ ok: false, msg: 'Error creando postulación', error: err.message });
  }
});

// POST /solicitar  -> Postulante solicita a Convocatoria (NO cambia estado aquí)
router.post('/solicitar', async (req, res) => {
    try {
      const { usuarioPos, tituloConvocatoria, mensajePres } = req.body;
      console.info(`${lp(req)} POST /solicitar`, { usuarioPos, tituloConvocatoria });
  
      // Validaciones mínimas
      if (!usuarioPos || !tituloConvocatoria) {
        return res.status(400).json({
          ok: false,
          msg: 'Faltan campos requeridos: usuarioPos y tituloConvocatoria',
        });
      }
  
      // URL del microservicio de Convocatoria (pendiente por definir)
      const urlConvocatoria = ''; // ← coloca aquí la URL real cuando la tengas
  
      // Payload: SOLO lo que Convocatoria necesita para evaluar la solicitud
      const payload = { usuarioPos, tituloConvocatoria, mensajePres };
  
      // Importante: este endpoint SOLO "notifica/solicita" a Convocatoria.
      // NO actualiza estadoPost localmente. Convocatoria decidirá y hará PATCH a /:idPost/estado.
      const resp = await fetch(urlConvocatoria, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (!resp.ok) {
        const errText = await resp.text().catch(() => 'Error desconocido');
        console.error(`${lp(req)} ERR convocatoria`, { status: resp.status, errText });
        return res.status(resp.status).json({
          ok: false,
          msg: 'Convocatoria rechazó o falló la solicitud',
          error: errText,
        });
      }
  
      // Si Convocatoria devuelve JSON, lo reenviamos tal cual (proxy)
      const data = await resp.json().catch(() => ({}));
      console.info(`${lp(req)} OK solicitud enviada a Convocatoria`);
      return res.status(200).json({
        ok: true,
        msg: 'Solicitud enviada a Convocatoria',
        data,
      });
  
    } catch (err) {
      console.error(`${lp(req)} ERR /solicitar`, err);
      return res.status(500).json({
        ok: false,
        msg: 'Error enviando solicitud a Convocatoria',
        error: err.message,
      });
    }
  });
  

// PATCH /:idPost/estado  -> actualizar estado
router.patch('/:idPost/estado', async (req, res) => {
  try {
    const { idPost } = req.params;
    const { estado } = req.body;
    console.info(`${lp(req)} PATCH /${idPost}/estado  estado=${estado}`);

    const v = validarEstado(estado);
    if (!v.ok) return res.status(400).json({ ok: false, msg: "Valor de 'estado' inválido. Use 'aceptado' o 'libre'." });

    const existe = await obtenerPostulacionPorId(Number(idPost));
    if (!existe) return res.status(404).json({ ok: false, msg: 'Postulación no encontrada' });

    const affected = await actualizarEstadoPostulacion(Number(idPost), v.value);
    const actualizada = await obtenerPostulacionPorId(Number(idPost));
    res.status(200).json({ ok: true, msg: 'Estado actualizado', affected, data: actualizada });
  } catch (err) {
    console.error(`${lp(req)} ERR patch estado`, err);
    res.status(500).json({ ok: false, msg: 'Error actualizando estado', error: err.message });
  }
});

module.exports = router;
