var express = require('express');
var app = express();
var mongoose = require("mongoose");
var hbs = require("express-handlebars");
var session = require("express-session");

app.use(session({secret: "flor1234$"})); //comienza inicio de sesion...

mongoose.Promise = global.Promise;

app.engine("handlebars", hbs()); //hbs = que en require express-handlebars
app.set("view engine", "handlebars");


//async /await
async function conectar () {
    await mongoose.connect(
            "mongodb://10.128.35.136:27017/curso", /*mongodb://localhost:27017/nombredelabase*/
            {useNewUrlParser:true} /*Mongo db atlas - una cuenta gratuita de mongdb.com*/ 
    )
    console.log("conectado!"); 
}
conectar();
//27017 puerto que escucha el servidor mongodb. 
// /curso es la tabla que voy a usar


const ArtistaSchema = mongoose.Schema ({
    nombre: String,
    apellido: String
});

const ArtistaModel = mongoose.model("artista", ArtistaSchema); //relacionamos una estructura con la base de datos. crea una conexion que tiene el nombre artistas en la bd con estructura nombre y apellido.

//ALTA DE DATOS EN LA BASE DE MONGODB.con VALIDACIONES DE BUENA CARGA.!!!!
//para confirmar que los datos entran x un formulario para que me aparezca luego el body....
app.use(express.urlencoded({extended: true})); //no olvidar esta linea.


//////////////////////////
///////NUEVA LINEA PARA API REST
app.use(express.json()); //no olvidar esta linea.  transforma el json en body.

///////////////////////////




////////////////////////////////////////////
///////////  LISTADO COMPLETO DE LA LISTA DE ARTISTAS
////////////////////////////////////////////

app.get("/listado", async function (req, res){
    var abc = await ArtistaModel.find().lean();
    res.render("listado", {listado: abc}); 
});


////////////////////////////////////////////
///////////  ALTA DE UN ARTISTA
////////////////////////////////////////////

//express devuelve el formulario al html.. muestra el formulario.
app.get("/alta", async function (req, res){
    res.render("formulario"); //muestra al formulario vacio
});


///////////////////////////
//en html <form action="/enviar_form" method="post">
//el post a /alta vuelve los datos a express.
app.post("/alta", async function (req, res){
    //en html <input type="text" name="nombre"/>   --> req.body.nombre
    //req.body.apellido
    if (req.body.nombre==""){  //o uso lengh
        res.render ("formulario", {
            error: "el nombre es obligatorio", 
            datos: {
                nombre: req.body.nombre,
                apellido: req.body.apellido,
            }
        })
        return; //corta la ejecucion del codigo. hace solo el render y no vuelve a crear el registro... 
    }
    await ArtistaModel.create({ //crea un nuevo artista.
        nombre: req.body.nombre,
        apellido: req.body.apellido,
    });
    //redirecciono al usuario al listado.
    res.redirect("/listado");
});


////////////////////////////////////////////
///////////  EDICION DE ARCHIVOS.!!!
///////////  TOMO DE REFERENCIA EL ALTA.
////////////////////////////////////////////

app.get("/editar/:id", async function (req, res){//busca en formulario con el id.
    var artista = await ArtistaModel.findById({_id:req.params.id}) .lean(); //creo una variable para que me muestre ese artista.

    res.render("formulario", {datos: artista});//uso de referencia para ver los avances...
});

app.post("/editar/:id", async function(req, res){
    if (req.body.nombre==""){  //o uso lengh
        res.render ("formulario", {
            error: "el nombre es obligatorio", 
            datos: {
                nombre: req.body.nombre,
                apellido: req.body.apellido,
            }
        })
        return; //corta la ejecucion del codigo. hace solo el render y no vuelve a crear el registro... 
    }
    await ArtistaModel.findByIdAndUpdate(
        {_id: req.params.id}, //uso el id de la url...
        {
            nombre: req.body.nombre, 
            apellido: req.body.apellido
        } 
    );
        res.redirect("/listado");
});



////////////////////////////////////////////
/////////// BUSCAR UN ARTISTA DE LA LISTA
////////////////////////////////////////////

app.get("/buscar/:id", async function (req, res){
    res.send(listado);
    var listado = await ArtistaModel.find({_id: req.params.id});
});


////////////////////////////////////////////
/////////// AGREGAR UN ARTISTA AL LISTADO
////////////////////////////////////////////

app.get('/agregar', async function(req, res){
    var nuevoArtista = await ArtistaModel.create(
        {nombre: 'Flor', apellido: 'Anto'}
    );
    res.send(nuevoArtista);
});


////////////////////////////////////////////
/////////// MODIFICAR DATOS Y ACTUALIZAR
//busca por id y muestra parametros.
////////////////////////////////////////////

app.get("/modificar", async function(req, res){
    await ArtistaModel.findByIdAndUpdate(
        {_id: "5e570a9e9fb08915e0dfa41f"},
        {nombre: "Nuevo Nombre", apellido: "Nuevo Apellido"} 
    );
        res.send("ok");
});


////////////////////////////////////////////
/////////// BORRAR EL LISTADO
////////////////////////////////////////////

