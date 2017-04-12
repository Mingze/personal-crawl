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


var paris = "http://www.meilleursagents.com/prix-immobilier/paris-75000/";
var val_de_marne_94 = "http://www.meilleursagents.com/prix-immobilier/val-de-marne-94/";
var essonne_91 = "http://www.meilleursagents.com/prix-immobilier/essonne-91/";
var hauts_de_seine_92 = "http://www.meilleursagents.com/prix-immobilier/hauts-de-seine-92/";
var seine_saint_denis_93 = "http://www.meilleursagents.com/prix-immobilier/seine-saint-denis-93/";


var list_json = [];



//Get all departments mean price.
crawl(paris, function(){
	crawl(val_de_marne_94, function(){
		crawl(essonne_91, function(){
			crawl(hauts_de_seine_92, function(){				
				crawl(seine_saint_denis_93, function(){
					console.log(list_json);
				});
			});
		});
	});
});

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
	   				var json_acc = { "city": "", "appartment_price":"", "maison_price":"", "location_price": "" };
		   			appart_price = result.children().first().next().text().trim();
		   			maison_price = result.children().first().next().next().text().trim();
		   			location_price = result.children().first().next().next().next().text().trim();
		   			// console.log(place, location_price);

		   			var re = /(\d+)[ème|er]/i;
		   			var arrondissment = parseInt(place.match(re)[0]);
		   			var postcode = "";

		   			// if(parsearrondissment)
		   			if(arrondissment < 10){
		   				postcode = "7500" + arrondissment;
		   			}
		   			else{
		   				postcode = "750" + arrondissment;
		   			} 

		   			json_acc.city = postcode;
		   			json_acc.appartment_price = parseFloat(appart_price.replace(/ /g,'').replace(',','.').replace('€',''));
		   			// console.log(parseFloat(appart_price.replace(',','.').replace('€','')));
		   			json_acc.maison_price = parseFloat(maison_price.replace(/ /g,'').replace(',','.').replace('€',''));
		   			json_acc.location_price =  parseFloat(location_price.replace(/ /g,'').replace(',','.').replace('€',''));
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
	   			json_acc.city = place;
   				json_acc.appartment_price = parseFloat(appart_price.replace(/ /g,'').replace(',','.').replace('€',''));
	   			// console.log(parseFloat(appart_price.replace(',','.').replace('€','')));
	   			json_acc.maison_price = parseFloat(maison_price.replace(/ /g,'').replace(',','.').replace('€',''));
	   			json_acc.location_price =  parseFloat(location_price.replace(/ /g,'').replace(',','.').replace('€',''));
	   			list_json.push(json_acc)
   			

			});
			// console.log()

				// console.log(list_json);
				callback();
	   	}
	});

}

function inject_database(){
	database.insert(json, function(err, body, header) {
        if (err) {
            return console.log('[dbAchatinsert] ', err.message);
        }
        else{ 
        console.log("sucessful write in DB");
        console.log("New crawled:"+loge_new_crawl+",added into database");
        console.log("Already enregistred:"+loge_crawled+", won't be added into database");
        callback(json);
        }
    });
}