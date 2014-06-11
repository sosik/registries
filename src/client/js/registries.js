angular.module('registries', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise('/empty.html');
}]);
