var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var iconv  = require('iconv-lite');
var accent = require('./src/accentsTidy.js');
var src_roi = require('./roi.js');
var mailer = require('./mailer.js');
var fs = require('fs');
var db = require('./db.js');
var check_price = require('./check_price.js');
var configDB = require("./config/database.js");


function getSelogerPage(url, callback){
    var headers = {             
            'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
            'Content-Type' : 'application/x-www-form-urlencoded' 
        };
    var form = { username: 'Philippe Courlier', password: '', opaque: '1.11', logintype: '1'};
    var page = 0;
    
    request({url: url, headers: headers, form:form}, function(error, res_code, html){
        if(!error){
            var $ = cheerio.load(html);
            // console.log(html);
            $('.wrapperMe').filter(function(){
                page = -1;
            });
            
            $('.pagination_result_number').filter(function(){  
                var data = $(this);
                page = parseInt(data.text().match(/\/ \d+/)[0].split('/')[1]);
            });
        }
        callback(parseInt(page));
    });
}


function test_local(list_announce, callback){
    // console.log(list_announce);
    var resultat = [];
    fs.readFile(__dirname + '/download/seloger.html', 'utf8', function(err, html){

        if(err){
            console.log(err);
        }
        else{
              // console.log(html);
            var $ = cheerio.load(html);
            $('.cartouche.life_annuity').filter(function(){
                var data = $(this);
                var title= data.find('.listing_photo').attr('alt');
                var param=data.find('.property_list').text();
                var price=parseInt(data.find($('.price')).text().replace("Bouquet","").replace(/\s/g,'').trim());
                var link= data.children().first().children().first().next().children().first().children().first().attr('href');
                var city_name = data.find('.locality').text().trim();
                city_name = accent.accentsTidy(city_name);
                //get id
                var re =/\/(\d+).htm/i;
                var id_loge = link.match(re)[1];
                
                check_price.check_id_loge(id_loge, price, list_announce);

                var re = /(\d+) p/i;
                var piece = param.match(re);

                var re = /(\d+) chb/i;
                var chambre = param.match(re);

                var re = /(\d*\,*\d+) m²/i;
                var surface = param.match(re);

                if(piece && piece[0]){
                    piece = parseInt(piece[0]);
                    
                    // console.log("Piece:"+piece);
                }
                else{
                    console.log("Not found piece"); 
                    piece = null;
                }

                if(chambre && chambre[0]){
                    chambre = parseInt(chambre[0]);
                    // console.log("Chambre:"+chambre);
                    
                }
                else{
                    chambre  = null
                    console.log("Not found chambre"); 
                }

                if(surface && surface[0]){
                    surface = parseInt(accent.accentsTidy(surface[0]));
                    price_m2 = Math.round(price / surface)
                    var roi = src_roi.roi(surface, 33, price);
                    var roi_colocation = src_roi.roi_colocation(piece, 500, price);
                }
                else{
                    price_m2 = null;
                    metre_carre = null;
                }
                
                //parse title
                var re =/(\w*) (\w+[\s\/\s]*\w+) (\d+) ([a-zA-Zè]+) ([\wa-zA-Z_éèêëàâîïôöûü-]+)/i;
                var nature_announce = accent.accentsTidy(title.match(re)[1]);
                var nature_bien = accent.accentsTidy(title.match(re)[2]);
                var date = new Date();
                date = date.toISOString();
                
                //storage
                // ["Source", "Annonce_created", "Time_crawled","city_name","postcode","type de bien","ges", "classe energie","link", "id_announce","Title","pieces","surface", "prix", "price_m2", "Agence","roi","roi_colocation","Description"];
                var json_temp = {Source:"seloger" ,"Annonce_created":null, "Time_crawled": date,"city_name": city_name, "link": link, "postcode": null, "Type": nature_bien, "id_announce": id_loge, "Title": title, "pieces": piece, "surface": surface, "price": price, "price_m2":price_m2, "roi": roi, "roi_colocation": roi_colocation};
                // console.log(json_temp);
                resultat.push(json_temp);
                // callback(json_temp);
            });
        };
        callback(resultat);
    });

}



