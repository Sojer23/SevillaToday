var exports = module.exports = {};

exports.register = function(app, dbMenu, BASE_API_PATH) {


////////////////////////////////////////////////CODIGO API JOSÉ////////////////////////////////////////////////////////////

//Initializing with some data
app.get(BASE_API_PATH + "/menu-resi/loadInitialData", function (request, response){
    
    var dia1 = { "id": 1, "day": "Lunes","Almuerzo1": "Arroz con pollo","Almuerzo2": "Huevos, Chorizos y patatas","Postre1": "Fruta","Cena1": "Sopa",
    "Cena2": "Serranito","Postre2": "Yogurth" };
    var dia2 = { "id": 1, "day": "Martes","Almuerzo1": "Cascote","Almuerzo2": "Huevos, Chorizos y patatas","Postre1": "Fruta","Cena1": "Crema de verduras",
    "Cena2": "Filete de pollo","Postre2": "Fresas" };
    var dia3 = { "id": 1, "day": "Miércoles","Almuerzo1": "Carne en salsa","Almuerzo2": "Pavias de merluza y ensalada","Postre1": "Fruta","Cena1": "Espinacas",
    "Cena2": "Pollo asado","Postre2": "Flan" };
    var dia4 = { "id": 1, "day": "Jueves","Almuerzo1": "Tortellinis con tomate y queso","Almuerzo2": "Calamares fritos","Postre1": "Fruta","Cena1": "Picadillo de verano",
    "Cena2": "Pizza","Postre2": "Yogurth" };
    var dia5 = { "id": 1, "day": "Viernes","Almuerzo1": "Patatas guisadas","Almuerzo2": "Gambas rebozadas","Postre1": "Fruta","Cena1": "Ensaladilla",
    "Cena2": "Panini","Postre2": "Mouse" };
    
            
    
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
                     dbMenu.insert(dia1);
                     dbMenu.insert(dia2);
                     dbMenu.insert(dia3);
                     dbMenu.insert(dia4);
                     dbMenu.insert(dia5);
                     
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
    
    dbMenu.find({}).toArray( function (err, smi_stats) {
        if (err) {
            console.error('WARNING: Error getting data from DB');
            response.sendStatus(500); // internal server error
        } else {
            //Si no da error, devuelvo todos los elementos del array
            console.log("INFO: Sending Menú de la semana Residencia: " + JSON.stringify(smi_stats, 2, null));
            response.send(smi_stats);
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
                        
                        var menu = filteredMENUS;
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

//3. GET a día y almuerzo

app.get(BASE_API_PATH + "/menu-resi/:day/:alm", function (request, response) {
    
    //Guardamos en una variable el parametro pasado por la consulta de la URL
    var day = request.params.day;
    var alm = request.params.alm;
        //Si no llega ningún dato por la consulta, mandamos error
        if (!day || !alm) {
            console.log("WARNING: New GET request to /smi-stats/:country/:year without country or year, sending 400...");
            response.sendStatus(400); // bad request
        } else {
            console.log("INFO: New GET request to /smi-stats/" + day);
            
            dbMenu.find({"day":day , $and:[{"almuerzo1":alm}]}).toArray(function (err, filteredSMI_STATS){
                if (err) {
                    console.error('WARNING: Error getting data from DB');
                    response.sendStatus(500); // internal server error
                } else {
                    //Si el array es mayor que 0 es que hay al menos un elemento que lo cumple. 
                    if (filteredSMI_STATS.length > 0) {
                        //Devolvemos el primer elemento del array de todos los elementos que cumplan el criterio de búsqueda
                        var smi_stat = filteredSMI_STATS[0]; //since we expect to have exactly ONE statics for this country 
                        console.log("INFO: Sending smi-stats of "+day+" in "+alm+": " + JSON.stringify(smi_stat, 2, null));
                        response.send(smi_stat);
                    } else {
                        //Si no existiesen elementos en el array.
                        console.log("WARNING: There are not any smi-stats registered in "+ day + " for country " + alm);
                        response.sendStatus(404); // not found
                    }
                }
            });
        }
});

//4. POST over a collection
app.post(BASE_API_PATH + "/smi-stats", function (request, response) {
    
    //Recogemos el cuerpo de la petición y lo guardamos en la variable. En ella tenemos ahora mismo los datos que hemos dado mediante la petición CURL
    //para hacer el post a la colección
    var newCountry = request.body;
    if (!newCountry) {
        console.log("WARNING: New POST request to /smi-stats/ without smi-stats, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        
        console.log("INFO: New POST request to /smi-stats with body: " + JSON.stringify(newCountry, 2, null));
        
        //Si le falta algun parámetro al nuevo elemento que queremos introducir con el POST, devolvemos error
        if (!newCountry.country || !newCountry.year || !newCountry["smi-year"]|| !newCountry["smi-year-variation"]) {
            console.log("WARNING: The contact " + JSON.stringify(newCountry, 2, null) + " is not well-formed, sending 422...");
            response.sendStatus(422); // bad request
            
        } else {
            dbMenu.find({}).toArray(function (err, smi_stats) {
                if (err) {
                    console.error('WARNING: Error getting data from DB');
                    response.sendStatus(500); // internal server error
                } else {
                    
                    //Esta variable recoge, mediante un callback, un array que se rellenará si existen en la DB países iguales a los que queremos 
                    //insertar con el POST
                    var countryBeforeInsertion = smi_stats.filter((country) => {
                        return (country.country.localeCompare(newCountry.country, "en", {'sensitivity': 'base'}) === 0);
                    });
                    //Si hay algún país que queremos meter y ya estaba, devolvemos conflicto
                    if (countryBeforeInsertion.length > 0) {
                        console.log("WARNING: The country " + JSON.stringify(newCountry, 2, null) + " already extis, sending 409...");
                        response.sendStatus(409); // conflict
                    } else {
                        //Si no existe ningún país que coincida con el que queremos añadir, lo insertamos en la DB
                        console.log("INFO: Adding country " + JSON.stringify(newCountry, 2, null));
                        dbMenu.insert(newCountry);
                        response.sendStatus(201); // created
                    }
                }
            });
        }
    }
});


// POST over a single resource (PROHIBIDO)
app.post(BASE_API_PATH + "/smi-stats/:country", function (request, response) {
    var country = request.params.country;
    console.log("WARNING: New POST request to /smi-stats/" + country + ", sending 405...");
    response.sendStatus(405); // method not allowed
});


// PUT over a collection (PROHIBIDO)
app.put(BASE_API_PATH + "/smi-stats", function (request, response) {
    console.log("WARNING: New PUT request to /smi-stats/, sending 405...");
    response.sendStatus(405); // method not allowed
});


//5. PUT over a single resource
app.put(BASE_API_PATH + "/smi-stats/:country", function (request, response) {
    
    //Guardamos los datos introducidos en el comando CURL del país
    var updatedCountry = request.body;
    //Guardamos el parámetro introducido en la URL
    var countryB = request.params.country;
    
    if (!updatedCountry || countryB != updatedCountry.country) {
        console.log("WARNING: New PUT request to /smi-stats/ without country or the country is not the same, sending 400...");
        response.sendStatus(400); // bad request
        
    } else {
        console.log("INFO: New PUT request to /smi-stats/" + countryB + " with data " + JSON.stringify(updatedCountry, 2, null));
        
        //Si los datos recogidos en el comando CURL no contienen algunos de estos atributos, habrá error.
        if (!updatedCountry.country || !updatedCountry.year || !updatedCountry["smi-year"]|| !updatedCountry["smi-year-variation"]) {
            console.log("WARNING: The country " + JSON.stringify(updatedCountry, 2, null) + " is not well-formed, sending 422...");
            response.sendStatus(422); // Bad Request
        } else {
            //Buscamos los países que tengan el mismo nombre que el que se introduce en la URL
            //Los guardamos en un array
            dbMenu.find({country:countryB}).toArray(function (err, smi_stats) {
                if (err) {
                    console.error('WARNING: Error getting data from DB');
                    response.sendStatus(500); // internal server error
                } else{ 
                    if(smi_stats.length > 0) {
                        dbMenu.update({"country": countryB}, updatedCountry);
                        console.log("INFO: Modifying country with name " + countryB + " with data " + JSON.stringify(updatedCountry, 2, null));
                        response.send(updatedCountry); // return the updated contact
                    } else {
                        console.log("WARNING: There are not any country with name " + countryB);
                        response.sendStatus(404); // not found
                    }
               } 
                
            });
        }
    }
});


//6. DELETE over a collection
app.delete(BASE_API_PATH + "/smi-stats", function (request, response) {
    
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
                console.log("INFO: All the countries (" + numRemoved.n + ") have been succesfully deleted, sending 204...");
                response.sendStatus(204); // no content
            } else {
                console.log("WARNING: There are no countries to delete");
                response.sendStatus(404); // not found
            }
        }
    });
});


//7. DELETE over a single resource
app.delete(BASE_API_PATH + "/smi-stats/:country/:year", function (request, response) {
    
    var country = request.params.country;
    var year = request.params.year;
    if (!country || !year) {
        console.log("WARNING: New DELETE request to /smi-stats/:country/:year without country or year, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        
        // {$set: {tags: []}}, {upsert: false, multi: true},
        console.log("INFO: New DELETE request to /smi-stats/" + country+"/"+year);
        dbMenu.deleteOne({country: country, $and:[{"year":year}]}, function (err, result) {
            var numRemoved= JSON.parse(result);
            if (err) {
                console.error('WARNING: Error removing data from DB');
                response.sendStatus(500); // internal server error
            } else {
                console.log("INFO: Countries removed: " + numRemoved.n);
                if (numRemoved.n === 1 ) {
                    console.log("INFO: The stats with name " + country + "and year "+year+" has been succesfully deleted, sending 204...");
                    response.sendStatus(204); // no content
                } else {
                    console.log("WARNING: There are no countries to delete");
                    response.sendStatus(404); // not found
                }
            }
        });
    }
});
    
};
