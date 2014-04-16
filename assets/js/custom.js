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
				var offset = 0;
				space.forEach(function(match){
					space.text = highlight(result.text,match.start+offset,match.end+offset);
					offset += 26;
				});
				var text = space.text.slice(space[0].start-200,space[space.length-1].end+offset+100);
				$('#parse-space').append("<pre class='well'>"+text+"</pre>");
				var id = 0;
				$('.high').each(function(index){
					var even = index % 2 == 0;
					var component = even ? index + 1 : index -1;
					component = 'coord-'+component;
					var color = even ? 'btn-primary' : 'btn-success' ;
					$(this).addClass('btn dropdown-toggle')
					.addClass(color)
					.attr('type','button')
					.attr('data-toggle','dropdown')
					.attr('data-xy',even ? "x" : "y" )
					.attr('data-component',component)
					.append(' <span class="caret"></span>')
					.wrap( "<div class='btn-group'></div>" )
					.attr('id','coord-'+index);

					var xyindex = even ? 0 : 1
					var check = ' <span class="glyphicon glyphicon-ok"></span>';
					var menu = $("#sample-menu").clone().attr('id','');
					menu.children('li').eq(xyindex).children().append(check);
					$(this).after(menu);
					//$(this).after()
				});
				$('html, body').animate({ scrollTop: $('#parse-space').offset().top - 100 }, 'slow');
			});
		},'json');
	});
})
function highlight(text,start,end){
	return text.slice(0,start)+"<span class='high'>"+text.slice(start,end)+"</span>"+text.slice(end);
}