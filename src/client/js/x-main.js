(function(angular) {
	'use strict';

	angular.module('x-registries', [
		'ngRoute', 
		'ngCookies',
		'xpsui:services', 
		'xpsui:directives', 
		'xpsui:controllers',
		'pascalprecht.translate'

		// 'x-security',
		// 'personal-page',
		// 'psui-notification'
	])
	.config(['$routeProvider', 'xpsui:loggingProvider',function($routeProvider, loggingProvider) {
		// $routeProvider.when('/view/:schema/:objId', {controller: 'xViewController', templateUrl: '/partials/x-view.html'});

		$routeProvider.when('/personal-page', {templateUrl: '/partials/personal-page.html', controller: 'xpsui:PersonalPageCtrl', permissions:['System User']});
		$routeProvider.when('/login', {templateUrl: '/partials/login.html', controller: 'xpsui:SecurityLoginCtrl'});
		//$routeProvider.when('/personal-change-password', {templateUrl: '/partials/personal-change-password.html', controller: 'security.personalChangePasswordCtrl', permissions:['System User']});
		$routeProvider.when('/registry/new/:schema', {templateUrl: '/partials/x-registry-new.html', controller: 'xpsui:RegistryNewCtrl',permissions:['Registry - write']});
		$routeProvider.when('/registry/view/:schema/:id', {templateUrl: '/partials/x-registry-view.html', controller: 'xpsui:RegistryViewCtrl',permissions:['Registry - read']});
		
		$routeProvider.otherwise({templateUrl: '/partials/login.html', controller: 'xpsui:SecurityLoginCtrl'});
		
		loggingProvider.setLevel(5);
	}])
	/**
	 * Main function, initializes all required data and scopes. For configuration of $providers
	 * use .config
	 */
	.run(["$rootScope", '$location', 'xpsui:SecurityService', '$cookies','xpsui:NotificationFactory', function($rootScope, $location, SecurityService,$cookies,notificationFactory) {
		$rootScope.security = $rootScope.security || {};
		// by default, current user is undefined, as there is noone logged in

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

		$rootScope.$on('$routeChangeStart', function() {
			notificationFactory.clear();
		});

		// hang on route change, so we can check if user meets security criteria
		$rootScope.$on('$routeChangeStart', function(evt, nextRoute, currentRoute) {
			if (nextRoute && nextRoute.permissions) {
				// check permissions only if defined
				if (changeRouteRuleActive && (!$rootScope.security.currentUser || !SecurityService.hasPermissions(nextRoute.permissions))) {
					notificationFactory.warn({translationCode:'security.user.missing.permissions',translationData: nextRoute.permissions ,time:5000});
					$location.url('/login');
				}
			}
		});

		$rootScope.app = {
			mainMenu: false
		};
	}]);
}(angular));
