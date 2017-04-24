require('dotenv').load();

module.exports = {
	'username' : process.env.SENDER_USERNAME || '',
	'password' : process.env.SENDER_PASSWORD || '',
	'sender' : process.env.SENDER || '',
	'receivers' : process.env.RECEIVER_EMAIL || '',
	'subject' : process.env.EMAIL_SUBJECT || ''
}


