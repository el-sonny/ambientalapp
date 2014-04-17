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
		$('.'+$(this).attr('data-component')).addClass('active');
	}).on('mouseleave','.high',function(){
		$('.'+$(this).attr('data-component')).removeClass('active');
	});
	
	$('.find-coordinates').click(function(e){
		e.preventDefault();
		var button = $(this).attr('disabled','disabled').html('Buscando coordenadas');
		$.get(button.attr('href'),function(result){			
			result.spaces.forEach(function(space,index){
				var finder = new coordinatesFinder(space,result.text);
			});
			$('html, body').animate({ scrollTop: $('#parse-space').offset().top - 100 }, 'slow');
		},'json');
	});
})

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
