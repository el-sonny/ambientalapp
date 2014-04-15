$().ready(function(){
	$('.download-doc').click(function(e){
		e.preventDefault();
		var button = $(this).attr('disabled','disabled').html($(this).html().replace('copiar','descargando'));
		$.get(button.attr('href'),function(data){
			console.log(data);
			var text = button.html().replace('descargando','')+' guardado';
			button.removeClass('btn-standard').addClass('btn-success').html(text);
		},'json')

	})
})