var fs = require('fs');
var express = require('express');
var request = require('request');

var destination = fs.createWriteStream('./download/google.html');
var url = "http://google.com";


//Method to download a webpage
request(url)
	.pipe(destination)
destination.on('error', function(err){
		console.log(err);
	})
destination.on('finish',function(){
	console.log('done');
	});


//About Promise
exports.imgScrape2 = (url) => {
	return new Promise((resolve, reject) => {
		request(url, (error, resp, body) => {
			if(error){
				reject(error);
			}
		}
		let $ = cheerio.load(body);
		let $url = url;
		console.log('scraped from scraper.js', $url);
		resolve($url);
		})
	})
}