app.get("/borrar/:id", async function(req, res){
    //:id --> req.params.id
await ArtistaModel.findByIdAndRemove(
    {_id: req.params.id}
);
    res.redirect("/listado");
});


////////////////////////////////////////////
/////////// BORRADO FISICO
////////////////////////////////////////////

app.get("/borrar", async function(req, res){
    var rta = await ArtistaModel.findByIdAndRemove(
        {_id: "5e570a9e9fb08915e0dfa41f"}
    );
    res.send(rta);
});





app.get('/contar', function (req, res){
    if  (!req.session.contador){
        req.session.contador == 0;
        }
    req.session.conador ++;
    res.json(req.session.contador);
});

///////////////////////////////////////////////////////
///////////
///////////////////////////////////////////////////////
///////////
///////////////////////////////////////////////////////
///////////
///////////////////////////////////////////////////////




app.get("/listadousuarios", async function(req, res){
    if (!req.session.user_id){
        res.redirect("/login")
    }
    var abcd = await UsuarioModel.find().lean();
    res.render("listadousuarios", {listadousuarios: abcd}); 
});


////////////////////////////////////////////
/////////// CONEXION CON BASE USUARIOMODEL EN MONGODB
////////////////////////////////////////////

const UsuarioSchema = mongoose.Schema({
    user: String,
    pass: String,
    email: String
});

const UsuarioModel = mongoose.model("usuario", UsuarioSchema);

app.get("/login", function(req, res){
    res.render ("ingreso_form");
    
});

////////////////////////////////////////////
/////////// LOGIN DE USUARIOS
////////////////////////////////////////////

app.post("/login", async function(req, res){
    //user:admin  pass:admin123
    var usuarios = await UsuarioModel.find({  //puedo usar el findeone
        user: req.body.user,
        pass: req.body.pass
    });
    if(usuarios.length!=0){
        req.session.user_id = usuarios [0]._id; 
        res.redirect ("/evento");
    } else{
        res.send("incorrecto");
    }
});

///////////////////////////
// alta de nuevo usuario para que luego haga login
///////////////////////////

app.get("/altausuario", function(req, res){
    res.render("altausuario_form"); 

});

app.post("/altausuario", async function (req, res){
    //en html <input type="text" name="nombre"/>   --> req.body.nombre
    //req.body.apellido
    if (req.body.user=="" || req.body.pass==""){  //o uso lengh
        res.render ("altausuario_form", {
            error: "los campos son obligatorios", 
            datos: req.body /*escrito asi contempla todos los datos juntos.. req.body.nombre, req.body.password y req.body.email*/
        });
        return; /*corta la ejecucion del codigo. hace solo el render y no vuelve a crear el registro... */
    }
    await UsuarioModel.create({ //crea un nuevo artista.
        user: req.body.user,
        pass: req.body.pass,
        email: req.body.email
    });
    //redirecciono al usuario al listado.
    res.redirect("/login");
});




app.get("/evento", function(req, res){
    res.render("eventoinscriptos"); 

});







///////////////////////////////////////////////////////
///////////
///////////////////////////////////////////////////////
///////////
// TEMA NUEVO API REST....
///////////////////////////////////////////////////////
///////////
///////////////////////////////////////////////////////



app.get ("/api/artistas", async function(req, res){
    var listadousuarios = await ArtistaModel.find().lean();
    res.json (listadousuarios);

});

app.get ("/api/artistas/:id", async function (req, res){
    try{
        var unArtista =await ArtistaModel.findById (req, res);
        res.json(unArtista);

    }catch(e) {
        res.status (404).send("error"); //404 es un codigo, ver lista.
    }
  

});



///////////////////////////////////////////////////////
///////////  API REST - ALTA DE UN ARTISTA     de /api/artistas
///////////////////////////////////////////////////////

app.post ("/api/artistas", async function (req, res){
    var artista = await ArtistaModel.create({
        nombre: req.body.nombre,
        apellido: req.body.apellido
    });
    //devolvemos lo que guardamos...

    res.json(artista); //la respuesta ok es un codigo 200..
});


///////////////////////////////////////////////////////
///////////  ACTUALIZAR UN ARTISTA     de /api/artistas
///////////////////////////////////////////////////////


app.put("/api/artistas/:id", async function (req, res){
    try{
        await ArtistaModel.findByIdAndUpdate (
            req.params.id,
                {
                    nombre: req.body.nombre,
                    apellido: req.body.apellido

                }

        );
        res.status (200).send("ok");

    }catch(e){
        res.status(404).send("error");
    }
    
});


///////////////////////////////////////////////////////
///////////  BORRAR UN ARTISTA     de /api/artistas
///////////////////////////////////////////////////////

app.delete ("/api/artistas/:id", async function (req, res){
    try{
        await ArtistaModel.findByIdAndDelete (req.params.id);
        res.status(204).send();  //204 no devuelve ningun texto.

    }catch(e) {
        res.status(404).send("No encontrado");
    }
});




app.listen(8080, function() {
    console.log('App en localhost');
}); 