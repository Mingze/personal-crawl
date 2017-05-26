var db = require('./db.js');
var src_roi = require('./roi.js');
var mailer = require('./mailer.js');
// var extract_price = db.extract_price();
var crawlLeboncoin = require('./leboncoin.js');
var configDB = require("./config/database.js");

var leboncoin_immo = "https://www.leboncoin.fr/ventes_immobilieres/offres/ile_de_france/val_de_marne/?o=2&pe=9&sqs=7&location=Cr%E9teil%2094000";
// var leboncoin_immo = "https://www.leboncoin.fr/ventes_immobilieres/offres/ile_de_france/?o=1&location=Cr%E9teil%2094000%2CPalaiseau%2091120%2COrsay%2091400";
// var leboncoin_immo = "https://www.leboncoin.fr/ventes_immobilieres/offres/ile_de_france/paris/?o=1";



//Calcul roi, roi_colocation/

// CRAWLER: 1.url ; 2. alerte
// crawlLeboncoin.leboncoinCRAWLER(leboncoin_immo, false);


// EXTRACTION
// console.log(con)

// var critere = ["bouquet","chambre","city","description","id_announce","link","metre_carre","piece","price","price_m2","roi", "roi_coloc", "source","timestamp","title", "nature_announce", "nature_bien","city_name"];
// db.extract_database(critere, configDB.db_seloger_achat);

var delay = setInterval(run_crawl_boncoin, 900000);

function run_crawl_boncoin(){
	db.get_id_announce(configDB.db_leboncoin_achat, function(list_announce){
		console.log(list_announce);
		crawlLeboncoin.leboncoinCRAWLER(leboncoin_immo, list_announce, true, function(resCode){
			if(resCode == 1){
				console.log("crawler continue");
			}
			else if(resCode == 0){
				console.log("Crawler finished");
			}
			else if(resCode == -1){
				console.log("Already crawled, No more to crawl");
			}
		});

	});
}

var critere_boncoin = ["Source", "Annonce_created", "Time_crawled","city_name","postcode","type de bien","ges", "classe energie","link", "id_announce","Title","pieces","surface", "prix", "price_m2", "Agence","roi","roi_colocation","Description"];
// db.extract_database(critere_boncoin, configDB.db_leboncoin_achat);
// db.extract_database(configDB.db_leboncoin_achat);

// roi(surface, price_rental, price)
// roi_colocation(piece, price_piece, price)
// var roi = src_roi.roi(14, 68, 152000);
// var roi_colocation = src_roi.roi_colocation(4, 440, 152000);
// var mail_sender = mailer.mail_sender("Mingze hey!")
// console.log(db.db_leboncoin_achat);
// console.log("roi_colocation:"+roi_colocation);