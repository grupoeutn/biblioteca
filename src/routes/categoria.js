const express = require("express");
const router = express.Router();


const qy = require("../database")


// Program

router.post('/', async (req, res) => {
    /* POST '/categoria' recibe: {nombre: string} retorna: status: 200, {id: numerico, nombre: string} -
    status: 413, {mensaje: <descripcion del error>} que puede ser: "faltan datos", 
    "ese nombre de categoria ya existe", "error inesperado"
    */
   try {
    if (!req.body.nombre){
        throw new Error("Faltan datos");
    }
    let nombre = req.body.nombre.toUpperCase().trim();

    if(nombre.trim().length == 0){
        throw new Error("Faltan datos");
    }
    console.log(nombre.length);
    let query = 'SELECT * FROM categorias WHERE nombre = ?'; 
    let respuesta = await qy(query, [nombre]); 

    if(respuesta.length > 0){
        throw new Error("Ese nombre de categoria ya existe")
    }

    query = "INSERT INTO categorias (nombre) VALUE (?)";
    respuesta = await qy(query, [nombre]);

    console.log(respuesta);
    res.status(200).send({"id": respuesta.insertId, "nombre": nombre}); 
} 
catch(e){ 
    console.error(e.message); 
    res.status(413).send({"Mensaje": e.message}); 
} 
});

router.get("/", async(req, res) => {
    /*GET '/categoria' retorna: status 200  y [{id:numerico, nombre:string}]  - status: 413 y []*/
    try { 
        const query = 'SELECT * FROM categorias';  
        const respuesta = await qy(query); 
    
        res.status(200).send(respuesta); 
    
    } 
    catch(e){ 
        console.error(e.message); 
        res.status(413).send({"Error": e.message}); 
    } 
});

router.get('/:id', async(req, res) => {
    /* GET '/categoria/:id' retorna: status 200 y {id: numerico, nombre:string} - status: 413, 
    {mensaje: <descripcion del error>} que puede ser: "error inesperado", "categoria no encontrada"*/
    try { 
        const query = 'SELECT * FROM categorias WHERE categoria_id = ?'; 

        const respuesta = await qy(query, [req.params.id]); 
        console.log(respuesta); 

        if (respuesta.length == 0) { 
           throw new Error("La categoria no existe"); 
       } 
 
        res.status(200).send(respuesta); 
    } 
    catch(e){ 
        console.error(e.message); 
        res.status(413).send({"Error": e.message}); 
    }  
});

router.delete('/:id', async(req, res) => {
    /* DELETE '/categoria/:id' retorna: status 200 y {mensaje: "se borro correctamente"} - 
    status: 413, {mensaje: <descripcion del error>} que puese ser: "error inesperado", 
    "categoria con libros asociados, no se puede eliminar", "no existe la categoria indicada" */

    try { 

        let query = 'SELECT * FROM categorias WHERE categoria_id = ?'; 
        let respuesta = await qy(query, [req.params.id]); 
     
        if (respuesta.length == 0) { 
             throw new Error("No existe la categoria indicada"); 
         } 
     
        query = 'SELECT * FROM libros WHERE categoria_id = ?'; 
     
        respuesta = await qy(query, [req.params.id]); 
     
        if (respuesta.length > 0) { 
             throw new Error("Categoria con libros asociados, no se puede eliminar"); 
         } 
     
        query = 'DELETE FROM categorias WHERE categoria_id = ?';     
        respuesta = await qy(query, [req.params.id]); 
        res.status(200).send({"Mensaje": "Se borro correctamente"}); 
       }

     catch(e){ 
        console.error(e.message); 
        res.status(413).send({"mensaje": e.message}); 
    } 
});



//No se debe implementar PUT

module.exports = router;