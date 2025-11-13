const express = require("express"); //con esto Podemos inicializar nuestro server en NODE JS.
const morgan = require("morgan"); 
const cors = require("cors");
const routes = require("./routes/routes_Convocatoria");

const app = express(); //Con esto nos aseguramos de encender el server en nuestra app.
const PORT = 3308;
//SE SETEA EL PUERTO 
app.set("port",PORT)
app.use(cors());
app.use(express.json())
app.use(morgan('dev'))

app.use("/apiRedes/convocatoria",routes)

app.listen(PORT,()=>{
    console.log("app is listening port 3308")
})