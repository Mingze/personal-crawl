var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var iconv  = require('iconv-lite');
var scraper = require('learn');

var no_pro = "https://www.leboncoin.fr/ventes_immobilieres/1117221663.htm?ca=12_s";
// var url = 'https://www.leboncoin.fr/ventes_immobilieres/1107597239.htm?ca=12_s';

var headers = {   
            'User-Agent': 'AdsBot-Google (+http://www.google.com/adsbot.html)',
            'Content-Type' : 'application/x-www-form-urlencoded' 
    };
var requestOptions  = { encoding: null, url: no_pro, headers: headers }; 

request(requestOptions, function(error1, response1, html1){
  var html1 = iconv.decode(html1, 'iso-8859-1');  
  if(error1) {
      console.log("Error: " + error1);
    }
    else{
      var $ = cheerio.load(html1);
      console.log($)
      var filter_ispro = $('.ispro').text().trim();

      console.log(filter_ispro);
           
    }
    
});


scraper.imgScrape2(url)
  .then((data)) => {
    console.log('data from scraper received ')
    fs.writeFile(path, JSON.stringify(data), (error) => {
      if(error){
        console.log(error);
      }
      console.log('Successfully wrote to '+path);
    }
  }
  .catch((error) => {
    console.log("error scrapping data");
  })