angular.module('registries', ['ngRoute', 'ngCookies', 'security', 'personal-page'])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/personal-page', {templateUrl: '/partials/personal-page.html', controller: 'personalPageCtrl', permissions:['System User']});
	$routeProvider.when('/login', {templateUrl: '/partials/login.html', controller: 'security.loginCtrl'});
	$routeProvider.when('/personal-change-password', {templateUrl: '/partials/personal-change-password.html', controller: 'security.personalChangePasswordCtrl', permissions:['System User']});
	$routeProvider.otherwise({templateUrl: '/partials/login.html', controller: 'security.loginCtrl'});
}])
/**
 * Main function, initializes all required data and scopes. For configuration of $providers
 * use .config
 */
.run(["$rootScope", '$location', 'security.SecurityService', function($rootScope, $location, SecurityService) {
	$rootScope.security = $rootScope.security || {};
	// by default, current user is undefined, as there is noone logged in
	$rootScope.security.currentUser = undefined;

	// hang on route change, so we can check if user meets security criteria
	$rootScope.$on('$routeChangeStart', function(evt, nextRoute, currentRoute) {
		console.log(nextRoute);
		if (!$rootScope.security.currentUser || !SecurityService.hasPermissions(nextRoute.permissions)) {
			evt.preventDefault();
			$location.path('/login');
		}
	});
}]);
