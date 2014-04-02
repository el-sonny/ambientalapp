/**
 * ScraperController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers


************Scribd************

Your API key:
6s5n929mh512mjlel8mq8

Your API secret:
sec-54r9ombnjn8durqmqfw15syyvl

Your publisher ID:
pub-74573675084915787708
http://dsiapps.semarnat.gob.mx/gaceta/archivos2014/gaceta_14-14.pdf
http://tramites.semarnat.gob.mx/index.php/component/content/article?id=216

 */

var Scribd = require('node-scribd-client');
var extract = require('pdf-text-extract');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var Spooky = require('spooky');
require('async');
var dir = 'assets/gacetas/';
var counter = 1;

module.exports = {
	
	anios : function(req,res){
		request({
			url:'http://tramites.semarnat.gob.mx/index.php/component/content/article?id=216',
			headers :{'User-agent':'Mozilla/5.0'},
		},
		function(err, resp, body){
			if(err) throw(err);
			$ = cheerio.load(body);
			var years = [];
			$('a[href*="http://tramites.semarnat.gob.mx/index.php/component/content/article?id="]').each(function(){
				if($(this).text().trim() == 'Principio Legal') return;
				years.push({
					year : $(this).text().trim(),
					id : $(this).attr('href').replace('http://tramites.semarnat.gob.mx/index.php/component/content/article?id=',''),
				});
			});
			async.map(years,function(y,c){Year.findOrCreate(y,y,c)},function(e,r){
				if(e) throw(e);
				res.json(r);
			})
		});
	},
	gacetas : function(req,res){
		Year.find({},function(e,years){
			if(e) throw(e);
			async.mapSeries(years,scrapeGacetas,function(e,g){
				res.json(g);
			});
		});
	},
	downloadMias : function(req,res){
		Gaceta.find({},function(e,gacetas){
			if(e) throw(e);
			async.mapSeries(gacetas,function(g,c){download(g.pdf,c)},function(e,gacetas){
				res.json(gacetas);
			})
		})
	},
	mias : function(req,res){
		Gaceta.find({},function(e,gacetas){
			async.mapSeries(gacetas,scrapeMias,function(e,g){
				if(e) throw(e);
				res.json(g);
			})
		})
	},
	mia : function(req,res){
		Mia.find({clave:req.param('id')},function(e,mia){
			if(e) throw(e);
			scrapeMia(mia,function(e,m){
				if(e) throw(e);
				res.send(m);
			});
		});
	}
};
var scrapeMia = function(mia,callback){
	var spooky = new Spooky( {
	    child: {
	        transport: 'http'
	    },
	    casper: {
	        logLevel: 'debug',
	        verbose: true
	    }
	},function (err){
	    if (err) {
	    	throw(err);
	        e = new Error('Failed to initialize SpookyJS');
	        e.details = err;
	        throw e;
	    }
	   // spooky.start('http://tramites.semarnat.gob.mx/index.php/consulta-tu-tramite');
	    /*spooky.then(function () {
	        this.emit('hello', 'Hello, from ' + this.evaluate(function () {
	            return document.title;
	        }));
	    });*/
	    //spooky.run();
	});

	/*
	spooky.on('error', function (e, stack) {
	    console.error(e);
	    if (stack) {
	        console.log(stack);
	    }
	});
	// Uncomment this block to see all of the things Casper has to say.
	// There are a lot.
	// He has opinions.
	spooky.on('console', function (line) {
	    console.log(line);
	});

	spooky.on('hello', function (greeting) {
	    console.log(greeting);
	    callback(null,greeting);
	});

	spooky.on('log', function (log) {
	    if (log.space === 'remote') {
	       console.log(log.message.replace(/ \- ./, ''));
	    }
	});
	*/
	/*request({
	method: 'GET',
	url:'http://app1.semarnat.gob.mx/consultatramite/estado.php',
	headers : {
		'User-agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.154 Safari/537.36',
		'Host' : 'app1.semarnat.gob.mx',
		'Origin': 'http://app1.semarnat.gob.mx',
		'Referer' : 'http://app1.semarnat.gob.mx/consultatramite/inicio.php',
		'Cookie' : '__utma=197994925.1127164311.1396369129.1396372558.1396374869.3; __utmc=197994925; __utmz=197994925.1396369129.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)',
		'Content-Type': 'application/x-www-form-urlencoded'
	},*/
	/*qs : {
		'_idBitacora' : mia.clave
	}*/


}
var scrapeMias = function(gaceta,callback){
	var aux = gaceta.pdf.split('/');
	var filePath = dir+aux[aux.length-1];
	extract(filePath, function (err, pages) {
		if (err) {
			console.dir(err);
			return;
		}
		var pages = pages.join(" ");
		var mias = pages.match(/[\w\d]{4}20[1,0]\d[\w\d]{5}/gi);	  
	  	if(mias){
	  		async.map(mias,function(m,c){Mia.findOrCreate({clave:m},{clave:m},c)},callback);
	  	}else{
	  		console.log('fail: ',gaceta.pdf);
	  		callback();
	  	}
		console.log('gacetas procesadas: '+counter++);
	});
}
var scrapeGacetas = function(year,callback){
	request({
		url:'http://dsiapps.semarnat.gob.mx/gaceta/Gacetas/gaceta'+year.year+'.php',
		headers :{'user-agent':'Mozilla/5.0'},
	},
	function(err, resp, body){
		if(err) throw(err);
		$ = cheerio.load(body);
		var gacetas = [];
		$('a[href*="archivos'+year.year+'/gaceta_"]').each(function(){
			var file = $(this).attr('href').split('/') 
			gacetas.push({
				pdf : 'http://dsiapps.semarnat.gob.mx/gaceta/archivos'+year.year+'/'+file[file.length-1],
				periodo : $(this).parent().parent().next().text().trim(),
				publicacion : $(this).parent().parent().next().next().text().trim(),
				numero : $(this).text().trim(),
			});
		})
		async.map(gacetas,function(g,c){Gaceta.findOrCreate(g,g,c)},callback);
	});
}
var download = function(url, cb) {
	var options = {
		uri: url,
		headers: {'user-agent': 'Mozilla/5.0'},
	}
	var fname = url.split('/');
	fname = fname[fname.length -1];
	if(fs.existsSync(dir+fname)){
		console.log('exists: '+counter++);
		cb(null,fname);
	}else{
		var req = request(options).pipe(fs.createWriteStream(dir+fname)).on('finish',function(){
			//fs.close();
			console.log('downloaded :'+counter++);
			cb(null,fname);
		});
	}
}
