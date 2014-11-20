(function(angular) {
	angular.module('x-registries', ['ngRoute', 'xpsui:services', 'xpsui:directives', 'pascalprecht.translate'])
	.config(['$routeProvider', 'xpsui:loggingProvider',function($routeProvider, loggingProvider) {
		$routeProvider.when('/view/:schema/:objId', {controller: 'xViewController', templateUrl: '/partials/x-view.html'});
		loggingProvider.setLevel(5);
	}]);
}(angular));
