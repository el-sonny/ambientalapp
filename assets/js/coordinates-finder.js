function coordinatesFinder(space,text){
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
	
	this.initPoints();
	this.initCoords();

	this.panel.find('.space-activation-checkbox').bootstrapSwitch({onText:'si',offText:'no'})
	.on('switchChange.bootstrapSwitch', $.proxy(this.toggleActivate,this));

	this.panel.find('.map-preview-checkbox').bootstrapSwitch({onText:'on',offText:'off'})
	.on('switchChange.bootstrapSwitch', $.proxy(this.togglePreview,this));

	if(this.coords.length) $('#parse-space').append(this.panel);
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
		this.load_map();
	}else{
		this.panel.find('pre').show();
		this.panel.find('.map').addClass('hidden');
	}
}
coordinatesFinder.prototype.load_map = function(){
	var mapCanvas = this.panel.find('.map').html('');
	console.log(this.coords);
	$.post('/mia/convertUTM',{points:this.coords},function(points){
		console.log(points);
		var center = get_center(points);
		var startMapOptions = {
          center: new google.maps.LatLng(center.x,center.y),
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.SATELLITE
        };

		var map = new google.maps.Map(mapCanvas.get(0), startMapOptions);

		var proyectCoordinates = [];
		points.forEach(function(point){
			proyectCoordinates.push(new google.maps.LatLng(point.x,point.y));
		});
		proyectCoordinates.push(new google.maps.LatLng(points[0].x,points[0].y))

		var proyectPath = new google.maps.Polygon({
			paths: proyectCoordinates,
			geodesic: true,
			strokeColor: '#eeee22',
			strokeOpacity: 1.0,
			strokeWeight: 2,
			fillColor: '#999912',
			fillOpacity: .55
		});
		proyectPath.setMap(map);
	},'json');
	//this.map = map;
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

coordinatesFinder.prototype.initCoords = function(){
	var pre = this.search_space;
	var space = this.panel;
	var row = space.find('.clone-row').detach().removeClass('clone-row');
	var table = space.find('table');
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

	if(coords.length) space.find('.map-preview-checkbox').bootstrapSwitch('disabled',false);
	this.coords = coords;
}

function highlight(text,start,end){
	return text.slice(0,start)+"<span class='high'>"+text.slice(start,end)+"</span>"+text.slice(end);
}