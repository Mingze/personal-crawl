'use strict';
const nodemailer = require('nodemailer');
const Email_config = require("./config/mailer_config.js");

console.log(Email_config);
var username = Email_config.username,
 password = Email_config.password,
 receivers = Email_config.receivers,
 sender = Email_config.sender,
 subject = Email_config.subject


// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: username,
        pass: password
    }
});



function mail_sender(message){
    // setup email data with unicode symbols
    let mailOptions = {
        from: sender, // sender address
        to: receivers, // list of receivers
        subject: subject, // Subject line
        text: message, // plain text body
        html: message // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });   
}

module.exports.mail_sender = mail_sender;