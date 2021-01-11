const express = require("express");
const router = express.Router();


const qy = require("../database")

router.post('/', async (req, res) => {
    /* POST '/libro' recibe: {nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} devuelve 200 y {id: numero, nombre:string, 
    descripcion:string, categoria_id:numero, persona_id:numero/null} o bien status 413,{mensaje: <descripcion del error>} que puede ser 
    "error inesperado", "ese libro ya existe", "nombre y categoria son datos obligatorios", "no existe la categoria indicada", "no existe la persona indicada"*/

    try { 
        if (!req.body.nombre || !req.body.categoria_id){ //Chequea que no falten datos
            throw new Error("Nombre y categoria son datos obligatorios");
        }
        let nombre = req.body.nombre.toUpperCase().trim();
        let categoria_id = req.body.categoria_id.trim();
        let descripcion = null;
        let persona_id = null;

        if(nombre.length == 0 || categoria_id.length == 0){
            throw new Error("Nombre y categoria son datos obligatorios");
        }
    
        //Chequea que el libro no exista
        let query = 'SELECT * FROM libros WHERE nombre = ?'; 
        let respuesta = await qy(query, [nombre]); 
        if (respuesta.length > 0) {
            throw new Error("Ese libro ya existe")
        }

        //Chequea que la categría ingresada exista
        query = 'SELECT * FROM categorias WHERE categoria_id = ?'; 
        respuesta = await qy(query, [categoria_id]); 

        if(respuesta.length == 0){
            throw new Error("No existe la categoria indicada")
        }
    
        //Chequea que la persona ingresada exista

        if (req.body.persona_id){
            persona_id = req.body.persona_id.trim();
            query = "SELECT * FROM personas WHERE persona_id = ?";
            respuesta = await qy(query, [persona_id])

            if (respuesta.length == 0){
                throw new Error("No existe la persona indicada")
            }
        }

        //Chequea si hay descripción
        if(req.body.descripcion){
            console.log("entro");
            descripcion = req.body.descripcion.toUpperCase().trim();
        }

        query = "INSERT INTO libros(nombre, descripcion, categoria_id, persona_id) VALUES (?,?,?,?)";
        respuesta = await qy(query, [nombre, descripcion, categoria_id, persona_id]);

        //Genera la respuesta
        id = respuesta.insertId;
        query= "SELECT * FROM libros WHERE libro_id= ?";
        respuesta = await qy(query, [id]);
        res.status(200).send(respuesta);
    } 
    catch(e){ 
        console.error(e.message); 
        res.status(413).send({"Mensaje": e.message}); 
    } 
});


router.get('/', async (req, res) => {
    /* GET '/libro' devuelve 200 y [{id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null}] o 
    bien 413, {mensaje: <descripcion del error>} "error inesperado" */
    try { 
        const query = 'SELECT * FROM libros';  
        const respuesta = await qy(query); 
 
        res.status(200).send(respuesta); 

    } 
    catch(e){ 
        console.error(e.message); 
        res.status(413).send({"Error": e.message}); 
    } 
});


router.get('/:id', async (req, res) => {
    /* GET '/libro/:id' devuelve 200 {id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} y status 413, 
    {mensaje: <descripcion del error>} "error inesperado", "no se encuentra ese libro" */
    
    try { 
        const query = 'SELECT * FROM libros WHERE libro_id = ?'; 
        const respuesta = await qy(query, [req.params.id]); 

        if (respuesta.length == 0) { 
            throw new Error("No se encuentra ese libro"); 
        } 
 
        res.status(200).send(respuesta); 
    } 
    catch(e){ 
        console.error(e.message); 
        res.status(413).send({"Error": e.message}); 
    }
});


router.put('/:id', async (req, res) => {
    /* PUT '/libro/:id' y {id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} devuelve status 200 y 
    {id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} modificado o bien status 413, 
    {mensaje: <descripcion del error>} "error inesperado",  "solo se puede modificar la descripcion del libro */
    try{

        if (!req.body.nombre || !req.body.categoria_id || !req.body.descripcion || !req.body.persona_id){ //Chequea que no falten datos
            throw new Error("faltan datos");
        }

        let nombre = req.body.nombre.toUpperCase().trim();
        let categoria_id = req.body.categoria_id.trim();
        let descripcion = req.body.descripcion.toUpperCase().trim();
        let persona_id = req.body.persona_id.trim();

        let query = 'SELECT * FROM libros WHERE libro_id = ?'
        let respuesta = await qy(query, [req.params.id]);
        if (!respuesta.length > 0){
             throw new Error ("El Libro no existe")
        } 
        console.log(respuesta);
        if(nombre != respuesta[0].nombre || categoria_id != respuesta[0].categoria_id || persona_id != respuesta[0].persona_id ){
            throw new Error("solo se puede modificar la descripcion del libro");
        }

        //Actualiza base de datos
        query = 'UPDATE libros SET descripcion = ? WHERE libro_id= ?';
        respuesta = await qy(query, [req.body.descripcion.toUpperCase(), req.params.id]);

        //Genera la respuesta
        query = 'SELECT * FROM libros WHERE libro_id = ?'
        respuesta = await qy(query, [req.params.id]);
        console.log(respuesta); 
        res.status(200).send(respuesta);
    }   
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message})
    }
});



