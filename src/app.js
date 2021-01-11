const express = require("express");
const morgan = require('morgan')
const cors = require('cors'); // LIENA AGREGADA
const app = express();

// Settings
app.set('port', process.env.PORT || 3000);

// Midlewares
app.use(express.json());
app.use(express.urlencoded());
app.use(morgan('dev'));
app.use(cors()) // LINEA AGREGADA
//Routes
app.use('/categoria', require('./routes/categoria'));
app.use('/persona', require('./routes/persona'));
app.use('/libro', require('./routes/libro'));
 
// Server
app.listen(app.get('port'), ()=> {
    console.log(`Escuchando en el puerto ${app.get('port')}`);
})


/* Falta try catch throw, consultas SQL, codigo de los diferentes get, post, etc, validacion de datos, respuestas del servidos, inicio de sesion(no se si es requerido) etc*/ 
