const mysql = require('mysql');
const util = require("util");

const conexion = mysql.createConnection({ //Se definen los parametros de conexion para la base de datos
    host: "localhost",
    user: "root",
    password: "",
    database: "biblioteca"
});
conexion.connect((error)=>{
    if(error){
        throw error;
    }

    console.log("Conexion con MySQL establecida");
});

const qy = util.promisify(conexion.query).bind(conexion);

module.exports = qy;