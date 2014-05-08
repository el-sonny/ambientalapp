//var app = angular.module('ambientalapp', ['ngSanitize']);
app.controller('coordFinderController', function ($scope,$sce) {
	$scope.mia = mia;
	//Subscribe to MIA socket
	socket.get('/mia/'+mia.id);
	//Mia message Event
	socket.on('mia', function (msg){
		$scope.mia = msg.data ;
		$scope.$apply();
	});
	//Bypass angular sanitize
	$scope.trustHTML = function(snippet){
		return $sce.trustAsHtml(snippet);
	}

	$scope.initSpace = function(space,text){
		var offset = 0;
		space.points.forEach(function(point){
			old_text = text;
			text = highlight(text,point.reference.x.start+offset,point.reference.x.end+offset,'btn-primary');
			offset += text.length - old_text.length;
			old_text = text;
			text = highlight(text,point.reference.y.start+offset,point.reference.y.end+offset,'btn-success');
			offset += text.length - old_text.length;
		});
		return text.slice(space.points[0].reference.x.start-400,space.points[space.points.length-1].reference.y.end+offset+150);
		}
	
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