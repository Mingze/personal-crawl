require('dotenv').load();

module.exports = {
	'username' : process.env.DB_USERNAME || '',
	'password' : process.env.DB_PASSWORD || '',
	'db_seloger_achat' : process.env.DB_SELOGER_ACHAT || '',
	'db_seloger_location' : process.env.DB_SELOGER_LOCATION || '',
	'db_leboncoin_achat' : process.env.DB_LEBONCOIN_ACHAT || '',
	'db_leboncoin_location' : process.env.DB_LEBONCOIN_LOCATION || '',
	'db_pap_achat' : process.env.DB_PAP_ACHAT || '',
	'db_pap_location' : process.env.DB_PAP_LOCATION || '',
	'db_price' : process.env.DB_PRICE || ''
}