router.put('/prestar/:libro_id', async (req, res) => {
    /*PUT '/libro/prestar/:id' y {id:numero, persona_id:numero} devuelve 200 y {mensaje: "se presto correctamente"} o bien status 413, 
    {mensaje: <descripcion del error>} "error inesperado", "el libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva", 
    "no se encontro el libro", "no se encontro la persona a la que se quiere prestar el libro */
    try { 
        
        let query = 'SELECT * FROM libros WHERE libro_id = ?'; 
        let respuesta = await qy(query, [req.params.libro_id]); 

        if (respuesta.length == 0) { //el libro no existe. 
            throw new Error('No se encontro el libro'); 
            } 

        query = 'SELECT * FROM personas WHERE persona_id = ?'; 
        respuesta = await qy(query, [req.body.persona_id]); 
    
        if (respuesta.length == 0) { //la persona no existe 
            throw new Error('No se encontro la persona a la que se quiere prestar el libro'); 
        } 
            
        
        query = 'SELECT * FROM libros WHERE libro_id = ? AND persona_id is null'; 
        respuesta = await qy(query, [req.params.libro_id, req.params.persona_id]); 

        if (respuesta.length == 0) { //persona_id no es nulo, el libro está prestado. 
            throw new Error('El libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva'); 
        } 

        query = 'UPDATE libros SET persona_id = ? WHERE libro_id = ?'; 
        respuesta = await qy(query, [req.body.persona_id, req.params.libro_id])   

        res.status(200).send({'Mensaje': "Se prestó correctamente"}); 
         }

     catch(e){ 
          console.error(e.message); 
          res.status(413).send({"Mensaje": e.message}); 
         } 
});




router.put('/devolver/:libro_id', async (req, res) => {
    /* PUT '/libro/devolver/:id' y {} devuelve 200 y {mensaje: "se realizo la devolucion correctamente"} o bien status 413, 
    {mensaje: <descripcion del error>} "error inesperado", "ese libro no estaba prestado!", "ese libro no existe"*/

    try { 
         
        let query = 'SELECT * FROM libros WHERE libro_id = ?'; 
        let respuesta = await qy(query, [req.params.libro_id]); 
 
         if (respuesta.length == 0) { //el libro no existe. 
            throw new Error('Ese libro no existe'); 
            } 
        
        query = 'SELECT * FROM libros WHERE libro_id = ? AND persona_id is not null'; 
        respuesta = await qy(query, [req.params.libro_id]); 
 
         if (respuesta.length == 0) { //persona_id no es nulo, el libro no está prestado. 
            throw new Error('Ese libro no estaba prestado!'); 
            } 
 
        query = 'UPDATE libros SET persona_id = null WHERE libro_id = ?'; 
        respuesta = await qy(query, [req.params.libro_id])   
 
        res.status(200).send({'Mensaje': "Se realizo la devolucion correctamente"}); 
         }
 
     catch(e){ 
          console.error(e.message); 
          res.status(413).send({"Mensaje": e.message}); 
         } 
});

router.delete('/:id', async (req, res) => { 
    /* DELETE '/libro/:id' devuelve 200 y {mensaje: "se borro correctamente"}  o bien status 413, {mensaje: <descripcion del error>}
     "error inesperado", "no se encuentra ese libro", "ese libro esta prestado no se puede borrar" */

    try { 

       let query = 'SELECT * FROM libros WHERE libro_id = ?'; 
    
       let respuesta = await qy(query, [req.params.id]); 
    
       if (respuesta.length == 0) { 
            throw new Error("No se encuentra ese libro"); 
        } 
    
       query = 'SELECT * FROM libros WHERE libro_id = ? AND persona_id is not null'; 
    
       respuesta = await qy(query, [req.params.id]); 
    
       if (respuesta.length > 0) { 
            throw new Error("Ese libro esta prestado, no se puede borrar"); 
        } 
    
       query = 'DELETE FROM libros WHERE libro_id = ?';     
       respuesta = await qy(query, [req.params.id]); 
       res.status(200).send({'Mensaje': "Se borro correctamente"}); 
      }

    catch(e){ 
       console.error(e.message); 
       res.status(413).send({"Mensaje": e.message}); 
   } 
  }); 

module.exports = router;