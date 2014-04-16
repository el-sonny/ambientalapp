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
			result.spaces.forEach(function(space,index){
				var offset = 0;
				space.text = result.text;
				space.matches.forEach(function(match){
					space.text = highlight(space.text,match.start+offset,match.end+offset);
					offset += 26;
				});
				space.text = space.text.slice(space.matches[0].start-400,space.matches[space.matches.length-1].end+offset+150);
				panel = $("#search-space-sample").clone().attr('id','').removeClass('hidden');
				panel.children('pre').html(space.text).addClass('search-space');
				panel.find('select').val(space.format);
				$('#parse-space').append(panel);
			});
			$('.space-activation-checkbox').bootstrapSwitch({onText:'si',offText:'triping'})
			.on('switchChange.bootstrapSwitch', 
			function(e,state){
				var parent = $(this).parent().parent().parent().parent();
				if(state){
					parent.children('pre').removeClass('disabled');
					parent.find('.coordinates').removeClass('hidden');
				}else{
					parent.children('pre').addClass('disabled');
					parent.find('.coordinates').addClass('hidden');
				}

			});
			$('.map-preview-checkbox').bootstrapSwitch({onText:'on',offText:'off'}).on('switchChange.bootstrapSwitch', 
			function(e,state){
				var panel = $(this).parent().parent().parent().parent().parent();
				if(state){
					panel.children('pre').hide();
					panel.children('.map').show();
					load_map(panel);
				}else{
					panel.children('pre').show();
					panel.children('.map').hide();
				}

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
				var row = $(this).prev().find('.clone-row').detach();
				var table = $(this).prev().find('table');
				var points = [];
				$(this).find('.high').each(function(){
					var xy = $(this).attr('data-xy');
					if(xy == 'x'){
						var x = $(this).attr('data-value');
						var y = pre.find('.'+$(this).attr('data-component')).attr('data-value');
						if(x && y) points.push([x,y]);
						tds = row.clone();
						tds.children('td').eq(0).html(x).next().html(y);
						table.append(tds);
					}
				})
				if(points.length){
					pre.parent().find('.map-preview-checkbox').bootstrapSwitch('disabled',false);
					pre.next().html(JSON.stringify(points));
				};
			})

			$('html, body').animate({ scrollTop: $('#parse-space').offset().top - 100 }, 'slow');
		},'json');
	});
})
function highlight(text,start,end){
	return text.slice(0,start)+"<span class='high'>"+text.slice(start,end)+"</span>"+text.slice(end);
}
function load_map(panel){
	var points = $.parseJSON(panel.children('.points').html());
	$.get('/mia/convertUTM',{points:points},function(new_points){
		panel.children('.map').html(JSON.stringify(new_points));
	},'json');
}