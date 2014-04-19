var ambientalApp = angular.module('ambientalapp', []);
 
ambientalApp.controller('MiaCtrl', function ($scope) {
	$scope.mia = mia;
	socket.get('/mia/'+$('#mia-profile').attr('data-mia'),function (mia){
		console.log('Loaded mia: ',mia);
		$scope.mia = mia;
		socket.on('mia', function (msg){
			console.log('Here\'s what happened:',msg.verb);
			console.log('Here\'s the relevant data:', msg.data);
			$scope.mia = msg.data ;
		});
	});
});