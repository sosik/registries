angular.module('registries', [
		'ngRoute',
		'ngCookies',
		'security',
		'personal-page',
		'schema-editor',
		'generic-search',
		'registry',
		'ui.ace',
		'psui',
		'psui-uploadable-image',
		'psui-imageresizor',
		'psui-datepicker',
		'psui-notification',
		'psui-validity-mark',
		'pascalprecht.translate',
		'psui-objectlink'
])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/personal-page', {templateUrl: '/partials/personal-page.html', controller: 'personalPageCtrl', permissions:['System User']});
	$routeProvider.when('/login', {templateUrl: '/partials/login.html', controller: 'security.loginCtrl'});
	$routeProvider.when('/personal-change-password', {templateUrl: '/partials/personal-change-password.html', controller: 'security.personalChangePasswordCtrl', permissions:['System User']});
	$routeProvider.when('/security/group/edit/', {templateUrl: '/partials/security-group-edit.html', controller: 'security.groupEditCtrl', permissions:['System Admin']});
	$routeProvider.when('/security/user/edit', {templateUrl: 'partials/security-user-edit.html', controller: 'security.userEditCtrl',permissions:['System Admin']});
	$routeProvider.when('/registry/new/:schema', {templateUrl: '/partials/registry-new.html', controller: 'registry.newCtrl',permissions:['Registry - write']});
	$routeProvider.when('/registry/view/:schema/:id', {templateUrl: '/partials/registry-view.html', controller: 'registry.viewCtrl',permissions:['Registry - read']});
	$routeProvider.otherwise({templateUrl: '/partials/login.html', controller: 'security.loginCtrl'});
}])
/**
 * Main function, initializes all required data and scopes. For configuration of $providers
 * use .config
 */
.run(["$rootScope", '$location', 'security.SecurityService', '$cookies','psui.notificationFactory', function($rootScope, $location, SecurityService,$cookies,notificationFactory) {
	$rootScope.security = $rootScope.security || {};
	// by default, current user is undefined, as there is noone logged in
	
	$rootScope.cookies=$cookies;
	
	var changeRouteRuleActive=false;
	
	if ($cookies.loginName){
		SecurityService.getCurrentUser()
		.success(function(data, status, headers, config) {
			$rootScope.security.currentUser = data;
			changeRouteRuleActive=true;
		})
		.error(function(data, status, headers, config) {
			delete $rootScope.security.currentUser;
			$rootScope.security.currentUser = undefined;
			changeRouteRuleActive=true;
			$location.path('/login');
		});
		
	}
	else {
		$rootScope.security.currentUser = undefined;
		changeRouteRuleActive=true;
	}
	
	// hang on route change, so we can check if user meets security criteria
	$rootScope.$on('$routeChangeStart', function(evt, nextRoute, currentRoute) {
		if (nextRoute && nextRoute.permissions) {
			// check permissions only if defined
			if (changeRouteRuleActive && (!$rootScope.security.currentUser || !SecurityService.hasPermissions(nextRoute.permissions))) {
				//FIXME this call doesn't work , newer version of angular should be used. 
				evt.preventDefault();
				// TODO TRANSLATE
				notificationFactory.error('Chybajúce oprávnenie: '+nextRoute.permissions);
			}
		}
	});

	$rootScope.app = {
		mainMenu: false
	};
}]);
