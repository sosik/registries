angular.module('registries', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({templateUrl: '/partials/empty.html'});
}]);
