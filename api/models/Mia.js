/**
 * Mia.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
		clave : {
			unique : true,
			index : true
		},
		file_status_set : {
			type : 'BOOLEAN',
			defaultsTo: false
		},
		status : {
			model : 'status',
			dominant : true
		},
		fecha_de_ingreso : {
			type: 'DATE',
		},
		poligonos: {
			collection: 'poligono',
			via: 'mia',
			dominant: true,
		},

	},
	migrate : 'safe',
	beforeUpdate: function(values, next) {
		if(typeof(values.resumen) != 'undefined' ) values.resumen_status = file_status('resumen',values);
		if(typeof(values.estudio) != 'undefined' ) values.estudio_status = file_status('estudio',values);
		if(typeof(values.resolutivo) != 'undefined' ) values.resolutivo_status = file_status('resolutivo',values);
		//console.log('updating status ',values);
		next();
	}

};
function file_status(name,mia){
	var local_file = mia[name+"_file"] ? mia[name+"_file"].replace('assets','') : '';
	var labels = ['En archivo local','En archivo gobierno','No encontrado'];
	var links = [local_file,mia[name],false];
	var buttons = ['success','info','danger'];
	var status = mia[name+'_file'] ? 0 : mia[name] ? 1 : 2;
	var saveButtons = [
		"<a href='#' class='btn btn-success btn-lg' type='button' disabled >"+name+" copiado</a>",
		"<a href='/scraper/downloadProjectFile/"+mia.clave+"?filetype="+name+"' class='download-doc btn btn-primary btn-lg' type='button' >copiar "+name+"</a>",		
		"<a href='#' class='btn btn-danger btn-lg' type='button' disabled>"+name+" no encontrado</a>",
	];
	var openButtons = [
		"<a href='/mia/findCoordinates/"+mia.clave+"?filetype="+name+"' class='find-coordinates btn btn-success btn-lg' type='button' >abrir "+name+"</a>",
		"<a href='#' disabled class='btn btn-warning btn-lg' type='button' >guarde el "+name+" primero</a>",		
		"<a href='#' class='btn btn-danger btn-lg' type='button' disabled>"+name+" no encontrado</a>",
	];

	return {
		label : labels[status],
		button : buttons[status],
		link : links[status],
		disabled : status == 2,
		code : status,
		saveButton : saveButtons[status],
		openButton : openButtons[status],
	}
}
