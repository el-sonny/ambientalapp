/**
 * MiaController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	listing : function(req,res){
		Mia.find({entidad:"Quintana roo"}).limit(100).populate('status').sort('fecha_de_ingreso DESC').exec(function(e,mias){
			if(e) throw(e);
			res.view({mias:mias});
		});
	},
	perfil : function(req,res){
		Mia.findOne({clave:req.param('id')}).populate('status').exec(function(e,mia){
			if(e) throw(e);
			res.view({mia:mia});
		});
	},	
	findCoordinates : function(req,res){
		Mia.findOne({clave:req.param('id')}).exec(function(e,mia){
			if(mia[req.param('filetype')+"_file"]){
				searchPDF(mia[req.param('filetype')+"_file"],function(e,pdf){
					res.send(pdf);
				});
			}else{
				//TOdo no hay archivo
				res.json(mia);
			}

		});
	},
};
function searchPDF(filename,callback){
	var extract = require('pdf-text-extract');
	extract(filename, function (err, pages) {
		if (err) {
			console.dir(err);
			callback(err);
		}
		var doc = pages.join(" ");
		var regex = /coordenadas/igm;
		var spaces =[];
		var patterns = [ 
			{
				regex : /\d{6,7}\.?\d{0,8}/igm,
				format : 'UTM'
			}
		];
		patterns.forEach(function(pattern){
			var last_match = 0;
			var matches = [];
			while(result = pattern.regex.exec(doc)){
				var distance = result.index - last_match;
				last_match = result.index;
				if(distance > 300 && matches.length){
					spaces.push(matches);
					matches = [];
				}
				matches.push({
					start : result.index,
					end : result[0].length + result.index,
					content : result[0],
					format : pattern.format
				});
			}
			spaces.push(matches)
		});
		callback(null,{spaces:spaces,text:doc});
	});

}
