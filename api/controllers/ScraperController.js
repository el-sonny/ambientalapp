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

test mia 23QR2013MD095

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
var counter2 = 1;

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
	downloadGacetas : function(req,res){
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
		/*scrapeMia(req.param('id'),function(e,m){
			if(e) throw(e);
			//console.log(m);
			res.json(m);
		})*/
		Mia.find({},function(e,mias){
			if(e) throw(e);
			async.mapLimit(mias,1,scrapeMia,function(e,m){
				if(e) throw(e);
				res.json(m);
			});
		});
	}
};
var scrapeMia = function(mia,callback){
//	console.log(mia.proyecto);
	if(!mia.proyecto){
		var spooky = new Spooky({
		    child: {transport: 'http'},
		    casper: {
		        logLevel: 'debug',
		        verbose: true,
		    }
		}, function (err) {
		    if (err) {
		        e = new Error('Failed to initialize SpookyJS');
		        e.details = err;
		        throw e;
		    }	
		    spooky.start('http://app1.semarnat.gob.mx/consultatramite/inicio.php');
		    spooky.then([{
		    	mia : mia.clave
		    },function (){
		    	this.evaluate(function(_mia) {
				    document.querySelector('input[name="_idBitacora"]').value = _mia;
				    document.querySelector('input[name="listadoarea2_r12_c8"]').click();
				}, mia);
		    }]);
		    spooky.then([{
		    	mia : mia
		    },function(){
		    //	console.log('loaded  search');
		        this.emit('loaded_mia', this.evaluate(function (){
		            return document.documentElement.outerHTML;
		        }),mia);
		    }]);
		    spooky.run();
		});
		spooky.on('error', function (e, stack) {
		    console.error(e);
		    if(stack) console.log(stack);
		});
		//spooky.on('console', function (line){console.log(line);});
		spooky.on('loaded_mia',function (body,mia){
			console.log('prossesing: 	'+mia.clave);
		    $ = cheerio.load(body);
		    var textos = [];
		   	$('.texto_espacio').each(function(){
		   		textos.push($(this).text());
		   	})
		   	if(textos.length){
			    var general = $('.texto_espacio').eq(0).children().html().split('<br>');
		    	var resumen = $('a[href*="wResumenes"]');
		    	var estudio = $('a[href*="wEstudios"]');
		    	var resolutivo = $('a[href*="wResolutivos"]');
			    var mia = {
			    	estado : $(".tit_menu").text().replace('Num. ','').trim(),
			    	tramite : general[1].trim(),
			    	proyecto : general[3].replace('Proyecto: ',''),
			    	clave : general[5].replace('Num. Proyecto: ','').trim(),
			    	entidad : $('.texto_espacio').eq(2).text().trim(),
			    	fecha_de_ingreso : $('.texto_espacio').eq(3).text().trim(),
			    	situacion_actual : $('textarea.texto_espacio').val().trim(),
			    	resumen : resumen.length ? resumen.attr('href').replace("javascript:abrirPDF('",'').replace("','wResumenes')",'') : false,
			    	estudio : estudio.length ? estudio.attr('href').replace("javascript:abrirPDF('",'').replace("','wEstudios')",'') : false,
			    	resolutivo : resolutivo.length ? resolutivo.attr('href').replace("javascript:abrirPDF('",'').replace("','wResolutivos')",'') : false,
			    }
			    console.log('proccesed	'+mia.clave+'	'+counter++);
			    Mia.update({clave:mia.clave},mia,callback);
			}else{
				console.log('orphaned	'+mia.clave+'	'+counter2++);
				Mia.update({clave:mia.clave},{clave:mia.clave,orphaned:true},callback);
			}
		});
	}else{
		console.log('found	'+mia.clave+'	'+counter++);
	}
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
