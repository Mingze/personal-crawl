var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var leboncoin_immo = "https://www.leboncoin.fr/ventes_immobilieres/offres/ile_de_france/occasions/?th=1&location=Paris&parrot=0";
crawl_main_page(leboncoin_immo);

// 


function crawl_child_page(url){
	var re_id = /(\d+).ht/i;
	var id_announce = url.match(re_id)[1];
	
	console.log(id_announce);
	//call for each announce get information
	request(url, function(error1, response1, html1){

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
				// console.log(title.trim());
			});

			$('span.property').filter(function(){
				var result = $(this);
				console.log(result.text().trim());
				// properties.filter(function(){

					
				// 	console.log($('.span.property').text());
				// });
				// console.log($(this).find('span.property').text().trim()+'ss');
				// console.log($(this).find('span.value').text().trim()+'dd');
				// console.log(properties.find($('span').text()));
				// $('p.line').filter(function(){
				// 	var p_line = $(this);
				// 	console.log(p_line.attr('content'));
				// 	console.log($('span').hasClass("property"))
				// 	console.log($('span.property').text());
				// });

				// console.log($('span').hasClass("property"))
				// 
					
				// var raw_date = properties.find('p.line.line_pro').attr('content');


				// var create_time_raw = properties.find('p.line.line_pro').text();
				// var re = /à (\d+):(\d+)/i;
				// var time = create_time_raw.match(re);
				// var create_date = raw_date+'T'+time[1]+':'+time[2]+':'+'00.000Z';
				// // console.log(create_date);
				// // console.log(create_date+' '+time[1]+':'+time[2]);
				

				// var price = parseInt(properties.find('h2.item_price').attr('content'));

				// // $('.clearfix').filter(function(){
				// 	// var param = $(this);
				// 	// console.log(param)	;

				// console.log("URL:"+url);
				// console.log("Property:"+properties.find('span.property').text().trim()+"lll");
				// console.log("Valeur:"+properties.find('span.value').text().trim()+"lll");
			});
// 					var city_name = properties.find('div.line.line_city').find('span.value').text().split(' ')[0];
// 					var code_postale = properties.find('div.line.line_city').find('span.value').text().trim().split(' ')[1];

// 					var attribute1 = properties.find('div.line.line_city').next().find('span.property').text();
// 					var type_bien = properties.find('div.line.line_city').next().find('span.value').text();

// 					var piece = properties.find('div.line.line_city').next().next().find('span.value').text();
// 					var surface = parseInt(properties.find('div.line.line_city').next().next().next().find('span.value').text());
// 					var ges = properties.find('div.line.line_city').next().next().next().next().find('span.value').children().first().text().substring(0,1);
// 					var energie = properties.find('div.line.line_city').next().next().next().next().next().find('span.value').children().first().text().substring(0,1);
		
// 					var description = properties.find('div.line.properties_description').find('p.value').text().trim();
	

// //Configure the JSON to be injected into Cloudant
// 					var json_acc = { bouquet: false,  chambre : "", city: "", description:"", id_announce :"", link:"",  metre_carre : "", piece : "", price:"",  price_m2 : "", source : "", timestamp:"", title: ""};
// 					json_acc.city = city_name;
// 					json_acc.description = description;
// 					json_acc.id_announce = id_announce;
// 					json_acc.link = url;
// 					json_acc.metre_carre = surface;
// 					json_acc.price = price;
// 					if(price && surface && surface != 0)
// 		 			{
// 		 				json_acc.price_m2 =  Math.round(price / surface);	
// 		 			}
// 		 			else{
// 		 				console.log('surface is 0, not possible to calculate');
// 		 			}
// 					json_acc.source = "Leboncoin";
// 					var crawl_time =new Date();
// 					json_acc.timestamp = crawl_time.toISOString();
// 					json_acc.title = title;
// 					json_acc.create_time = create_date;
// 					json_acc.code_postale = code_postale;
// 					json_acc.ges = ges;
// 					json_acc.energie = energie;
// 					console.log(json_acc);

				}
				});


			
}



function crawl_main_page (url){
	console.log("Visiting the main page: " + url);
	request(url, function(error, response, html) {
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
