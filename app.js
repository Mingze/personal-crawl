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

//Paris 1-20, sceaux = 920071, creteil = 940028, Paris = 75, Palaiseau = 910477, la défense =929001, courbe voie = 920026, puteaux = 920062
var cities = [75, 78, 92, 940028, 920026,929001, 920062, 920026,  75, 940028, 75, 940028, 75, 92, 91, 94, 75, 92, 940028, 940028, 75,910477, 940028, 920071, 940016, 920071]
var location=1;
var achat=2;
var price_location=33;
var resultat = [];


// database cloudant
var username = "8b74f433-f92c-49f3-b2c7-09ecb18e4a7f-bluemix";
var password = "017d568e4f43f74e8bea82c54ccb800d696a6573bc2af17aa6584bea380ee1aa";
var cloudant = Cloudant({account:username, password:password});

var dbAchat = cloudant.db.use('vente_collect');
var dbLocation = cloudant.db.use('location');
var list_id_announce = [];
var ville = cities[0];
var achat_url = 'http://www.seloger.com/list.htm?idtt='+achat+'&idtypebien=2,1&cp='+ville+'&tri=d_dt_crea';
var location_url = 'http://www.seloger.com/list.htm?&idtt=1&idtypebien=2,1&cp='+ville+'&tri=d_dt_crea';
var parking = "idtypebien=3";
var achat_parking_11 = 'http://www.seloger.com/list.htm?&idtt='+achat+'&'+parking+'&ci='+ville+'&tri=d_dt_crea';
var url = 'http://www.seloger.com/list.htm?idtt=2&idtypebien=2,1&cp=75&tri=d_dt_crea&naturebien=1,2,4';

/*User agent*/
var userAgent = ["Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; SV1; Acoo Browser; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; Avant Browser)",
"Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; Acoo Browser; SLCC1; .NET CLR 2.0.50727; Media Center PC 5.0; .NET CLR 3.0.04506)",
"Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; Acoo Browser; GTB5; Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1) ; Maxthon; InfoPath.1; .NET CLR 3.5.30729; .NET CLR 3.0.30618)",
"Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; Acoo Browser; GTB5;",
"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
"Googlebot/2.1 (+http://www.googlebot.com/bot.html)",
"Googlebot/2.1 (+http://www.google.com/bot.html)",
"Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0",
"Mozilla/5.0 (Windows NT 6.2; rv:22.0) Gecko/20130405 Firefox/22.0",
"Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:22.0) Gecko/20130328 Firefox/22.0",
"Mozilla/5.0 (Windows NT 6.1; rv:22.0) Gecko/20130405 Firefox/22.0",
"Mozilla/5.0 (Microsoft Windows NT 6.2.9200.0); rv:22.0) Gecko/20130405 Firefox/22.0"]

function new_test(){
    var headers = {   
            'User-Agent': 'AdsBot-Google (+http://www.google.com/adsbot.html)',
            'Content-Type' : 'application/x-www-form-urlencoded' 
        };
    // var form = { username: 'Dong Antoine', password: '', opaque: 'someValue', logintype: '1'};

    request({url: url, headers: headers}, function(error, res_code, html){
        var data = "";
        if(!error){
            var $ = cheerio.load(html);
            // console.log(html);
            var title, release, rating, link=[], metre_carre =[], json =  [] ,loge_crawled = 0, loge_new_crawl = 0;
            
            $('.listing.life_annuity').filter(function(){
                var data = $(this);
                var title= data.children().first().children().first().next().children().first().children().first().attr('title');
                param=data.find($('.property_list')).text();
                description=data.find($('.description')).text();
                price=data.find($('.amount')).text();
                link= data.children().first().children().first().next().children().first().children().first().attr('href');
                console.log(param + "\n"+ description + "\n"+price+"\n"+title+"\n"+link);
                // console.log(data.attr('data-listing-id'));
                // console.log("annuity identified");
                // var title= data.children().first().children().first().next().children().first().children().first().attr('title');
                // var listing_infos= data.children().first().children().first().next();
                // var param= data.children().first().children().first().children().first().children().last().text();
                // console.log(title);

                // //si c'est pas mode GOLD
                // if(param == "")
                // {
                //     param=data.find($('.property_list')).text();
                //     console.log(param)
                // }
                // else{
                //     //si c'eset GOLD
                //     console.log(param);    
                // }
                
                
            });
             // $('.listing.life_annuity').filter(function(){
             //      var data = $(this);
             //      var param = data.prev();
             //      console.log(param);  
             // });
            // $('.listing.life_annuity.gold').filter(function(){  
            //     var data = $(this);
            //     console.log(data.attr('data-listing-id'));
            //     var title= data.children().first().children().first().next().children().first().children().first().attr('title');
            //     var param= data.children().first().children().first().children().first().children().last().text();
            //     console.log("GOLD");
            //     console.log(title);
            //     console.log(param);
            // });
        }
    });
}

