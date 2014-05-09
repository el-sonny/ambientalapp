app.controller('coordFinderController', function ($scope,$sce,leafletData) {
	$scope.initSpace = function(space){
		var offset = 0;
		var latlngs = [];
		var text = mia.resumen.text;
		space.points.forEach(function(point){
			old_text = text;
			text = highlight(text,point.reference.x.start+offset,point.reference.x.end+offset,'btn-primary');
			offset += text.length - old_text.length;
			old_text = text;
			text = highlight(text,point.reference.y.start+offset,point.reference.y.end+offset,'btn-success');
			offset += text.length - old_text.length;
			latlngs.push({lat:point.lat,lng:point.lng});
		});
		latlngs.push({lat:space.points[0].lat,lng:space.points[0].lng});
		space.paths = [{
			color: '#223900',
			weight: 1,
			latlngs : latlngs,
			fillColor: '#223900',
		    type: 'polygon'
		}];
		space.center = {
			lat : latlngs[0].lat,
			lng : latlngs[0].lng,
			zoom : 16,
		}
		space.preview = false;
		space.enabled = true;
		space.text = text.slice(space.points[0].reference.x.start-400,space.points[space.points.length-1].reference.y.end+offset+150);
	}
	$scope.showHideMap = function(space){
		//console.log(space.preview);
		console.log(space.preview);
		if (space.preview === true) {
		    leafletData.getMap().then(function(map){
		    	L.Util.requestAnimFrame(map.invalidateSize,map,!1,map._container);
		        //console.log(map.invalidateSize());
		    });
		}
	};
});


function highlight(text,start,end,color){
	return text.slice(0,start)+
	"<div class='btn-group'>"+
		"<span class='high btn dropdown-toggle "+color+"' >"+
			text.slice(start,end)+
			' <span class="caret"></span>'+
		"</span>"+
	"</div>"+
	text.slice(end);	
}