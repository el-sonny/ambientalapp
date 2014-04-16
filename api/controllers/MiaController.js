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

	},
};
