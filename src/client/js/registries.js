angular.module('registries', ['ngRoute', 'ngCookies', 'security', 'personal-page','schema-editor','generic-search', 'registry','ui.ace', 'psui-uploadable-image', 'psui-imageresizor'])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/personal-page', {templateUrl: '/partials/personal-page.html', controller: 'personalPageCtrl', permissions:['System User']});
	$routeProvider.when('/login', {templateUrl: '/partials/login.html', controller: 'security.loginCtrl'});
	$routeProvider.when('/personal-change-password', {templateUrl: '/partials/personal-change-password.html', controller: 'security.personalChangePasswordCtrl', permissions:['System User']});
	$routeProvider.when('/security/group/edit/', {templateUrl: '/partials/security-group-edit.html', controller: 'security.securityGroupEditCtrl', permissions:['System User']});
	$routeProvider.when('/registry/new/:schema', {templateUrl: '/partials/registry-new.html', controller: 'registry.newCtrl'});
	$routeProvider.when('/registry/view/:schema/:id', {templateUrl: '/partials/registry-view.html', controller: 'registry.viewCtrl'});
	
	
	$routeProvider.otherwise({templateUrl: '/partials/login.html', controller: 'security.loginCtrl'});
	
	$routeProvider.when('/user/list', {templateUrl: 'partials/userList.html', controller: 'security.userListCtrl'});
	$routeProvider.when('/user/edit', {templateUrl: 'partials/userEdit.html', controller: 'security.userEditCtrl'});
}])
/**
 * Main function, initializes all required data and scopes. For configuration of $providers
 * use .config
 */
.run(["$rootScope", '$location', 'security.SecurityService', '$cookies', function($rootScope, $location, SecurityService,$cookies) {
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
		if (changeRouteRuleActive && (!$rootScope.security.currentUser || !SecurityService.hasPermissions(nextRoute.permissions))) {
			evt.preventDefault();
			$location.path('/login');
		}
	});

	$rootScope.app = {
		mainMenu: false
	};
}]);
