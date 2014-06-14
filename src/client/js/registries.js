angular.module('registries', ['ngRoute', 'ngCookies', 'security', 'personal-page','schema-editor','generic-search', 'registry'])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/personal-page', {templateUrl: '/partials/personal-page.html', controller: 'personalPageCtrl', permissions:['System User']});
	$routeProvider.when('/login', {templateUrl: '/partials/login.html', controller: 'security.loginCtrl'});
	$routeProvider.when('/personal-change-password', {templateUrl: '/partials/personal-change-password.html', controller: 'security.personalChangePasswordCtrl', permissions:['System User']});
	$routeProvider.when('/registry/new/:schema', {templateUrl: '/partials/registry-new.html', controller: 'registry.newCtrl'});
	$routeProvider.when('/registry/view/:schema/:id', {templateUrl: '/partials/registry-view.html', controller: 'registry.viewCtrl'});
	$routeProvider.otherwise({templateUrl: '/partials/login.html', controller: 'security.loginCtrl'});
}])
/**
 * Main function, initializes all required data and scopes. For configuration of $providers
 * use .config
 */
.run(["$rootScope", '$location', 'security.SecurityService', '$cookies', function($rootScope, $location, SecurityService,$cookies) {
	$rootScope.security = $rootScope.security || {};
	// by default, current user is undefined, as there is noone logged in
	
	$rootScope.cookies=$cookies;
	
	if ($cookies.loginName){
		SecurityService.getCurrentUser()
		.success(function(data, status, headers, config) {
			$rootScope.security.currentUser = data;
		})
		.error(function(data, status, headers, config) {
			delete $rootScope.security.currentUser;
			$rootScope.security.currentUser = undefined;
		});
		
	}
	else {
		$rootScope.security.currentUser = undefined;
	}
	
	// hang on route change, so we can check if user meets security criteria
	$rootScope.$on('$routeChangeStart', function(evt, nextRoute, currentRoute) {
		console.log(nextRoute);
		if (!$rootScope.security.currentUser || !SecurityService.hasPermissions(nextRoute.permissions)) {
			evt.preventDefault();
			$location.path('/login');
		}
	});

	$rootScope.app = {
		mainMenu: false
	};
}]);
