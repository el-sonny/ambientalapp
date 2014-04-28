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
			if(!mia.file_status_set){
				mia.file_status_set = true;
				mia.save(function(e,mia){
					res.view({mia:mia});	
				});
			}else{
				res.view({mia:mia});
			}
			
		});
	},	
	findCoordinates : function(req,res){
		Mia.findOne({clave:req.param('id')}).exec(function(e,mia){
			if(mia[req.param('filetype')+"_file"]){
				searchPDF(mia[req.param('filetype')+"_file"],function(e,pdf){
					res.send(pdf);
				});
			}else{
				//TODO no hay archivo
				res.json(mia);
			}

		});
	},
	convertUTM : function(req,res){
		var points = req.param('points');
		var converter = require('coordinator');
	    var fn = converter('utm', 'latlong');
	    var new_points = [];
	    points.forEach(function(point){
	    	latlong = fn(point.y, point.x,16);
	    	new_points.push({x:latlong.latitude,y:latlong.longitude});
	    });
	    res.json(new_points);
	},
	savePolygon : function(req,res){
		Mia.findOne({clave:req.param('mia')}).exec(function(e,mia){
			if(e) throw(e);
			var poligono = req.param('poligono');
			poligono.mia = mia.id;
			//todo checar si ya existe el poligono
			Poligono.create(poligono,function(e,p){
				if(e) throw(e);
				res.json(p);
			});
		});
	},
	processFiles : function(req,res){
		ScraperService.processFiles(req.param('id'),function(e,files){
			res.json(files);
		});
	}
};

