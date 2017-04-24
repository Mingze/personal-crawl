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

console.log(configDB);

var username = configDB.username;
var password = configDB.password;
var cloudant = Cloudant({account:username, password:password});

var db_seloger_achat = cloudant.db.use(configDB.db_seloger_achat);
var db_price = cloudant.db.use(configDB.db_price);
// var db_seloger_location = cloudant.db.use(configDB.db_seloger_location);
// var db_leboncoin_achat = cloudant.db.use(configDB.db_leboncoin_achat);
// var db_leboncoin_location = cloudant.db.use(configDB.db_leboncoin_location);
// var db_pap_achat = cloudant.db.use(configDB.db_pap_achat);
// var db_pap_location = cloudant.db.use(configDB.db_pap_location);

function extract_price(){
    var list_id_announce = [];
    var print_result = "City\tpostcode\tappartment_price\tmaison_price\tlocation_price\n";
    // var critere = ["bouquet","chambre","city","description","id_announce","link","metre_carre","piece","price","price_m2","roi", "source","timestamp","title", "nature_announce", "nature_bien","city_name"];

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


function extract_database(database){
    var list_id_announce = [];
    var print_result = "bouquet\tchambre\tcity\tdescription\tid_announce\tlink\tmetre_carre\tpiece\tprice\tprice_m2\troi\tsource\troi_coloc\ttimestamp\ttitle\tnature_announce\tnature_bien\tcity_name\n";
    var critere = ["bouquet","chambre","city","description","id_announce","link","metre_carre","piece","price","price_m2","roi", "roi_coloc", "source","timestamp","title", "nature_announce", "nature_bien","city_name"];

    database.find({selector:{}}, function(er, result) {
      if (er) {
        throw er;
      }
      console.log('Found %d documents', result.docs.length);
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
          b}
        }
         fs.writeFile(__dirname+'/Extract_Vente_18042017.txt', print_result, (err) => {
          if (err) throw err;
          console.log('Données exportées de Cloudant!');
        });  
      
    });       

}

module.exports.extract_price = extract_price;
