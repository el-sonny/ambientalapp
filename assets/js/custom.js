$().ready(function(){
	$('.download-doc').click(function(e){
		e.preventDefault();
		var button = $(this).attr('disabled','disabled').html($(this).html().replace('copiar','descargando'));
		$.get(button.attr('href'),function(data){
			console.log(data);
			var text = button.html().replace('descargando','')+' guardado';
			button.removeClass('btn-standard').addClass('btn-success').html(text);
		},'json')
	});

	$(document).on('mouseenter','.high',function(){
		$('#'+$(this).attr('data-component')).addClass('active');
	}).on('mouseleave','.high',function(){
		$('#'+$(this).attr('data-component')).removeClass('active');
	});
	
	$('.find-coordinates').click(function(e){
		e.preventDefault();
		var button = $(this).attr('disabled','disabled').html('Buscando coordenadas');
		$.get(button.attr('href'),function(result){			
			result.spaces.forEach(function(space){
				var finder = new coordinatesFinder(space,result.text);
			});
			
			$('pre .high').each(function(){
				var index = $(this).index();
				var even = index % 2 == 0;
				var component = even ? index + 1 : index -1;
				var value = $(this).html();
				component = 'coord-'+component;
				var color = even ? 'btn-primary' : 'btn-success' ;
				$(this).addClass('btn dropdown-toggle')
				.addClass(color)
				.attr('type','button')
				.attr('data-toggle','dropdown')
				.attr('data-xy',even ? "x" : "y" )
				.attr('data-component',component)
				.attr('data-value',value)
				.append(' <span class="caret"></span>')
				.wrap( "<div class='btn-group'></div>" )
				.addClass('coord-'+index);
				var xyindex = even ? 0 : 1
				var check = ' <span class="glyphicon glyphicon-ok"></span>';
				var menu = $("#sample-menu").clone().attr('id','');
				menu.children('li').eq(xyindex).children().append(check);
				$(this).after(menu);
			});

			$('pre.search-space').each(function(){
				var pre = $(this);
				var space = pre.parent().parent();
				var row = space.find('.clone-row').detach();
				var table = space.find('table');
				var points = [];
				$(this).find('.high').each(function(){
					var xy = $(this).attr('data-xy');
					if(xy == 'x'){
						var x = $(this).attr('data-value');
						var y = pre.find('.'+$(this).attr('data-component')).attr('data-value');
						if(x && y){ 
							points.push({x:x,y:y});
							tds = row.clone();
							tds.children('td').eq(0).html(points.length).next().html(x).next().html(y);
							table.append(tds);
						}
					}
				})
				if(points.length){
					space.find('.map-preview-checkbox').bootstrapSwitch('disabled',false);
					space.find('.points').html(JSON.stringify(points));
				}else{
					pre.parent().parent().detach();
				};
			})

			$('html, body').animate({ scrollTop: $('#parse-space').offset().top - 100 }, 'slow');
		},'json');
	});
})
function load_map(panel){
	var points = $.parseJSON(panel.find('.points').html());
	$.get('/mia/convertUTM',{points:points},function(points){
		var mapCanvas = panel.find('.map').html('');
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
}
function get_center(points){
	var max = {x:points[0].x,y:points[0].y};
	var min = {x:points[0].x,y:points[0].y};
	points.forEach(function(point){
		if(point.x > max.x) max.x = point.x;
		if(point.x < min.x) min.x = point.x;
		if(point.y > max.y) max.y = point.y;
		if(point.y < min.y) min.y = point.y;
	});
	return {
		x: (max.x-min.x)/2 + min.x,
		y: (max.y-min.y)/2 + min.y,
	};
}
