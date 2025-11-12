const express = require("express"); //con esto Podemos inicializar nuestro server en NODE JS.
const app = express(); //Con esto nos aseguramos de encender el server en nuestra app.
const morgan = require('morgan'); 
const cors = require('cors');
const routes = require("./routes/Routes")

const PORT = 3308 
/*
Para usuarios => /usuario
Para proyectos => /proyecto
Para convocatorioa => /convocatoria
Para ofertante => /ofertante
Para postulante => /postulante
*/
//SE SETEA EL PUERTO 
app.set("port",PORT)
app.use(express.json())
app.use(cors());
app.use(morgan('dev'))
app.use("/apiRedes/usuario",routes)

app.listen(PORT,()=>{
    console.log("app is listening port 3308")
})