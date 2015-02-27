(function(angular) {
	'use strict';

	angular.module('x-registries', [
		'ngRoute', 
		'ngCookies',
		'xpsui:filters',
		'xpsui:services', 
		'xpsui:directives', 
		'xpsui:controllers',
		'pascalprecht.translate',
		'ui.ace'

		// 'x-security',
		// 'personal-page',
		// 'psui-notification'
	])
	.config(['$routeProvider', 'xpsui:loggingProvider',function($routeProvider, loggingProvider) {
		// $routeProvider.when('/view/:schema/:objId', {controller: 'xViewController', templateUrl: '/partials/x-view.html'});

		$routeProvider.when('/personal-page', {templateUrl: '/partials/x-personal-page.html', controller: 'xpsui:PersonalPageCtrl', permissions:['System User']});
		$routeProvider.when('/statistics', {templateUrl: '/partials/x-registry-view.html', controller: 'xpsui:StatisticsViewCtrl', permissions:['Registry - read']});
		$routeProvider.when('/login', {templateUrl: '/partials/x-login.html', controller: 'xpsui:SecurityLoginCtrl'});
		$routeProvider.when('/personal-change-password', {templateUrl: '/partials/x-personal-change-password.html', controller: 'xpsui:SecurityPersonalChangePasswordCtrl', permissions:['System User']});
		$routeProvider.when('/security/group/edit/', {templateUrl: '/partials/x-security-group-edit.html', controller: 'xpsui:SecurityGroupEditCtrl', permissions:['Security - read']});
		$routeProvider.when('/security/user/edit', {templateUrl: 'partials/x-security-user-edit.html', controller: 'xpsui:SecurityUserEditCtrl',permissions:['Security - read']});
		$routeProvider.when('/security/profile/edit', {templateUrl: 'partials/x-security-profile-edit.html', controller: 'xpsui:SecurityProfileEditCtrl',permissions:['Security - read']});
	
		$routeProvider.when('/registry/new/:schema', {templateUrl: '/partials/x-registry-new.html', controller: 'xpsui:RegistryNewCtrl',permissions:['Registry - write']});
		$routeProvider.when('/registry/view/:schema/:id', {templateUrl: '/partials/x-registry-view.html', controller: 'xpsui:RegistryViewCtrl',permissions:['Registry - read']});
		$routeProvider.when('/search/:entity', {templateUrl : 'partials/x-generic-search.html', controller : 'xpsui:SearchCtrl'});

		$routeProvider.when('/schema/edit', {templateUrl: 'partials/x-schema-editor.html', controller: 'xpsui:SchemaEditCtrl' ,permissions:['System Admin']});
		
		$routeProvider.otherwise({templateUrl: '/partials/x-login.html', controller: 'xpsui:SecurityLoginCtrl'});
		
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
