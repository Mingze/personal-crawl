//**********************************************************************************************
//                                        db.js
//
// Version 1.0
// Creation date: Avril 2017
// Last modification date: April 20, 2017 - MNI: Stock dans la Database
//**********************************************************************************************
var configDB = require("./config/database.js");
var fs = require('fs');
var Cloudant = require('cloudant');

// console.log(configDB);

var username = configDB.username;
var password = configDB.password;
var cloudant = Cloudant({account:username, password:password});

var db_seloger_achat = cloudant.db.use(configDB.db_seloger_achat);
var db_price = cloudant.db.use(configDB.db_price);
// var db_seloger_location = cloudant.db.use(configDB.db_seloger_location);
var db_leboncoin_achat = cloudant.db.use(configDB.db_leboncoin_achat);
// var db_leboncoin_location = cloudant.db.use(configDB.db_leboncoin_location);
// var db_pap_achat = cloudant.db.use(configDB.db_pap_achat);
// var db_pap_location = cloudant.db.use(configDB.db_pap_location);

function extract_price(){
    var list_id_announce = [];
    var print_result = "City\tpostcode\tappartment_price\tmaison_price\tlocation_price\n";
   

    db_price.find({selector:{}}, function(er, result) {
      if (er) {
        throw er;
      }

      console.log('Found %d documents', result.docs.length);
      for (var i = 0; i < result.docs.length; i++) {
        if(result.docs[i].price_reference){
          for (var j = 0; j < result.docs[i].price_reference.length; j++){
              Object.keys(result.docs[i].price_reference[j]).forEach(function(key){
                print_result += result.docs[i].price_reference[j][key] + "\t";
              });
              print_result += "\n";
          }
        }
      }
       fs.writeFile(__dirname+'/price.csv', print_result, (err) => {
            if (err) throw err;
            console.log('Données exportées de Cloudant!');
        });
    });       
}

function modif_database(database){
  database = cloudant.db.use(database); 
  database.find({selector:{}}, function(er, result) {
      if (er) {
        throw er;
      }
      console.log('Found %d documents', result.docs.length);

      for (var i = 0; i < result.docs.length; i++) {
          if(result.docs[i].result){

            for(var j = 0; j< result.docs[i].result.length; j++){
                if(result.docs[i].result[j].prix){
                  var price = result.docs[i].result[j].price;
                  console.log(price);
                }
            }
          }
        }      
    });   
}

function extract_database(critere, database){
    // console.log(database);
    var print_result;
    database = cloudant.db.use(database);
    var list_id_announce = [];
    
    database.find({selector:{}}, function(er, result) {
      if (er) {
        throw er;
      }
      console.log('Found %d documents', result.docs.length);
      
      for(var i=0; i<critere.length; i++){
          // console.log(critere[i]);
          print_result += critere[i]+"\t";
          // console.log(print_result)
      }
      print_result += "\n";

      for (var i = 0; i < result.docs.length; i++) {
          if(result.docs[i].result){
            for(var j = 0; j< result.docs[i].result.length; j++){
              for(var k = 0; k < critere.length ; k++){
                if(result.docs[i].result[j][critere[k]]){ 
                  print_result += result.docs[i].result[j][critere[k]] + "\t";
                }
                else{
                  print_result += "\t"; 
                }
              }
              print_result += "\n";
            }
          }
        }
         fs.writeFile(__dirname+'/Extract_'+database+'.txt', print_result, (err) => {
          if (err) throw err;
          console.log('Données exportées de Cloudant!');
        });  
      
    });       

}

function get_id_announce(database, callback){
  var database = cloudant.db.use(database);
  var list_announce = [];
  database.find({selector:{}}, function(er, result) {
        if (er) {
            throw er;
        }
         console.log('Found %d documents', result.docs.length);

        for (var i = 0; i < result.docs.length; i++) {
            console.log('  Doc id: %s', result.docs[i]._id);
            if(result.docs[i].result){
                for (var j = 0; j < result.docs[i].result.length; j++){
                    // console.log('  Doc result: %s', result.docs[i].result[j].id_announce);
                    list_announce.push(result.docs[i].result[j].id_announce);
                }
            }
        }
        callback(list_announce);
      });
}

function insert_database(database, json){
    var database = cloudant.db.use(database);
    database.insert(json, function(err, body, header) {
        if (err) {
            return console.log('[dbAchatinsert] ', err.message);
        }
        else{ 
         console.log("sucessful write in DB");
        }
    });
}

module.exports.db_leboncoin_achat = db_leboncoin_achat;
module.exports.get_id_announce = get_id_announce;
module.exports.extract_price = extract_price;
module.exports.extract_database = extract_database;
module.exports.insert_database = insert_database;
module.exports.modif_database = modif_database;
