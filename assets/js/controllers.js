var app = angular.module('ambientalapp', ['ngSanitize']);
app.controller('MiaCtrl', function ($scope,$sce) {
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



	//Display Apropiate icons for the coordinates tool
	$scope.fileDownloadStatusIcon = function(name) {
		return $scope.mia[name].file && $scope.mia[name].file == 'downloading' ? "icon-animate glyphicon glyphicon-cog" :
		$scope.mia[name].file ? "glyphicon glyphicon-ok" : 
		$scope.mia[name].url ? "glyphicon glyphicon-ban-circle" : "glyphicon glyphicon-warning-sign";
	};
	$scope.fileProcessStatusIcon = function(name) {
		if($scope.mia[name].processed){
			var _class = $scope.mia[name].processed == 2 ? 'glyphicon glyphicon-ok' : 'icon-animate glyphicon glyphicon-cog';
		}else{
			var _class = 
			$scope.mia[name].file ? "glyphicon glyphicon-ban-circle" :
			$scope.mia[name].url ? "glyphicon glyphicon-ban-circle" : "glyphicon glyphicon-warning-sign";
		}
		return _class;		
	};
	$scope.fileLink = function(name){
		return $scope.mia[name].file && $scope.mia[name].file != 'downloading' ? '/'+$scope.mia[name].file : $scope.mia[name].url ? $scope.mia[name].url : '';
	};
	$scope.fileButtonClass = function(name){
		return $scope.mia[name].file && $scope.mia[name].file != 'downloading' ? "btn-success" : $scope.mia[name].url ? "btn-info" : "btn-danger";
	}
	$scope.fileButtonDisabled = function(name){
		return !($scope.mia[name].file || $scope.mia[name].url);
	};
	$scope.fileButtonLabel = function(name){
		return $scope.mia[name].file  && $scope.mia[name].file != 'downloading' ? "en archivo local" : 
		$scope.mia[name].url ? "en archivo de gobierno" : "archivo no encontrado";
	}
});