// src/app_postulante.js
const express = require('express');           // Inicializa el server
const morgan  = require('morgan');            // Logger de requests
const cors    = require('cors');              // CORS
const app     = express();

// Importa el router de Postulante (archivo correcto)
const routesPostulante = require('./routes/routes_Postulante');

// --------------------------------------
// Config básica
// --------------------------------------
const PORT = process.env.PORT || 3308;
app.set('port', PORT);
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// --------------------------------------
// Montaje de rutas del microservicio
// Base path:
//   /proyecto_redes_capasback/postulante
// --------------------------------------
app.use('/proyecto_redes_capasback/postulante', routesPostulante);

// (Opcional) Healthcheck sencillo
app.get('/health', (_req, res) => res.status(200).json({ ok: true, service: 'postulante', ts: new Date().toISOString() }));

// --------------------------------------
// Inicio del servidor
// --------------------------------------
app.listen(PORT, () => {
  console.log(`[postulante] app listening on port ${PORT}`);
});

module.exports = app;