function crawlMainpage(url, list_announce, alerte, callback){
    // console.log(url);

    var headers = {   
            'User-Agent': 'AdsBot-Google (+http://www.google.com/adsbot.html)',
            'Content-Type' : 'application/x-www-form-urlencoded' 
        };
    request({url: url, headers: headers}, function(error, res_code, html){
        if(!error){
            
            // console.log(html);
            var $ = cheerio.load(html);
            $('.cartouche.life_annuity').filter(function(){
                var data = $(this);
                var title= data.find('.listing_photo').attr('alt');
                var param=data.find('.property_list').text();
                var price=parseInt(data.find($('.price')).text().replace("Bouquet","").replace(/\s/g,'').trim());
                var link= data.children().first().children().first().next().children().first().children().first().attr('href');
                var city_name = data.find('.locality').text().trim();
                city_name = accent.accentsTidy(city_name);
                //get id
                var re =/\/(\d+).htm/i;
                var id_loge = link.match(re)[1];
                
                var re = /(\d+) p/i;
                var piece = param.match(re);

                var re = /(\d+) chb/i;
                var chambre = param.match(re);

                var re = /(\d*\,*\d+) m²/i;
                var surface = param.match(re);

                if(piece && piece[0]){
                    piece = parseInt(piece[0]);
                    
                    // console.log("Piece:"+piece);
                }
                else{
                    console.log("Not found piece"); 
                    piece = null;
                }

                if(chambre && chambre[0]){
                    chambre = parseInt(chambre[0]);
                    // console.log("Chambre:"+chambre);
                    
                }
                else{
                    chambre  = null
                    console.log("Not found chambre"); 
                }

                if(surface && surface[0]){
                    surface = parseInt(accent.accentsTidy(surface[0]));
                    price_m2 = Math.round(price / surface)
                    var roi = src_roi.roi(surface, 33, price);
                    var roi_colocation = src_roi.roi_colocation(piece, 500, price);
                }
                else{
                    price_m2 = null;
                    metre_carre = null;
                }
                
                //parse title
                var re =/(\w*) (\w+[\s\/\s]*\w+) (\d+) ([a-zA-Zè]+) ([\wa-zA-Z_éèêëàâîïôöûü-]+)/i;
                var nature_announce = accent.accentsTidy(title.match(re)[1]);
                var nature_bien = accent.accentsTidy(title.match(re)[2]);
                var date = new Date();
                date = date.toISOString();
                
                //storage
                // ["Source", "Annonce_created", "Time_crawled","city_name","postcode","type de bien","ges", "classe energie","link", "id_announce","Title","pieces","surface", "prix", "price_m2", "Agence","roi","roi_colocation","Description"];
                var json_temp = {Source:"seloger" ,"Annonce_created":null, "Time_crawled": date,"city_name": city_name, "postcode": null, "Type": nature_bien, "id_announce": id_loge, "Title": title, "pieces": piece, "surface": surface, "prix": price, "price_m2":price_m2, "roi": roi, "roi_colocation": roi_colocation};
                console.log(json_temp);
                callback(json_temp);
            });
        }
    });
}

