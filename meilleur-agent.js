/**********************************************************************************************
//                                        meilleur-agent.js
//
// Author(s): Mingze NI
// Version 1.0
// Copyright © - MINGZE NI - 2017
// Creation date: April 2017
// Contact: nimingze@hotmail.com
// Last modification date: April 11, 2017
// Subject: Get Price of buy, rental in Paris or different area
//**********************************************************************************************
*/


var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var Cloudant = require('cloudant');

// database cloudant
var username = "8b74f433-f92c-49f3-b2c7-09ecb18e4a7f-bluemix";
var password = "017d568e4f43f74e8bea82c54ccb800d696a6573bc2af17aa6584bea380ee1aa";
var cloudant = Cloudant({account:username, password:password});
var dbprice = cloudant.db.use('price');


var paris = "http://www.meilleursagents.com/prix-immobilier/paris-75000/";
var val_de_marne_94 = "http://www.meilleursagents.com/prix-immobilier/val-de-marne-94/";
var essonne_91 = "http://www.meilleursagents.com/prix-immobilier/essonne-91/";
var hauts_de_seine_92 = "http://www.meilleursagents.com/prix-immobilier/hauts-de-seine-92/";
var seine_saint_denis_93 = "http://www.meilleursagents.com/prix-immobilier/seine-saint-denis-93/";
var city_reference = require ('./city_reference.json');

var list_json = [];



//Get all departments mean price.
crawl(paris, function(){
	crawl(val_de_marne_94, function(){
		crawl(essonne_91, function(){
			crawl(hauts_de_seine_92, function(){				
				crawl(seine_saint_denis_93, function(){

					insert_database(list_json);
					console.log(list_json);
				});
			});
		});
	});
});

function insert_database(json){
	// write in database
    if (json.length > 0){
        // console.log("New logement found!!" + json + " "+json !=[])
        var time = new Date();
        var insert_db = {timestamp:time.toISOString(), price_reference:""};
        insert_db.price_reference = json;
    
        dbprice.insert(insert_db, function(err, body, header) {
            if (err) {
                return console.log('Inesrt Price Reference Error: ', err.message);
            }
            else{ 
            	console.log("Sucessfully writen in DB");
            }
        });
        
    }
    else{
    	console.log("json is empty");
    }
}

accentsTidy = function(s){
        var r=s.toLowerCase();
        r = r.replace(new RegExp("\\s", 'g'),"-");
        // r = r.replace(new RegExp("\\s", 'g'),"");
        r = r.replace(new RegExp("[àáâãäå]", 'g'),"a");
        r = r.replace(new RegExp("æ", 'g'),"ae");
        r = r.replace(new RegExp("ç", 'g'),"c");
        r = r.replace(new RegExp("[èéêë]", 'g'),"e");
        r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
        r = r.replace(new RegExp("ñ", 'g'),"n");                            
        r = r.replace(new RegExp("[òóôõö]", 'g'),"o");
        r = r.replace(new RegExp("œ", 'g'),"oe");
        r = r.replace(new RegExp("[ùúûü]", 'g'),"u");
        r = r.replace(new RegExp("[ýÿ]", 'g'),"y");
        r = r.replace(new RegExp("\\W", 'g'),"-");
        return r;
};

function crawl(url, callback) {

	
	request(url, function(error, response, html){
		if(error) {
	   	  console.log("Error: " + error);
	   	}
	   	else{
	   		var $ = cheerio.load(html);

	   		$('#arrondissements').find('.indicator').filter(function(){
	   			// console.log($(this).children().first().text().trim());
	   			var result = $(this); 
	   			var place = result.children().first().text().trim();
	   			// console.log(place);
	   			var appart_price, maison_price, location_price;


	   			//Get information of PARIS
	   			if(place.indexOf('Paris') != -1 && place.indexOf('arrondissement') != -1){
	   				var json_acc = { "city": "", "postcode":"",  "appartment_price":"", "maison_price":"", "location_price": "" };
		   			appart_price = result.children().first().next().text().trim();
		   			maison_price = result.children().first().next().next().text().trim();
		   			location_price = result.children().first().next().next().next().text().trim();
		   			// console.log(place, location_price);

		   			var re = /(\d+)[ème|er]/i;
		   			var arrondissment = parseInt(place.match(re)[0]);
		   			var postcode = "";

		   			// if(parsearrondissment)
		   			if(arrondissment < 10){
		   				postcode = "7510" + arrondissment;
		   			}
		   			else{
		   				postcode = "751" + arrondissment;
		   			} 
		   			
		   			var city = city_reference[postcode];
		   			
		   			city = city.toUpperCase();
		   			json_acc.postcode = postcode;
		   			json_acc.city = city;
		   			json_acc.appartment_price = parseFloat(appart_price.replace(/\s+/g,'').replace(',','.').replace('€',''));
		   			// console.log(parseFloat(appart_price.replace(',','.').replace('€','')));
		   			json_acc.maison_price = parseFloat(maison_price.replace(/\s+/g,'').replace(',','.').replace('€',''));
		   			json_acc.location_price =  parseFloat(location_price.replace(/\s+/g,'').replace(',','.').replace('€',''));
		   			list_json.push(json_acc)
		   			
	   			}	

			});

	   		$('#villes').find('.indicator').filter(function(){
	   			// console.log($(this).children().first().text().trim());
	   			var result = $(this); 
	   			var place = result.children().first().text().trim();
	   			// console.log(place);
	   			var appart_price, maison_price, location_price;
	   			//Get information of other cities
	   			
   				var json_acc = { "city": "", "appartment_price":"", "maison_price":"", "location_price": "" };
   				appart_price = result.children().first().next().text().trim();
	   			maison_price = result.children().first().next().next().text().trim();
	   			location_price = result.children().first().next().next().next().text().trim();

				
	   			// console.log(accentsTidy(place));
				place = accentsTidy(place).toUpperCase();
				// console.log(place)	
				var postcode = getKeyByValue(city_reference, place);
	   			// console.log(postcode)
		   		json_acc.postcode = postcode;
	   			json_acc.city = place;
	   	
	   			// console.log(appart_price);
   				json_acc.appartment_price = parseFloat(appart_price.replace(/\s+/g,'').replace(',','.').replace('€',''));
	   			// console.log(parseFloat(appart_price.replace(',','.').replace('€','')));
	   			json_acc.maison_price = parseFloat(maison_price.replace(/\s+/g,'').replace(',','.').replace('€',''));
	   			json_acc.location_price =  parseFloat(location_price.replace(/\s+/g,'').replace(',','.').replace('€',''));
	   			list_json.push(json_acc)
   			

			});
			// console.log()

				// console.log(list_json);
				callback();
	   	}
	});

}


function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}