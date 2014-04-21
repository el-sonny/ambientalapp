var app = angular.module('ambientalapp', ['ngSanitize']);
app.controller('MiaCtrl', function ($scope,$sce) {
	//console.log($sc);
	$scope.mia = mia;
	socket.get('/mia/'+mia.id,function (mia){
		//$scope.mia = mia;
		console.log('Loaded mia: ',$scope.mia);
		$scope.$apply()
	});

	socket.on('mia', function (msg){
		$scope.mia = msg.data ;
		$scope.$apply();
	});

	$scope.trustHTML = function(snippet){
		return $sce.trustAsHtml(snippet);
	}
});