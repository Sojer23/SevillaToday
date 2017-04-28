var exports = module.exports = {};

exports.register = function(app, dbMenu, BASE_API_PATH) {


////////////////////////////////////////////////CODIGO API JOSÉ////////////////////////////////////////////////////////////

//Initializing with some data
app.get(BASE_API_PATH + "/menu-resi/loadInitialData", function (request, response){
    
    
    var semana = {
        
        "mon":{
            "day": "Lunes","Almuerzo1": "Arroz con pollo","Almuerzo2": "Huevos, Chorizos y patatas","Postre1": "Fruta","Cena1": "Sopa",
            "Cena2": "Serranito","Postre2": "Yogurth"
        },
        "tue":{
            "day": "Martes","Almuerzo1": "Cascote","Almuerzo2": "Huevos, Chorizos y patatas","Postre1": "Fruta","Cena1": "Crema de verduras",
            "Cena2": "Filete de pollo","Postre2": "Fresas"
        },
        "wed":{
            "day": "Miércoles","Almuerzo1": "Carne en salsa","Almuerzo2": "Pavias de merluza y ensalada","Postre1": "Fruta","Cena1": "Espinacas",
            "Cena2": "Pollo asado","Postre2": "Flan"
        },
        "thu":{
            "day": "Jueves","Almuerzo1": "Tortellinis con tomate y queso","Almuerzo2": "Calamares fritos","Postre1": "Fruta","Cena1": "Picadillo de verano",
            "Cena2": "Pizza","Postre2": "Yogurth"
        },
        "fri":{
            "day": "Viernes","Almuerzo1": "Patatas guisadas","Almuerzo2": "Gambas rebozadas","Postre1": "Fruta","Cena1": "Ensaladilla",
            "Cena2": "Panini","Postre2": "Mouse"
        }
        
    };
    
            
    
            console.log("INFO: Initializing data.");
    
    //Busca en la base de datos y obtiene un array
            dbMenu.find({}).toArray(function(err, menus){
                //Si hay algún error en el servidor, lanzo el error como respuesta.
                if(err){
                    response.sendStatus(500); // internal server error
                }else{
                    //Si hay algun elemento en el array, respondo con que ya hay datos en la DB
                    if(menus.length > 0){
                        console.log("INFO: Already Menu on DB.");
                        response.sendStatus(409);//Already Data
                    }else{
                    //Si no había datos, inserto los datos en la DB
                     dbMenu.insert(semana);
                
                     response.sendStatus(201); //created!
                     console.log("INFO: Data initialized.");
                    }
                }
            });
});


//1. GET a collection

//En mongoDB nos devuelve un objeto que tenemos que transformar a un Array
//con la función .toArray()
app.get(BASE_API_PATH + "/menu-resi", function (request, response) {
    console.log("INFO: New GET request to /smi-stats");
    
    dbMenu.find({}).toArray( function (err, menu_data) {
        if (err) {
            console.error('WARNING: Error getting data from DB');
            response.sendStatus(500); // internal server error
        } else {
            
            var data = menu_data[0];
            //Si no da error, devuelvo todos los elementos del array
            console.log("INFO: Sending Menú de la semana Residencia: " + JSON.stringify(data, 2, null));
            response.send(data);
        }
    });
});



//2. GET a collection of a same year

app.get(BASE_API_PATH + "/menu-resi/:day", function (request, response) {
    
    //Guardamos en una variable el parametro pasado por la consulta de la URL
    var day= request.params.day;
    
        //Si no llega ningún dato por la consulta, mandamos error
        if (!day) {
            console.log("WARNING: New GET request to /menu-resi/:day day, sending 400...");
            response.sendStatus(400); // bad request
        } else {
            console.log("INFO: New GET request to /menu-resi/" + day);
            
            dbMenu.find({"day":day}).toArray(function (err, filteredMENUS){
                if (err) {
                    console.error('WARNING: Error getting data from DB');
                    response.sendStatus(500); // internal server error
                } else {
                    //Si el array es mayor que 0 es que hay al menos un elemento que lo cumple. 
                    if (filteredMENUS.length > 0) {
                        
                        var menu = filteredMENUS[0];
                        console.log("INFO: Enviando menú del "+day +": " + JSON.stringify(menu, 2, null));
                        response.send(menu);
                    } else {
                        //Si no existiesen elementos en el array.
                        console.log("WARNING: No hay menú para el " + day);
                        response.sendStatus(404); // not found
                    }
                }
            });
    }
});

//3. GET a día y cena

app.get(BASE_API_PATH + "/menu-resi/:day/:cena", function (request, response) {
    
    //Guardamos en una variable el parametro pasado por la consulta de la URL
    var day = request.params.day;
    var cena = request.params.cena;
        //Si no llega ningún dato por la consulta, mandamos error
        if (!day || !cena) {
            console.log("WARNING: New GET request to /smi-stats/:country/:year without country or year, sending 400...");
            response.sendStatus(400); // bad request
        } else {
            console.log("INFO: New GET request to /smi-stats/" + day);
            
            //Buscamos en la DB si hay alguna entrada con los mismos parámetros que los introducidos y los guardamos en el array fileteredSMI_STATS
            //Esta variable recogerá en un array todos los elementos que cumplan la confición de la búsqueda
            dbMenu.find({"day":day , $and:[{"cena1":cena}]}).toArray(function (err, filteredSMI_STATS){
                if (err) {
                    console.error('WARNING: Error getting data from DB');
                    response.sendStatus(500); // internal server error
                } else {
                    //Si el array es mayor que 0 es que hay al menos un elemento que lo cumple. 
                    if (filteredSMI_STATS.length > 0) {
                        //Devolvemos el primer elemento del array de todos los elementos que cumplan el criterio de búsqueda
                        var smi_stat = filteredSMI_STATS[0]; //since we expect to have exactly ONE statics for this country 
                        console.log("INFO: Sending smi-stats of "+day+" in "+cena+": " + JSON.stringify(smi_stat, 2, null));
                        response.send(smi_stat);
                    } else {
                        //Si no existiesen elementos en el array.
                        console.log("WARNING: There are not any smi-stats registered in "+ day + " for country " + cena);
                        response.sendStatus(404); // not found
                    }
                }
            });
        }
});


//6. DELETE over a collection
app.delete(BASE_API_PATH + "/menu-resi", function (request, response) {
    
    console.log("INFO: New DELETE request to /smi-stats");
    
    //Lo borra todo
    dbMenu.remove({}, {multi: true}, function (err, result) {
        var numRemoved = JSON.parse(result);
        if (err) {
            console.error('WARNING: Error removing data from DB');
            response.sendStatus(500); // internal server error
        } else {
            //Se controla si el número de paises borrados es mayor que 0, respondemos que ya no hay contenido, pero cuando no es mayor que 0,
            //Se va al NotFound
            if (numRemoved.n > 0) {
                console.log("INFO: El menú se ha borrado, sending 204...");
                response.sendStatus(204); // no content
            } else {
                console.log("WARNING: There are not menu to remove");
                response.sendStatus(404); // not found
            }
        }
    });
});

    
};
