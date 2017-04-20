var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var iconv  = require('iconv-lite');
var accent = require('./accentsTidy.js');

console.log(accent.accentsTidy("sé"));
var leboncoin_immo = "https://www.leboncoin.fr/ventes_immobilieres/offres/ile_de_france/val_de_marne/?th=1&location=Cr%E9teil%2094000&parrot=0";
crawl_main_page(leboncoin_immo);

// 
function crawl_child_page(url){
	var requestOptions  = { encoding: null, url: url}
	var re_id = /(\d+).ht/i;
	var id_announce = url.match(re_id)[1];
	var property=[];
	var counter = 0;
	// console.log(id_announce);
	//call for each announce get information
	request(requestOptions, function(error1, response1, html1){
		// html1.setEncoding('utf8');
		var json_temp = {};
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
			});
			var re = /(?:([01]?\d|2[0-3]):([0-5]?\d))$/i; 
			var time_created = $("*[itemprop = 'availabilityStarts']").attr('content') +' '+ $("*[itemprop = 'availabilityStarts']").text().match(re)[0];
			json_temp.Annonce_created = time_created;
			var date = new Date();
			date = date.toISOString();
			json_temp.Time_crawled = date;
			json_temp.link = url;
			
			$('h2').filter(function(){
				var filter_h2 = $(this);
				var property = accent.accentsTidy(filter_h2.find('.property').text().trim().toString().toLowerCase());
				var value = filter_h2.find('.value').text().trim();	
				// console.log(property);
				//Si c'est le prix
				if((property.indexOf('prix') != -1) || (property.indexOf('pieces') != -1) || (property.indexOf('surface') != -1)){
					json_temp[property] = parseInt(value.replace(/\s/g,''));
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
			
			$('.properties_description').filter(function(){
				var result = $(this);
				json_temp.Description = result.find('.value').text().trim();
			});	

			console.log(json_temp);
		}
	});			
}



function crawl_main_page (url){
	console.log("Visiting the main page: " + url);
	var requestOptions  = { encoding: null, url: url}
	request(requestOptions, function(error, response, html) {
		if(error) {
	   	  console.log("Error: " + error);
	   	}
	   	// Check status code (200 is HTTP OK)
	   	// if(response.statusCode === 200) {
   		else{	
	     // Parse the document body
	     	var $ = cheerio.load(html);
	     	//get announce
	 	 	$('.tabsContent.block-white.dontSwitch').find('li').filter(function(){
	     	 	var data = $(this);
	     	 	// console.log(data);
	     		var title = data.find($('.item_title')).text();

	     		//Here Get all children announce.
	     		var url_child =  data.find($('a')).attr('href').replace('//','https://');
	     		//Function to get detailed information for each announce
	     		crawl_child_page(url_child);
	     		
	     	});
     	}
	});
}



// test_filter("https://www.leboncoin.fr/ventes_immobilieres/1086589041.htm?ca=12_s");
