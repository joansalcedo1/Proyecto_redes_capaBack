const express = require("express"); //con esto Podemos inicializar nuestro server en NODE JS.
const app = express(); //Con esto nos aseguramos de encender el server en nuestra app.
const morgan = require('morgan'); 
const cors = require('cors');
const routes = require("./routes/routes_Proyecto")

const PORT = 3308 
//SE SETEA EL PUERTO 
app.set("port",PORT)
app.use(express.json())
app.use(cors());
app.use(morgan('dev'))

/*
Para usuarios => /usuario
Para proyectos => /proyecto
Para convocatorioa => /convocatoria
Para ofertante => /ofertante
Para postulante => /postulante
*/

app.use("/apiRedes/proyecto",routes)

app.listen(PORT,()=>{
    console.log("app is listening port 3308")
})