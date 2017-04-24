

function roi(surface, price_rental, price) {
  return Math.round(price_rental * surface * 12 / price * 10000) /100 ;
}

function roi_colocation(piece, price_piece, price) {
  return Math.round(price_piece * piece * 12 / price * 10000) /100;
}

module.exports.roi = roi;
module.exports.roi_colocation = roi_colocation;
