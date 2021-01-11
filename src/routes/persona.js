const express = require("express");
const router = express.Router();


const qy = require("../database")


router.post('/', async (req, res) => {
    /*POST '/persona' recibe: {nombre: string, apellido: string, alias: string, email: string} retorna: status: 200, 
    {id: numerico, nombre: string, apellido: string, alias: string, email: string} - status: 413, 
    {mensaje: <descripcion del error>} que puede ser: "faltan datos", "el email ya se encuentra registrado", "error inesperado"*/
    try { 
        if (!req.body.nombre || !req.body.apellido || !req.body.alias || !req.body.email){ //Chequea que no falten datos
            throw new Error("Faltan datos")
        }
        let nombre = req.body.nombre.toUpperCase().trim();
        let apellido = req.body.apellido.toUpperCase().trim();
        let alias = req.body.alias.toUpperCase().trim();
        let email = req.body.email.toUpperCase().trim();

        if (nombre.length == 0 || apellido.length == 0 || alias.length == 0 || email.length == 0){ //Chequea que no sean campos vacíos
            throw new Error("Faltan datos")
        }
    
        //Chequea que el email no exista
        let query = 'SELECT * FROM personas WHERE email = ?'; 
        let respuesta = await qy(query, [email]); 
        if (respuesta.length > 0) {
            throw new Error("El email ya se encuentra registrado")
        }

        query = "INSERT INTO personas(nombre, apellido, alias, email) VALUES (?,?,?,?)";
        respuesta = await qy(query, [nombre, apellido, alias, email]);

        //Generar respuesta
        id = respuesta.insertId;
        query= "SELECT * FROM personas WHERE persona_id= ?";
        respuesta = await qy(query, [id]);
        res.status(200).send(respuesta);
    } 
    catch(e){ 
        console.error(e.message); 
        res.status(413).send({"Mensaje": e.message}); 
    } 
});

router.get('/', async (req, res) => {
    /*GET '/persona' retorna status 200 y [{id: numerico, nombre: string, apellido: string, alias: string, email; string}] o bien status 413 y []*/
    try { 
        const query = 'SELECT * FROM personas';  
        const respuesta = await qy(query); 
 
        res.status(200).send(respuesta); 

    } 
    catch(e){ 
        console.error(e.message); 
        res.status(413).send({"Mensaje": e.message}); 
    } 
});

router.get('/:id', async (req, res) => {
    /*GET '/persona/:id' retorna status 200 y {id: numerico, nombre: string, apellido: string, alias: string, email; string} - 
    status 413 , {mensaje: <descripcion del error>} "error inesperado", "no se encuentra esa persona" */
    try { 
        const query = 'SELECT * FROM personas WHERE persona_id = ?'; 

        const respuesta = await qy(query, [req.params.id]); 
        console.log(respuesta); 

        if (respuesta.length == 0) { 
            throw new Error("No se encuentra esa persona"); 
        } 
 
        res.status(200).send(respuesta); 
    } 
    catch(e){ 
        console.error(e.message); 
        res.status(413).send({"Mensaje": e.message}); 
    } 
});


router.put('/:id', async (req, res) => {
    /*PUT '/persona/:id' recibe: {nombre: string, apellido: string, alias: string, email: string} el email no se puede modificar. retorna 
    status 200 y el objeto modificado o bien status 413, {mensaje: <descripcion del error>} "error inesperado", "no se encuentra esa persona"*/

    try{
        if (!req.body.nombre || !req.body.apellido || !req.body.alias || !req.body.email){ //Chequea que no falten datos
            throw new Error("Faltan datos")
        }
        let nombre = req.body.nombre.toUpperCase().trim();
        let apellido = req.body.apellido.toUpperCase().trim();
        let alias = req.body.alias.toUpperCase().trim();
        let email = req.body.email.toUpperCase().trim();

        if (nombre.length == 0 || apellido.length == 0 || alias.length == 0 || email.length == 0){ //Chequea que no sean campos vacíos
            throw new Error("Faltan datos")
        }

        let query = 'SELECT * FROM personas WHERE persona_id = ? AND email = ?'
        let respuesta = await qy(query, [req.params.id, email]);
        if (!respuesta.length > 0){
             throw new Error ("No se encuentra esa persona")
        }

        query = 'UPDATE personas SET nombre = ?, apellido = ?, alias = ? WHERE persona_id = ? AND email = ?';
        respuesta = await qy(query, [nombre, apellido, alias,  req.params.id, email]);

        //Genera la respuesta
        query = 'SELECT * FROM personas WHERE persona_id = ?'
        respuesta = await qy(query, [req.params.id]);

        res.status(200).send(respuesta);
    }   
    catch(e){
        console.error(e.message);
        res.status(413).send({"Mensaje": e.message})
    }
});

router.delete('/:id', async (req, res) => {
    /*DELETE '/persona/:id' retorna: 200 y {mensaje: "se borro correctamente"} o bien 413, {mensaje: <descripcion del error>} "error inesperado", 
    "no existe esa persona", "esa persona tiene libros asociados, no se puede eliminar"*/

    try { 

        let query = 'SELECT * FROM personas WHERE persona_id = ?'; 
     
        let respuesta = await qy(query, [req.params.id]); 
     
        if (respuesta.length == 0) { 
             throw new Error("No existe esa persona"); 
         } 
     
        query = 'SELECT * FROM libros WHERE persona_id = ?'; 
     
        respuesta = await qy(query, [req.params.id]); 
     
        if (respuesta.length > 0) { 
             throw new Error("Esa persona tiene libros asociados, no se puede eliminar"); 
         } 
     
        query = 'DELETE FROM personas WHERE persona_id = ?';     
        respuesta = await qy(query, [req.params.id]); 
        res.status(200).send({"Mensaje": "Se borro correctamente"}); 
       }
 
     catch(e){ 
        console.error(e.message); 
        res.status(413).send({"Mensaje": e.message}); 
    } 
});


module.exports =  router;