//"use strict";
//global __dirname */
/*golbal assert*/

var express = require("express");
var bodyParser = require("body-parser");
var helmet = require("helmet");
var path = require('path');

var publicFolder = path.join(__dirname, 'public');

//Módulo con api Menú
var moduleMenu = require("./public/APIS/apiMenu.js");



////////////////////////////////////////CONEXIÓN CON BASE DE DATOS////////////////////////////////////////////////////////////

//Conexión con base de datos mongoDB
var MongoClient = require("mongodb").MongoClient;
var mdbURL = "mongodb://admin:admin@ds147480.mlab.com:47480/sevilla-today";

var port = (process.env.PORT || 10000);
var BASE_API_PATH = "/api/v1";

//Base de datos mongoDB del menú
var dbMenu;

MongoClient.connect(mdbURL, {native_parser:true}, function (err, database){
    
    if(err){
        console.log("CAN NOT CONNECT TO DB"+err);
        process.exit(1);
    }

        dbMenu = database.collection("menu-resi");
       
       
       ///////////////////CONEXIÓN CON MÓDULO JOSÉ////////////////////////////
       moduleMenu.register(app, dbMenu, BASE_API_PATH);
   
   //Solo pongo el servidor a arrancar si la base de datos está arrancada
   app.listen(port, () =>{
    console.log("Magic is happening on port " + port);
    });
});


var app = express();


//BODYPARSER usa por defecto la codificación de JSON
app.use(bodyParser.json()); //use default json enconding/decoding

//HELMET aporta seguridad a nuestro servidor
app.use(helmet()); //improve security

//REDIRECCIONAMIENTO INICIAL A PÁGINA PRINCIPAL DE LA API
//app.use("/", express.static(path.join(__dirname, BASE_API_PATH + "/")));


////////////////////////////////////////////////CÓDIGO URL BASE////////////////////////////////////////////////////////////

app.get("/", function(request, response){
    response.sendfile(publicFolder + "/index.html");
});




