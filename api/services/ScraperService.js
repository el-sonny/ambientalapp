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
	//Cambia las fechas del formato mm/dd/aa a UTC?
	fixDate : function(){
		Mia.find({}).exec(function(e,mias){
			async.mapLimit(mias,20,function(mia,callback){
				if(mia.fecha_de_ingreso){
					if(typeof(mia.fecha_de_ingreso) == 'string'){
						var date = mia.fecha_de_ingreso.split("/");
						if(date.length == 3){
							date = date[2]+'-'+date[1]+'-'+date[0];
							mia.fecha_de_ingreso = new Date(date);
							console.log(timestamp()+' fixing : '+mia.clave+'	'+counter++);
							return mia.save(callback);
						}
					}
				}
				console.log(timestamp()+' correct : '+mia.clave+'	'+counter2++);
				return setImmediate(function(){callback(null,mia);});
			},function(e,mias){
				if(e) throw(e);
				console.log("done: ",mias.length);
			});
		});
	},
	//Guarda los estatus en una tabla relacional aparte
	extractStatus : function(){
		Mia.find({situacion_actual:{'>':''}}).exec(function(e,mias){
			if(e) throw(e);
			console.log('Mias with status: '+mias.length);
			var statuses = [];
			async.mapSeries(mias,processStatus,function(e,statuses){
				console.log('Statuses maped: '+statuses.length);
			});
		});
	},
	//Extrae los archivos para convertirlos en objeto
	fixFiles : function(){
		Mia.find({}).exec(function(e,mias){
			console.log('found ',mias.length);
			async.mapSeries(mias,updateFileStruct,function(e,mias){
				console.log('updated '+mias.length);
				counter = 0;
			})

		});
	},
	//Procesa los archivos de un MIA
	processFiles : function(clave,callback){
		Mia.findOne({clave:clave}).exec(function(e,mia){
			async.mapSeries(['resumen','estudio'],function(type,cb){processFile(mia,type,cb)},callback);
		});
	}

}
var processFile = function(mia,filetype,cb){
	//&& !mia[filetype].processed
	if(mia[filetype].url && !mia[filetype].file){
		downloadProjectFile(mia,filetype,function(e,file){
			extractPDF(mia,filetype,cb);
		});
	}else{
		extractPDF(mia,filetype,cb);
	}/*else{
		cb(null,mia);
	}*/
}
function extractPDF(mia,filetype,callback){
	if(mia[filetype].file){
		mia[filetype].processed = 1;
		mia.save(function(e,mia){Mia.publishUpdate(mia.id,mia);});
		var filename = mia[filetype].file;
		var extract = require('pdf-text-extract');
		extract(filename, function (err, pages) {
			if (err) {
				console.dir(err);
				callback(err);
			}

			var page_lengths = [];
			pages.forEach(function(page){
				page_lengths.push(page.length);
			});
			var doc = pages.join(" ");
			var spaces = [];
			var patterns = [ 
				{
					regex : /\d{6,7}\.?\d{0,8}/igm,
					format : 'utm'
				}
			];
			patterns.forEach(function(pattern){
				var last_match = 0;
				var matches = [];
				var points = [];
				var match = {};
				while(result = pattern.regex.exec(doc)){
					var distance = result.index - last_match;
					last_match = result.index;
					if(distance > 300 && matches.length){
						if(matches.length > 1) spaces.push({points:points,format:pattern.format});
						matches = [];
						points = [];
					}
					var match = {
						start : result.index,
						end : result[0].length + result.index,
						content : result[0],
						format : pattern.format,
					};

					//Its a y value
					if(matches.length % 2){
						point.y = result[0];
						point.reference.y = match;
						points.push(point);
					//ITS x
					}else{
						var point = {x:result[0],format:pattern.format,reference:{x:match}};						
					}
					matches.push(match);
					
				}
				spaces.push({points:points,format:pattern.format});
			});
			mia[filetype].spaces = spaces;
			mia[filetype].processed = 2;
			mia[filetype].page_lengths = page_lengths;
			mia[filetype].text = doc;
			mia.save(function(e,mia){
				Mia.publishUpdate(mia.id,mia);
				callback(e,mia);
			});
		});
		callback(true);
	}
}
var downloadProjectFile = function(mia,filetype,callback){
	if(mia[filetype].url){
		var file = {
			dir : 'assets/mias/'+filetype+'/',
			url : mia[filetype].url,
		}
		mia[filetype].file = 'downloading';
		mia.save(function(e,mia){Mia.publishUpdate(mia.id,mia);});
		downloadWget(file,function(e,file){
			if(file){
				mia[filetype].file = file;
				mia.save(function(e,mia){
					Mia.publishUpdate(mia.id,mia);
					callback(e,file);
				});
			}else{
				callback(e,file);
			}
		});
	}else{
		callback(null,null);
	}
}
var updateFileStruct = function(mia,cb){
	mia.resumen = mia.resumen ? {url:mia.resumen} : {};
	mia.estudio = mia.estudio ? {url:mia.estudio} : {};
	mia.resolutivo = mia.resolutivo ? {url:mia.resolutivo} : {};
	console.log(timestamp()+'updating: '+mia.clave+"	"+counter++);
	mia.save(cb);				
}
var timestamp = function(){
	var newDate = new Date();
	newDate.setTime(Date.now()*1000);
	return '[' +newDate.toUTCString()+ '] ';
}
var processStatus = function(mia,callback){
	Status.findOrCreate({desc:mia.situacion_actual},{desc:mia.situacion_actual},function(e,status){
		if(e) throw(e);
		Mia.update({clave:mia.clave},{status:status.id},callback);
		if(counter++ % 100 == 0) console.log(timestamp()+" processed: "+counter);
	});
}


var downloadWget = function(file,cb){	
	var fname = file.url.split('/');
	fname = fname[fname.length -1];
	console.log('downloading '+fname);
	var util = require('util'),
	    exec = require('child_process').exec,
	    child,

	child = exec('wget -O '+file.dir+fname +' '+ file.url,
	  function (error, stdout, stderr) {
	    // console.log('stdout: ' + stdout);
	    // console.log('stderr: ' + stderr);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	      cb(error,false);
	    }
	});
	child.on('exit',function(){
		console.log('downloaded: '+fname);
		cb(null,file.dir+fname);
	})
}