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
		var searchSpaces = [];
		while(result = regex.exec(doc)){
			console.log(result.index);
			if(searchSpaces.length == 0){
				searchSpaces.push({
					start : result.index,
					end : result.index+1000
				});
			}else{
				var overlap = false;
				searchSpaces.forEach(function(space){
					if(result.index > space.start && result.index < space.end) overlap = true;
				});
				if(!overlap){
					searchSpaces.push({
						start : result.index,
						end : result.index+1000
					});
				}
			}
		}
		if(searchSpaces.length){
			var searchTexts = [];
			searchSpaces.forEach(function(space){
				space.text = doc.substr(space.start,space.end);
			});
			callback(null,searchSpaces);
		}else{
			callback(null,doc);
		}
		
	});

}
