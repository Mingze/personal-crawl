var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var iconv  = require('iconv-lite');
var accent = require('./src/accentsTidy.js');
var src_roi = require('./roi.js');
var mailer = require('./mailer.js');
var fs = require('fs');
var db = require('./db.js');
var configDB = require("./config/database.js");

// var leboncoin_immo2 = "https://www.leboncoin.fr/ventes_immobilieres/offres/ile_de_france/val_de_marne/?o=2&location=Cr%E9teil%2094000";
// crawl_main_page(leboncoin_immo);
// var new_url = leboncoin_immo1.replace(/\?o=(\d+)/g, "\?o=3");
// console.log("new: "+new_url);
// get_page_to_crawl(leboncoin_immo);
// crawl_main_page(leboncoin_immo);
// get_page_to_crawl(leboncoin_immo);

//Get page, entry point leboncoin, store into db


function leboncoinCRAWLER(url, list_announce, alerte, callback){
	var headers = {   
            'User-Agent': 'AdsBot-Google (+http://www.google.com/adsbot.html)',
            'Content-Type' : 'application/x-www-form-urlencoded' 
    };
	var requestOptions  = { encoding: null, url: url, headers: headers }; 
	request(requestOptions, function(error1, response1, html1){
		var html1 = iconv.decode(html1, 'iso-8859-1');	
		if(error1) {
	   	  console.log("Error: " + error1);
	   	}
   		else{
   			var $ = cheerio.load(html1);
   			var lastpage_link = $('#last').attr('href');
   			var re = /\?o=(\d+)/i;
   			var page = lastpage_link.match(re)[1];
   			console.log("Get "+page+" pages to crawl. Starting..." );		
   			var delay = setInterval(delay_function, 15000);
            var counter = 1;        

            function delay_function(){
            	if(counter <= page){
	            	var new_url = url.replace(/\?o=(\d+)/g,  "\?o="+counter);
	            	console.log("Current url:"+ new_url);
	            	 
	                crawl_main_page(new_url, list_announce, alerte, function(res){
	                	if(res == "-1"){
	                		console.log("Stop crawler since no more new announces");
             				clearInterval(delay);  

             				callback(-1);
	                	}
	                	else{
	                		// console.log(res);
		                	var date = new Date();
							date = date.toISOString();
							
		                    var insert_db = {timestamp:date, type:"vente", result:""};
			                insert_db.result = res;
			                db.insert_database(configDB.db_leboncoin_achat, insert_db, function(res){
			            		console.log("result insertion:"+res);
			            	});
			            	callback(1);
		            	}
	            	});
	                counter += 1;
             	}
             	else{
             		console.log("stop crawler");
             		clearInterval(delay);  
             		callback(0)
             	}
        	}	
    	}
   		
	});
}

function crawl_child_page(url, alerte, callback){
	var requestOptions  = { encoding: null, url: url}
	var re_id = /(\d+).htm/i;
	var id_announce = url.match(re_id)[1];
	var property=[];
	var counter = 0;
	
	//call for each announce get information
	request(requestOptions, function(error1, response1, html1){
		// console.log("in request child");
		// html1.setEncoding('utf8');
		var json_temp = {Source:"leboncoin", "id_announce":id_announce};
		var html1 = iconv.decode(html1, 'iso-8859-1');
		// console.log(html1)
		if(error1) {
	   	  console.log("Error: " + error1);
	   	}
	   	// Check status code (200 is HTTP OK)
	   	// if(response.statusCode === 200) {
   		else{

			var $ = cheerio.load(html1);
			var title ="";

			$('.adview_header').filter(function(){
				title = $(this).find('h1').text().trim();
				json_temp.Title = title.trim();
				// console.log("title in child request"+title);
			});
			
			var re = /(?:([01]?\d|2[0-3]):([0-5]?\d))$/i; 
			var time_created = $("*[itemprop = 'availabilityStarts']").attr('content') +' '+ $("*[itemprop = 'availabilityStarts']").text().match(re)[0];
			json_temp.Annonce_created = time_created;
			var date = new Date();
			date = date.toISOString();
			json_temp.Time_crawled = date;
			json_temp.link = url;

			
			var price, piece, surface, roi, roi_colocation;

			var filter_ispro = $('.ispro').next().text().trim();
			if(filter_ispro != ""){
				json_temp.Agence = filter_ispro;
			}
			else{
				json_temp.Agence = "Particulier";
			}

			$('h2').filter(function(){
				var filter_h2 = $(this);
				var property = accent.accentsTidy(filter_h2.find('.property').text().trim().toString().toLowerCase());
				var value = filter_h2.find('.value').text().trim();	
				
				// console.log(property);
				//Si c'est le prix
				if(property.indexOf('prix') != -1){
					json_temp[property] = parseInt(value.replace(/\s/g,''));
					price = parseInt(value.replace(/\s/g,''));
				}
				else if(property.indexOf('pieces') != -1){
					json_temp[property] = parseInt(value.replace(/\s/g,''));
					piece = parseInt(value.replace(/\s/g,''));
				}
				else if(property.indexOf('surface') != -1){
					json_temp[property] = parseInt(value.replace(/\s/g,''));
					surface = parseInt(value.replace(/\s/g,''));
				}

				else if(property.indexOf('ville') != -1){
					var city_postcode = accent.accentsTidy(value).split(' ');
					json_temp.city_name = city_postcode[0];
					json_temp.postcode = city_postcode[1];
				}

				else{
					json_temp[property] = value;
				}
				
			});
			
			if(price && surface){
				roi = src_roi.roi(surface, 14, price);
				json_temp.roi = roi;
				json_temp.price_m2 = Math.round(price / parseInt(surface));
			}

			if(piece && price){
				roi_colocation = src_roi.roi_colocation(piece, 450, price);
				json_temp.roi_colocation = roi_colocation;
				if(alerte){
					if(roi_colocation > 12){
						console.log("Announce interesting: "+url+"\n with a roi_colocation:"+ roi_colocation);
						mailer.mail_sender("Announce interesting: "+url+"\n with a roi_colocation:"+ roi_colocation);
					}
				}
				
				// console.log(url + "\t"+roi_colocation);
			}

			$('.properties_description').filter(function(){
				var result = $(this);
				json_temp.Description = result.find('.value').text().trim().replace(/\t/g,' ');
			});	
			
			// console.log(json_temp);
			callback(json_temp);
			
		}
	});			
}



