Particpitandes:	
	*Jose Carlos Diab
	*Franco Franco Ingrassia carretero
	*Mauro Rodriguez
 
PASOS PAR TESTEAR 1

Instalat la app.
	npm install

Modificar package.json agregando dentro de "scripts"{}
	"start": "node src/app.js",
    "dev": "nodemosn src.js"


Arbol de diectorios:
	raiz: 	./biblioteca                	// Acá van los archivos packaje.json, package.lock.json y la carpeta node_modules, biblioteca.sql, etc
	src: 	./biblioteca/src             	// Acá van archivos como app.js
	routes: ./biblioteca/src/routes  	    // Acá va la API Rest: categoty.js, persons.js, books.js 


Iniciar el servidor /desde directorio raíz:
    Sin Nodemon, dos opciones
	* node src/app.js
	* npm run start
    Con nodemon, dos opciones
	* nodemon src/app
	* npm run dev

Crear, y poblar: 
craer base de datos 'biblioteca' 
importar biblioteca.sql
User: root 
Pass"" 

	