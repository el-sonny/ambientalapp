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
	this.activationSwitch = this.panel.find('.space-activation-checkbox').bootstrapSwitch({onText:'si',offText:'no'})
	.on('switchChange.bootstrapSwitch', 
	function(e,state){
		var panel = $(this).parent().parent().parent().parent().parent();
		//console.log(panel.attr('class'));
		if(state){
			panel.find('.workspace').removeClass('disabled');
		}else{
			panel.find('.workspace').addClass('disabled');
		}
	});
	this.previewSwitch = this.panel.find('.map-preview-checkbox').bootstrapSwitch({onText:'on',offText:'off'}).on('switchChange.bootstrapSwitch', 
	function(e,state){
		var panel = $(this).parent().parent().parent().parent().parent();
		if(state){
			panel.find('pre').hide();
			panel.find('.map').removeClass('hidden');
			load_map(panel);
		}else{
			panel.find('pre').show();
			panel.find('.map').addClass('hidden');
		}

	});


	$('#parse-space').append(this.panel);
}
 
coordinatesFinder.prototype.getInfo = function(space){

}

function highlight(text,start,end){
	return text.slice(0,start)+"<span class='high'>"+text.slice(start,end)+"</span>"+text.slice(end);
}