function coucou(url, city,database,  callback){
    console.log(url);
    var headers = {   
            'User-Agent': 'AdsBot-Google (+http://www.google.com/adsbot.html)',
            'Content-Type' : 'application/x-www-form-urlencoded' 
        };
    // var form = { username: 'Dong Antoine', password: '', opaque: 'someValue', logintype: '1'};

    request({url: url, headers: headers}, function(error, res_code, html){
        console.log("Status code: " + res_code.statusCode);
        var data = "";
        if(!error){
            var $ = cheerio.load(html);
            // console.log(html);
            var title, release, rating, link=[], metre_carre =[], json =  [] ,loge_crawled = 0, loge_new_crawl = 0;
             $('.wrapperMe').filter(function(){
                console.log("je me suis choppé!!!");
                callback(-1);
            });
            $('.listing.life_annuity').filter(function(){
                var data = $(this);
                var title= data.children().first().children().first().next().children().first().children().first().attr('title');
                param=data.find($('.property_list')).text();
                description=data.find($('.description')).text().replace(/\s/g," ").trim();
                price=data.find($('.amount')).text();
                link= data.children().first().children().first().next().children().first().children().first().attr('href');
                // console.log(param + "\n"+ description + "\n"+price+"\n"+title+"\n"+link);
                
                var json_acc = { bouquet: false,  chambre : "", city: city, description:"", id_announce :"", link:"",  metre_carre : "", piece : "", price:"",  price_m2 : "", source : "seloger", timestamp:"", title: ""};
                // Let's store the data we filter into a variable so we can easily see what's going on.
                // In examining the DOM we notice that the title rests within the first child element of the header tag. 
                // Utilizing jQuery we can easily navigate and get the text by writing the following code:
                
                var re =/\/(\d+).htm/i;
                var id_loge = link.match(re)[1];

                json_acc.id_announce = id_loge;
                
                var bouquet = false;
               
                json_acc.title = title;
                json_acc.link = link;
                // console.log(price.indexOf("Bouquet"));
                if(price.indexOf("Bouquet") != -1 ) 
                {
                    json_acc.bouquet = true;
                    bouquet = true;
                }
                    // console.log(price.replace("Bouquet","").trim());
                var new_price = parseInt(price.replace("Bouquet","").replace(/\s/g,'').trim());
                json_acc.price = new_price;
                json_acc.description = description;
                console.log(param);
                var re = /(\d+) p/i;
                var piece = param.match(re);

                var re = /(\d+) chb/i;
                var chambre = param.match(re);

                var re = /(\d*\,*\d+) m²/i;
                var metre = param.match(re);
                // console.log(metre)

                if(piece && piece[0] ){
                    console.log("piece:"+piece);
                    piece = parseInt(piece[0]);
                    json_acc.piece = piece;
                }
                else{
                    console.log("Not found piece"); 
                    json_acc.piece = 0;
                }

                if(chambre && chambre[0]){
                    chambre = parseInt(chambre[0]);
                     console.log("Chambre:"+chambre);
                    json_acc.chambre = chambre
                }
                else{
                    json_acc.chambre = 0; 
                console.log("Not found chambre"); 
                }

                if(metre && metre[0]){
                    metre_carre = parseInt(metre[0].replace(',','.'))
                    json_acc.metre_carre = metre_carre;
                    // console.log(new_price / parseInt(metre[0]))
                    price_m2 = Math.round(new_price / parseInt(metre[0]))
                    var roi = Math.round( price_location * metre_carre * 12 / new_price * 10000) /100

                    json_acc.price_m2 = price_m2;
                    json_acc.roi = roi;
                    console.log("Metre carre:"+price_m2);
                }
                else{
                    price_m2 = new_price;
                    metre_carre = 0;
                    json_acc.metre_carre = 0;
                    json_acc.price_m2 = 0;
                    // console.log("Not found metre carre"); 
                }
                var time  = new Date();
                json_acc.timestamp = time.toISOString();

                if(list_id_announce.indexOf(id_loge) == -1 )
                {
                    //Logement not yet crawled
                    loge_new_crawl +=1;
                    json.push(json_acc) 
                    list_id_announce.push(id_loge)   
                }
                else{
                    //logement bougé 
                    loge_crawled += 1;
                }               
            });   
        // write in database
            if (json.length > 0){
                console.log("New logement found!!" + json + " "+json !=[])
                var time = new Date();
                var insert_db = {city: city, timestamp:time.toISOString(), type:"vente", result:""};
                insert_db.result = json;
            
                database.insert(insert_db, function(err, body, header) {
                    if (err) {
                        return console.log('[dbAchatinsert] ', err.message);
                    }
                    else{ 
                    console.log("sucessful write in DB")
                    console.log("New crawled:"+loge_new_crawl+",added into database");
                    console.log("Already enregistred:"+loge_crawled+", won't be added into database");
                    callback(json);
                    }
                });
                
            }
            else
            {
                console.log("Already enregistred:"+loge_crawled+", won't be added into database");
                console.log("No new logement!")
                callback(json);
            }       
        }
        else
        {
            console.log('Oops, some problems heres');
        }
        
    });
}