var url = "http://www.seloger.com/list.htm?tri=initial&idtypebien=2,1&idtt=2&ci=940028&LISTING-LISTpg=2&naturebien=1,2,4";
// crawlMainpage(url, 1, 2, 3);
function coucou(url, city, database,  callback){
  
    
        // console.log("Status code: " + res_code.statusCode);
        var data = "";
        if(!error){
            
            // console.log(html);
            var title, release, rating, link=[], metre_carre =[], json =  [] ,loge_crawled = 0, loge_new_crawl = 0;
            
            $('.cartouche.life_annuity').filter(function(){
                var data = $(this);
                var title= data.find('.listing_photo').attr('alt');

                param=data.find('.property_list').text();
                description=data.find($('.description')).text().replace(/\s/g," ").trim();
                price=data.find($('.price')).text();
                link= data.children().first().children().first().next().children().first().children().first().attr('href');
                // console.log(param + "\n"+ description + "\n"+price+"\n"+title+"\n"+link);
                
                var json_temp = { bouquet: false,  chambre : "", city: city, city_name: "", description:"", id_announce :"", link:"",  metre_carre : "", piece : "", price:"",  price_m2 : "", source : "seloger", timestamp:"", title: ""};
                
                

                json_temp.id_announce = id_loge;
                
                var bouquet = false;
               
                json_temp.title = title;
                console.log(title);
                //parse title
                var re = /(\d+) ([a-zA-Zè]+) ([\wa-zA-Zéèêëàâîïôöûü-]+)/i;
               

                try{
                var city_title = title.match(re)[3];
                json_temp.city_name = city_title;

                var re = /^(\w+) (\w+)/i;
                
                var nature_announce = title.match(re)[1];
                var nature_bien = title.match(re)[2];
                json_temp.nature_announce = nature_announce;
                json_temp.nature_bien = nature_bien;


                }
                catch(e){
                    console.log("city-title not exist");
                    json_temp.city_name = "";
                }
             
                json_temp.link = link;
                // console.log(price.indexOf("Bouquet"));
                if(price.indexOf("Bouquet") != -1 ) 
                {
                    json_temp.bouquet = true;
                    bouquet = true;
                }
                    // console.log(price.replace("Bouquet","").trim());
                var new_price = parseInt(price.replace("Bouquet","").replace(/\s/g,'').trim());
                json_temp.price = new_price;
                json_temp.description = description;
                console.log(param);
                var re = /(\d+) p/i;
                var piece = param.match(re);

                var re = /(\d+) chb/i;
                var chambre = param.match(re);

                var re = /(\d*\,*\d+) m²/i;
                var metre = param.match(re);
                // console.log(metre)

                if(piece && piece[0] ){
                    
                    piece = parseInt(piece[0]);
                    json_temp.piece = piece;
                    console.log("Piece:"+piece);
                }
                else{
                    console.log("Not found piece"); 
                    json_temp.piece = 0;
                }

                if(chambre && chambre[0]){
                    chambre = parseInt(chambre[0]);
                     console.log("Chambre:"+chambre);
                    json_temp.chambre = chambre
                }
                else{
                    json_temp.chambre = 0; 
                    console.log("Not found chambre"); 
                }

                if(metre && metre[0]){
                    metre_carre = parseInt(metre[0].replace(',','.'))
                    console.log("metre_carre"+ metre_carre);
                    json_temp.metre_carre = metre_carre;
                    // console.log(new_price / parseInt(metre[0]))
                    price_m2 = Math.round(new_price / parseInt(metre[0]))
                    // price_location = city_title
                    var roi = Math.round( price_location * metre_carre * 12 / new_price * 10000) /100
                    var roi_colocation = Math.round( 500 * piece * 12 / new_price * 10000) /100
                    json_temp.price_m2 = price_m2;
                    json_temp.roi = roi;
                    json_temp.roi_coloc = roi_colocation;
                    console.log("Price Metre carre:"+price_m2);
                }
                else{
                    price_m2 = new_price;
                    metre_carre = 0;
                    json_temp.metre_carre = 0;
                    json_temp.price_m2 = 0;
                    // console.log("Not found metre carre"); 
                }
                var time  = new Date();
                json_temp.timestamp = time.toISOString();

                if(list_id_announce.indexOf(id_loge) == -1 )
                {
                    //Logement not yet crawled
                    loge_new_crawl +=1;
                    json.push(json_temp) 
                    list_id_announce.push(id_loge)   
                }
                else{
                    //logement bougé 
                    loge_crawled += 1;
                }               
            });   
        // write in database
            if (json.length > 0){
                // console.log("New logement found!!" + json + " "+json !=[])
                var date = new Date();
                date = date.toISOString();
                var insert_db = {city: city, timestamp:time.toISOString(), type:"vente", result:""};
                insert_db.result = json;
            
                database.insert(insert_db, function(err, body, header) {
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
            else
            {
                console.log("Already enregistred:"+loge_crawled+", won't be added into database");
                callback(json);
            }       
        }
        else
        {
            console.log('Oops, some problems heres');
        }
        
    
}

function seloger_crawler(url){
    //récupérer les pages possibles à crawler
    getSelogerPage(url, function(page){
        if(page != -1)
        {
            console.log("Page to crawl:"+page+", wait!");
            var time = new Date();
            time = time.toISOString();                    
            // var myVar = setInterval(count, 10000);
            var counter = 1;        

            function count(){
                 coucou(url+'&LISTING-LISTpg='+counter, ville, database, function(data){
                    if(typeof(data) != 'number' && counter < 1000  && counter < page +1)
                    {
                        // console.log("Page Number:"+counter);                              
                        //if callback json == [], stop crawling
                        if (data.length == 0)
                        {
                            console.log("NO More for this page "+counter+",crawler continue")
                            // clearInterval(myVar);
                            counter += 1;
                        }
                        else{
                            counter += 1;
                            console.log("Get "+data.length +" new logement!");
                        }     
                    }
                    else  
                    {
                        console.log("Crawler stopped")
                        clearInterval(myVar);
                    }  
                });

            }
        }
        else{
            console.log("Oops je ne peux plus crawler...Page d'erreur")
        }
    });
}


module.exports.seloger_crawler = seloger_crawler;
module.exports.test_local = test_local;
