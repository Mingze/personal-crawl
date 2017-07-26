var request = require('request');
var cheerio = require('cheerio');

request('https://stackoverflow.com/questions/tagged/github', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
    console.log(html);
  }
});