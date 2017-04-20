/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

var express = require('express');
var http = require('http');
var app = express();
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('fs');
var Cloudant = require('cloudant');

// database cloudant
var username = "8b74f433-f92c-49f3-b2c7-09ecb18e4a7f-bluemix";
var password = "017d568e4f43f74e8bea82c54ccb800d696a6573bc2af17aa6584bea380ee1aa";
var cloudant = Cloudant({account:username, password:password});

var dbAchat = cloudant.db.use('vente_collect');
// var dbAchat = cloudant.db.use('price');
var dbLocation = cloudant.db.use('location_collect');

function sortObject(o) {
    var sorted = {},
    key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}

function extract_database(database){
    var list_id_announce = [];
    var print_result = "bouquet\tchambre\tcity\tdescription\tid_announce\tlink\tmetre_carre\tpiece\tprice\tprice_m2\troi\tsource\ttimestamp\ttitle\tnature_announce\tnature_bien\tcity_name\n";
    var critere = ["bouquet","chambre","city","description","id_announce","link","metre_carre","piece","price","price_m2","roi", "roi_coloc", "source","timestamp","title", "nature_announce", "nature_bien","city_name"];

    database.find({selector:{}}, function(er, result) {
      if (er) {
        throw er;
      }

      console.log('Found %d documents', result.docs.length);
      for (var i = 0; i < result.docs.length; i++) {
        // console.log('  Doc id: %s', result.docs[i]._id);
        // for (var j = 0; j < result.docs[i].result.length; j++){
          if(result.docs[i].result){
            for(var j = 0; j< result.docs[i].result.length; j++){

              for(var k = 0; k < critere.length ; k++){
                // console.log(result.docs[i].result[j][critere[k]]);
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
            // console.log('  Doc result: %s \t %s \t %s \t %s', result.docs[i].result[j].title, result.docs[i].result[j].id_announce, result.docs[i].result[j].price, result.docs[i].result[j].price_m2);
            // list_id_announce.push(result.docs[i].result[j].id_announce);
        }
         fs.writeFile(__dirname+'/Extract_Vente_18042017.txt', print_result, (err) => {
          if (err) throw err;
          console.log('Données exportées de Cloudant!');
        });  
      
    });       

}

function extract_meilleur_agent(database){
    var list_id_announce = [];
    var print_result = "City\tpostcode\tappartment_price\tmaison_price\tlocation_price\n";
    // var critere = ["bouquet","chambre","city","description","id_announce","link","metre_carre","piece","price","price_m2","roi", "source","timestamp","title", "nature_announce", "nature_bien","city_name"];

    database.find({selector:{}}, function(er, result) {
      if (er) {
        throw er;
      }

      console.log('Found %d documents', result.docs.length);
      for (var i = 0; i < result.docs.length; i++) {
        // console.log('  Doc id: %s', result.docs[i]._id);
        if(result.docs[i].price_reference){
          console.log(result.docs[i].price_reference[0]);
          for (var j = 0; j < result.docs[i].price_reference.length; j++){
              Object.keys(result.docs[i].price_reference[j]).forEach(function(key){
                console.log()
                print_result += result.docs[i].price_reference[j][key] + "\t";
              });
              print_result += "\n";
          }
          fs.writeFile(__dirname+'/price.csv', print_result, (err) => {
            if (err) throw err;
            console.log('Données exportées de Cloudant!');
          });
        }
      }
    });       
}

function serach(database){
  var counter = 0;
  var search = 0;
  var to_add = false;
  database.find({selector:{}},function(err,data){
    // console.log(data)
    if(err){console.log(err)}
    else
    {
        data.docs.forEach(function(doc){
         
          if (doc.hasOwnProperty("result") && doc.result[0] ){
            // console.log(doc.result[0);


            // if(doc.result[0].hasOwnProperty("timestamp"))
            // {
            //   console.log("timestamp")
            // }
            // else
            // {
            //   console.log("There's no timestamp")
            // }
            // console.log("check property/: "+ )
              // && !doc.result[0].timestamp
             
      
            // console.log("json",doc.result[0])

            var date = new Date();
            date.setDate(date.getDate()-6);
            date = date.toISOString() ;
            for (var i = 0; i< doc.result.length; i++){
              if(!doc.result[i].hasOwnProperty("timestamp")){

                console.log("There's no timestamp")
                console.log("doc.result[i]")
                doc.result[i].timestamp = date;
                to_add = true;
              }
            }
           
            // console.log("search:"+search)
            if(to_add)
            {
              database.insert(doc, function(err, data) {
               if(err){console.log(err)}
                else{
                  counter += 1;
                  console.log("change timestamp "+counter);  
                  to_add = false;
                }
            });  
            }
            
          }      
        });
            
            // else{
            //   console.log("Not source" + doc._id);
            // }
            
        

    }
    
  });

}

  // database.find({selector:{}}, function(er, result) {
  //     if (er) {
  //       throw er;
  //     }

  //     console.log('Found %d documents', result.docs.length);
  //     for (var i = 0; i < result.docs.length; i++) {
  //       console.log('  Doc id: %s', result.docs[i]._id);
  //       for (var j = 0; j < result.docs[i].result.length; j++){
  //           for(var obj in result.docs[i].result){
  //               if(result.docs[i].result.hasOwnProperty(obj)){
  //                   for(var prop in result.docs[i].result[obj]){
  //                       if(result.docs[i].result[obj].hasOwnProperty(prop)){
  //                           print_result += result.docs[i]._id + "\t";
  //                           print_result += result.docs[i].result[obj][prop] + "\t";
  //                       }
  //                   }
  //                   print_result += "\n";
  //               }
  //           }
  //       }

  //           // console.log('  Doc result: %s \t %s \t %s \t %s', result.docs[i].result[j].title, result.docs[i].result[j].id_announce, result.docs[i].result[j].price, result.docs[i].result[j].price_m2);
  //           // list_id_announce.push(result.docs[i].result[j].id_announce);
  //     }
  //        fs.writeFile(__dirname+'/Extract_cloudant10012017.txt', print_result, (err) => {
  //         if (err) throw err;
  //         console.log('Données exportées de Cloudant!');
  //       });  
      
  //   });  


// extract_database(dbLocation);
extract_database(dbAchat);
// extract_meilleur_agent(dbAchat);
// serach(dbAchat);
// get_page_crawl(achat_url, function(page){
//     console.log("Page get:"+page+", wait 5s!");
//     var time = new Date();
//     time = time.toISOString();
//    setTimeout(function(){
//         var old_delay = 300;
//         for (var i=1;i<2;i++) {
            
//             var random = getRandomInt(900, 1800);
//             old_delay += random;
//             console.log("r:"+random+". old_delay:"+old_delay);

//            (function(ind) {
//            setTimeout(function(){
//             coucou(achat_url+'&LISTING-LISTpg='+ind, ville, function(data){
//                 console.log("Page Number:"+ind);    
                    
//                 archive(data);                 
                
//             });

//             }, old_delay * ((ind+1) + i));
//            })(i);
//         }
//     }, 5000 );    
// });

/*
//Read File:
var dico = fs.readFileSync(__dirname + '/dico.csv', 'utf-8');
var array = fs.readFileSync(__dirname + '/difference_16122016.txt').toString().split("\r\n");;



//Write File
    fs.writeFile(__dirname + '/tf.csv', tfResult, (err) => {
      if (err) throw err;
      console.log('TF saved!');
    });

//loop array
for(var i in array) {
*/
// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