function get_page_crawl(url, callback){
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
                
                // console.log(page);
            });
        }
        callback(parseInt(page));
    });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// new_test();

extract_database(dbAchat, achat_url);
// extract_database(dbLocation, location_url);

function extract_database(database, url){
    //parser database to get all id_announce
    database.find({selector:{}}, function(er, result) {
        if (er) {
            throw er;
        }

        console.log('Found %d documents', result.docs.length);
        for (var i = 0; i < result.docs.length; i++) {
            console.log('  Doc id: %s', result.docs[i]._id);
            if(result.docs[i].result){
                for (var j = 0; j < result.docs[i].result.length; j++){
                    // console.log('  Doc result: %s', result.docs[i].result[j].id_announce);
                    list_id_announce.push(result.docs[i].result[j].id_announce);
                }
            }
        }

        //récupérer les pages possibles à crawler
        get_page_crawl(url, function(page){
            if(page != -1)
            {
                console.log("Page to crawl:"+page+", wait!");
                var time = new Date();
                time = time.toISOString();
                // console.log(list_id_announce);
                
                var myVar = setInterval(count, 10000);
                var counter = 1;        

                function count(){
                     coucou(url+'&LISTING-LISTpg='+counter, ville, database, function(data){
                        if(typeof(data) != 'number' && counter < 1000)
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
    });
}


function archive (data){
    fs.writeFile(__dirname+'/vente'+ville+'.txt', data, (err) => {
      if (err) throw err;
      console.log('It\'s saved!');
    });    
}

app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
    