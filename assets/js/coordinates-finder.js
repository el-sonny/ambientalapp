/*function coordinatesFinder(space,text){
    var offset = 0;
    this.full_text = text;
	space.matches.forEach(function(match){
		text = this.highlight(text,match.start+offset,match.end+offset);
		offset += 26;
	});

	this.text = text.slice(space.matches[0].start-400,space.matches[space.matches.length-1].end+offset+150);
	this.panel = $("#search-space-sample").clone().attr('id','').removeClass('hidden');
	this.search_space = this.panel.find('pre').html(this.text).addClass('search-space');
	this.text = text;
	this.formatSelect = this.panel.find('select').val(space.format);
	this.format = space.format;
	
	this.polygon_template = $('#polygon-template').clone().removeClass('hidden').attr('id','');

	this.initPoints();
	this.initPolygons();
	this.mia = {clave:$('#clave').html(),id:$('#mia-profile').attr('data-mia')};

	this.panel.find('.space-activation-checkbox').bootstrapSwitch({onText:'SI',offText:'NO'})
	.on('switchChange.bootstrapSwitch', $.proxy(this.toggleActivate,this));

	this.panel.find('.map-preview-checkbox').bootstrapSwitch({onText:'ON',offText:'OFF'})
	.on('switchChange.bootstrapSwitch', $.proxy(this.togglePreview,this));

	if(this.vertices) $('#parse-space').append(this.panel);
}

coordinatesFinder.prototype.initPoints = function(){
	var points = [];
	this.search_space.find('.high').each(function(index){
		var even = index % 2 == 0;
		var xy = even ? "x" : "y";
		var pair = even ? index + 1 : index -1;
		var point = {
			index : $(this).index(),
			component_class : 'coord-' + pair,
			component_index : pair,
			value : $(this).html(),
			xy : even ? "x" : "y",
			_class : 'coord-'+index,
			color : even ? 'btn-primary' : 'btn-success' ,
		}
		points.push(point);

		$(this).addClass('btn dropdown-toggle')
		.addClass(point.color)
		.attr('type','button')
		.attr('data-toggle','dropdown')
		.attr('data-xy',point.xy )
		.attr('data-component',point.component_class)
		.attr('data-value',point.value)
		.append(' <span class="caret"></span>')
		.wrap( "<div class='btn-group'></div>" )
		.addClass(point._class);

		var xyindex = even ? 0 : 1
		var check = ' <span class="glyphicon glyphicon-ok"></span>';
		var menu = $("#sample-menu").clone().attr('id','');
		menu.children('li').eq(xyindex).children().append(check);
		$(this).after(menu);
	});
	this.points = points;
}

coordinatesFinder.prototype.initPolygons = function(){
	var space = this.panel;
	var polygon_box = this.polygon_template.clone();
	var row = polygon_box.find('.clone-row').detach().removeClass('clone-row');
	var table = polygon_box.find('table');
	var coords = [];
	var points = this.points;
	this.points.forEach(function(point){
		if(point.xy == 'x'){
			if(y = points[point.component_index]){
				var coord = {
					x : point.value,
					y : y.value,
				};
				coords.push(coord);
				tds = row.clone();
				tds.children('td').eq(0).html(coords.length).next().html(coord.x).next().html(coord.y);
				table.append(tds);
			}
		}
	});
	
	this.polygons = [{}];
	this.polygons[0][this.format] = coords;
	this.vertices = coords.length;

	if(coords.length){
		space.find('.polygons-container').append(polygon_box);
		polygon_box.find('.ttip').tooltip()
		polygon_box.find('.set-primary-polygon').click(function(e){
			e.preventDefault();
			$(this).toggleClass('glyphicon-star-empty');
			$(this).toggleClass('glyphicon-star');
		});
		polygon_box.find('.collapser').click(function(e){
			$(this).toggleClass('glyphicon-plus');
			$(this).toggleClass('glyphicon-minus');
		});
		polygon_box.find('.save').click($.proxy(this.savePolygon,this,0,polygon_box));
	}	

	if(this.format == 'utm' && this.vertices){
		this.convertUTM(0,$.proxy(function(){
			space.find('.map-preview-checkbox').bootstrapSwitch('disabled',false);
		},this));
	}else if(this.polygons[0]['latlng'] && this.vertices){
		this.polygons[0].center = get_center(this.polygons[0]['latlng']);
		space.find('.map-preview-checkbox').bootstrapSwitch('disabled',false);
	}
}

coordinatesFinder.prototype.savePolygon = function(index,box,e){
	e.preventDefault();
	if(!this.polygons[index].id){
		box.find('.save').addClass('saving');
		this.polygons[index].name = box.find('.polygon-name').val();
		this.polygons[index].primary = box.find('.set-primary-polygon').hasClass('glyphicon-star');
		this.polygons[index].mia = this.mia.id;
		socket.post('/poligono',this.polygons[index], $.proxy(function (polygon){
		  box.find('.save').removeClass('glyphicon-save').addClass('glyphicon-saved');
		  this.polygons[index] = polygon;
		},this));
	}
}

coordinatesFinder.prototype.toggleActivate = function(e,state){
	if(state){
		this.panel.find('.workspace').removeClass('disabled');
	}else{
		this.panel.find('.workspace').addClass('disabled');
	}
}

coordinatesFinder.prototype.togglePreview = function(e,state){
	if(state){
		this.panel.find('pre').hide();
		this.panel.find('.map').removeClass('hidden');
		this.initMap();
		this.polygons.forEach($.proxy(function(polygon,index){
			this.drawPolygon(index);
		},this));		
	}else{
		this.panel.find('pre').show();
		this.panel.find('.map').addClass('hidden');
	}
}

coordinatesFinder.prototype.initMap = function(center){
	var mapCanvas = this.panel.find('.map').html('');
	center = this.polygons[0].center ? this.polygons[0].center : {x:20.933384,y:-86.838691};
	var startMapOptions = {
      center: new google.maps.LatLng(center.x,center.y),
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.SATELLITE
    };
	this.map = new google.maps.Map(mapCanvas.get(0), startMapOptions);
}

coordinatesFinder.prototype.drawPolygon = function(index){
	var polygon = this.polygons[index];
	if(polygon['latlng'] && polygon['latlng'].length){
		var points = polygon['latlng'];
		var proyectCoordinates = [];
		var center = polygon.center ? polygon.center : get_center(points);
		this.map.setCenter(new google.maps.LatLng(center.x,center.y));
		points.forEach(function(point){
			proyectCoordinates.push(new google.maps.LatLng(point.x,point.y));
		});

		proyectCoordinates.push(new google.maps.LatLng(points[0].x,points[0].y));
		var proyectPath = new google.maps.Polygon({
			paths: proyectCoordinates,
			geodesic: true,
			strokeColor: '#eeee22',
			strokeOpacity: 1.0,
			strokeWeight: 2,
			fillColor: '#999912',
			fillOpacity: .55
		});
		proyectPath.setMap(this.map);
	}else if(polygon['utm'] && polygon['utm'].length){
		this.convertUTM(index,$.proxy(this.drawPolygon,this));
	}else{
		//Todo no hay coordenadas
	}
}

coordinatesFinder.prototype.convertUTM = function(index,callback){
	$.post('/mia/convertUTM',{points:this.polygons[index]['utm']},$.proxy(function(coords){
		this.polygons[index].latlng = coords;
		this.polygons[index].center = get_center(coords);
		if(callback) callback(index);
	},this),'json');
}



function highlight(text,start,end){
	return text.slice(0,start)+"<span class='high'>"+text.slice(start,end)+"</span>"+text.slice(end);
}*/