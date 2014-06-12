angular.module('registries', ['ngRoute', 'ngCookies', 'security', 'personal-page'])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/personal-page', {templateUrl: '/partials/personal-page.html', controller: 'personalPageCtrl'});
	$routeProvider.otherwise({templateUrl: '/partials/login.html', controller: 'security.loginCtrl'});
}])
/**
 * Main function, initializes all required data and scopes. For configuration of $providers
 * use .config
 */
.run(["$rootScope", function($rootScope) {
	$rootScope.security = $rootScope.security || {};
	// by default, current user is undefined, as there is noone logged in
	$rootScope.security.currentUser = undefined;
}]);
