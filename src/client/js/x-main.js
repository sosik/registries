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
		'ui.ace',
		'reCAPTCHA'

		// 'x-security',
		// 'personal-page',
		// 'psui-notification'
	])
	.config(['$httpProvider', function ($httpProvider) {
		$httpProvider.interceptors.push(function ($q,$injector,$rootScope) {
			return {
				'response': function (response) {
					//Will only be called for HTTP up to 300
					return response;
				},
				'responseError': function (rejection) {
					if (rejection.status === 500) {
						$injector.get ('xpsui:NotificationFactory').warn({translationCode:'server.side.exception',translationData:rejection.data,time:5000} );
					}else
					if (rejection.status === 401) {
						$rootScope.security.currentUser = undefined;
						$rootScope.app.mainMenu=false;
						$injector.get ('xpsui:NavigationService').navigate();
						$injector.get ('$location').url('/login');
						$injector.get ('xpsui:NotificationFactory').warn({translationCode:'security.user.session.expired',time:5000} );
					}else

					if (rejection.status === 403) {
						$injector.get ('xpsui:NavigationService').navigate();
						$injector.get ('$location').url('/login');
						$injector.get('xpsui:NotificationFactory').warn({translationCode:'security.user.missing.permissions',translationData:rejection.data.missingPerm,time:5000});
					} else
					return $q.reject(rejection);
				}
			};
		});
	}])
	.config(['reCAPTCHAProvider',function (reCAPTCHAProvider) {
				// required: please use your own key :)
				reCAPTCHAProvider.setPublicKey('6LfOUQITAAAAAOgMxsnYmhkSY0lZw0tej0C4N2XS-not-used-but-required');

				// optional: gets passed into the Recaptcha.create call
				reCAPTCHAProvider.setOptions({
					theme: 'clean'
				});
			}])
	.config(['$routeProvider', 'xpsui:loggingProvider',function($routeProvider, loggingProvider) {
		// $routeProvider.when('/view/:schema/:objId', {controller: 'xViewController', templateUrl: '/partials/x-view.html'});

		$routeProvider.when('/personal-page', {templateUrl: '/partials/x-personal-page.html', controller: 'xpsui:PersonalPageCtrl', permissions:['System User']});
		$routeProvider.when('/statistics', {templateUrl: '/partials/x-registry-view.html', controller: 'xpsui:StatisticsViewCtrl', permissions:['Registry - read']});
		$routeProvider.when('/massmailing', {templateUrl: '/partials/x-massmailing.html', controller: 'xpsui:MassmailingEditCtrl', permissions:['Registry - write']});
		$routeProvider.when('/login', {templateUrl: '/partials/x-login.html', controller: 'xpsui:SecurityLoginCtrl'});
		$routeProvider.when('/personal-change-password', {templateUrl: '/partials/x-personal-change-password.html', controller: 'xpsui:SecurityPersonalChangePasswordCtrl', permissions:['System User']});
		$routeProvider.when('/security/group/edit/', {
			templateUrl: '/partials/x-security-group-edit.html',
			controller: 'xpsui:SecurityGroupEditCtrl',
			permissions:['Security - read'],
			resolve: {
				schema: ['xpsui:SchemaUtil', function (schemaUtilFactory) {
					return schemaUtilFactory.getCompiledSchema('uri://registries/security#groupmaster', 'new').then(function(response) {
						return response.data;
					});
				}]
			}
		});
		$routeProvider.when('/security/user/edit', {templateUrl: 'partials/x-security-user-edit.html', controller: 'xpsui:SecurityUserEditCtrl',permissions:['Security - read']});
		$routeProvider.when('/security/profile/edit', {templateUrl: 'partials/x-security-profile-edit.html', controller: 'xpsui:SecurityProfileEditCtrl',permissions:['Security - read']});

		$routeProvider.when('/forgotten', {templateUrl: '/partials/forgotten.html', controller: 'xpsui:SecurityForgottenCtrl'});
		$routeProvider.when('/forgotten/reset/:token', {templateUrl: '/partials/forgottenReset.html', controller: 'xpsui:SecurityForgottenResetCtrl'});

		$routeProvider.when('/registry/new/:schema', {templateUrl: '/partials/x-registry-new.html', controller: 'xpsui:RegistryNewCtrl'});
		$routeProvider.when('/registry/view/:schema/:id', {templateUrl: '/partials/x-registry-view.html', controller: 'xpsui:RegistryViewCtrl'});
		$routeProvider.when('/search/:entity', {templateUrl : 'partials/x-generic-search.html', controller : 'xpsui:SearchCtrl'});

		$routeProvider.when('/registry/custom/:template/:schema/:id', {templateUrl: function(params) {
			return '/dataset/get/partials/' + params.template;
		}, controller: 'xpsui:RegistryCustomTemplateCtrl',permissions:['Registry - read']});

		$routeProvider.when('/registry/generated/:schemaFrom/:idFrom/:generateBy/:template', {templateUrl: function(params) {
			return '/dataset/get/partials/' + params.template;
		}, controller: 'xpsui:RegistryCustomGenerateCtrl',permissions:['Registry - read']});

		$routeProvider.when('/portal/edit/:id?', {templateUrl: '/partials/x-portal-edit.html', controller: 'xpsui:PortalEditorCtrl',permissions:['Portal - write']});
		$routeProvider.when('/portal/menu', {templateUrl: '/partials/x-portal-menu.html', controller: 'xpsui:PortalEditorMenuCtrl',permissions:['Portal - write']});

		$routeProvider.when('/schema/edit', {
			templateUrl: 'partials/x-schema-editor-index.html',
			controller: 'xpsui:SchemaEditorIndexCtrl',
			permissions: ['System Admin'],
			resolve: {
				schemas: ['xpsui:SchemaEditorService', function (schemaService) {
					return schemaService.getSchemaList().then(function (response) {
						return response.data;
					});
				}]
			}
		});

		$routeProvider.when('/schema/edit/:schema', {
			templateUrl: 'partials/x-schema-editor-show.html',
			controller: 'xpsui:SchemaEditorShowCtrl',
			permissions: ['System Admin'],
			resolve: {
				// Load schema from the server
				schema: ['$route', 'xpsui:SchemaEditorService', function ($route, schemaService) {
					return schemaService.getFileContent($route.current.params.schema).then(function (response) {
						return response.data;
					});
				}]
			}
		});

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
		$rootScope.hasPermissions=SecurityService.hasPermissions;
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
