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
var src_roi = require('./roi.js');

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
              
                if(result.docs[i].result[j].price && result.docs[i].result[j].metre_carre && result.docs[i].result[j].piece){
                  
                  var price = result.docs[i].result[j].price;
                  var surface = result.docs[i].result[j].metre_carre;
                  var pieces = result.docs[i].result[j].piece;
                  
                  result.docs[i].result[j].roi = src_roi.roi(surface, 33, price);
                  result.docs[i].result[j].roi_colocation = src_roi.roi_colocation(pieces, 500, price);
                  
                }
            }
          
           database.insert(result.docs[i], function(err, body, header) {
            if (err) {
                return console.log('[dbAchatinsert] ', err.message);
            }
            else{ 
             console.log("sucessful write in DB");
            }
          });
        }      
        
    }
  });   
}

function extract_database(critere, database, name){
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
         fs.writeFile(__dirname+'/Extract_'+name+'.txt', print_result, (err) => {
          if (err) throw err;
          console.log('Données exportées de Cloudant!');
        });  
      
    });       

}

function get_id_announce(database, callback){
  var database = cloudant.db.use(database);
  var reference = {};
  database.find({selector:{}}, function(er, result) {
        if (er) {
            throw er;
        }
        console.log('Found %d documents', result.docs.length);
        for (var i = 0; i < result.docs.length; i++) {
            console.log('Doc id: %s', result.docs[i]._id);
            if(result.docs[i].result){
                var obj = {}; 
                var list_announce = [];
                for (var j = 0; j < result.docs[i].result.length; j++){
                    var id = result.docs[i].result[j].id_announce;
                    var price  = result.docs[i].result[j].prix ;
                    // var obj = {};
                    obj[id] = price; 
                    // list_announce.push(obj1);
                    if(j == result.docs[i].result.length-1){
                      console.log("in the end")
                      reference[result.docs[i]._id] = obj;
                    }
                }
            }
        }
      callback(reference);
  });
}

//Insert into a data base the json
function insert_database(database, json){

    var database1 = cloudant.db.use(database);

    database1.insert(json, function(err, body, header) {
        if (err) {
            return console.log('[dbAchatinsert] ', err.message);
        }
        else{ 
         console.log("sucessful inserted in DB");
        }
    });
}
//Detele a data base the json
function delete_database(database, list_doc_delete){
    var database1 = cloudant.db.use(database);
    Object.keys(list_doc_delete).forEach(function (key){
      var docId = key;
      var docRev = list_doc_delete[key];
      database1.destroy(docId, docRev, function(err, body, header) {
        if (err) {
            return console.log('[dbAchatinsert] ', err.message);
        }
        else{ 
         console.log("Successfully deleted doc with docId: "+docId);
        }
      });
    });
}


//Aggregate all the announces by a groupe of 10, delete docs aggregated
function aggregation_db(database){
  
    var database1 = cloudant.db.use(database);
     database1.find({selector:{}}, function(er, result) {
        if (er) {
          throw er;
        }
        //For each 10 documents, do an aggregation
        var counter = 0;
        var list_result_tmp =[];
        //List of doc to delete
        var list_doc_delete ={};

        for (var i = 0; i < result.docs.length; i++) {

          //Reach the end point, delete docs aggregated, insert the final doc
          if(i == result.docs.length-1){
            delete_database(database, list_doc_delete);
            result.docs[i].result = list_result_tmp;
            insert_database(database, result.docs[i]);
          }


          if(result.docs[i].result && result.docs[i].result.length <10){
            console.log("for" +result.docs[i]._id+", has"+result.docs[i].result.length +" announces")
            if(counter != 10){
              //Concatene the 10 results, delete the current doc
              list_result_tmp = list_result_tmp.concat(result.docs[i].result); 
              list_doc_delete[result.docs[i]._id] = result.docs[i]._rev;
              counter ++;
            }
            else{
              // Do the aggregation with list_result_tmp
              result.docs[i].result = list_result_tmp;
              insert_database(database, result.docs[i]);
              counter = 0; 
              list_result_tmp =[];
            }
          }
        }
      });
}

module.exports.db_leboncoin_achat = db_leboncoin_achat;
module.exports.get_id_announce = get_id_announce;
module.exports.extract_price = extract_price;
module.exports.extract_database = extract_database;
module.exports.insert_database = insert_database;
module.exports.modif_database = modif_database;
module.exports.aggregation_db = aggregation_db;
module.exports.delete_database = delete_database;