function crawl_main_page (url, list_announce, alerte, callback){
	// console.log("Visiting the main page: " + url);
	var headers = {   
            'User-Agent': 'AdsBot-Google (+http://www.google.com/adsbot.html)',
            'Content-Type' : 'application/x-www-form-urlencoded' 
        };
	var requestOptions  = { encoding: null, url: url, headers: headers}
	var resultat = [];
	request(requestOptions, function(error, response, html) {
		if(error) {
	   	  console.log("Error: " + error);
	   	}

	   	// Check status code (200 is HTTP OK)
	   	// if(response.statusCode === 200) {
   		else{	
	     // Parse the document body
	     	var $ = cheerio.load(html);

	     	//number of child page to crawl
	     	var nbrLi = $('.tabsContent.block-white.dontSwitch').find('li').length

	     	//counter for stop the crawler
	     	var compteur = 0;
	     	// counter for check annouce already crawled
			var counter_crawled = 0;
			// counter for newcrawled announce 
			//counter_newcrawl+counter_crawled = nbreLi
			var counter_newcrawl = 0;

	 	 	$('.tabsContent.block-white.dontSwitch').find('li').filter(function(){
	     	 	var data = $(this);
	     	 	// console.log(data);
	     		var title = data.find($('.item_title')).text();

	     		//Here Get all children announce.
	     		var url_child =  data.find($('a')).attr('href').replace('//','https://');
	     		//Function to get detailed information for each announce

	     		var re_id = /(\d+).htm/i;
				var id_announce_current = url_child.match(re_id)[1];

				// if the announce hasn't been crawled

				if(list_announce.indexOf(id_announce_current) == -1){
					
					counter_newcrawl++;
	     			console.log("this announce hasn't been crawled: "+id_announce_current);
	 		  		var delay = setInterval(delay_function, 5000);
	                function delay_function(){
	             
	                    crawl_child_page(url_child, alerte, function(res){
	                     	resultat.push(res);
	                     	compteur++;
	                     	// console.log("compteur:"+compteur+", nbre to reach:"+nbrLi);
	                        clearInterval(delay); 
	                     	
	                     	
	       					if(compteur == nbrLi){
		                 		// console.log("counter_crawled:"+counter_crawled+", counter_newcrawl:"+counter_newcrawl);
		                 		if(counter_crawled == nbrLi || counter_newcrawl ==0){
						     		console.log("Crawler should stop, no new announce crawled / all announce crawled")
						     		callback("-1");
						     	}
						     	else{
						     		// console.log(resultats)
		                 			callback(resultat);
		                 		}
		                 	}
                     	});
                 	}
                 }              
            	else{
        			// console.log("This announce has been crawled: "+id_announce_current);
            		counter_crawled++;
            		compteur++;
            		if(compteur == nbrLi){
                 		// console.log("counter_crawled:"+counter_crawled+", counter_newcrawl:"+counter_newcrawl);
                 		if(counter_crawled == nbrLi || counter_newcrawl ==0){
				     		console.log("Crawler should stop, no new announce crawled / all announce crawled")
				     		callback("-1");
				     	}
				     	else{
				     		// console.log(resultats)
                 			callback(resultat);
                 		}
                 	}

            	}
            	// console.log("nbrLi:"+nbrLi + ", compteur:"+compteur)
            
	     	});

	     	
     	}
	});
}


module.exports.leboncoinCRAWLER = leboncoinCRAWLER;
