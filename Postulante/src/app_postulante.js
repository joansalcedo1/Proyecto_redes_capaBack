const express = require('express');  
const app     = express();         
const morgan  = require('morgan');            
const cors    = require('cors');             
const routes = require("./routes/routes_Postulante")




const PORT = process.env.PORT || 3314;
app.set('port', PORT);
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));


app.use('/apiRedes/postulante', routes);



app.listen(PORT, () => {
  console.log(`[postulante] app listening on port ${PORT}`);
});

module.exports = app;
