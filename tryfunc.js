var db = require('./db.js');
var src_roi = require('./roi.js');
var mailer = require('./mailer.js');
var extract_price = db.extract_price();



//Calcul roi, roi_colocation/

// roi(surface, price_rental, price)
// roi_colocation(piece, price_piece, price)
var roi = src_roi.roi(14, 68, 152000);
var roi_colocation = src_roi.roi_colocation(4, 440, 152000);
var mail_sender = mailer.mail_sender("Mingze hey!")
// console.log("roi:"+roi);
// console.log("roi_colocation:"+roi_colocation);