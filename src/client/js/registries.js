angular.module('registries', [
		'ngRoute',
		'ngCookies',
		'security',
		'personal-page',
		'statistics',
		'massmailing',
		'schema-editor',
		'generic-search',
		'registry',
		'ui.ace',
		'psui',
		'psui-uploadable-image',
		'psui-uploadable-file',
		'psui-imageresizor',
		'psui-datepicker',
		'psui-notification',
		'psui-validity-mark',
		'pascalprecht.translate',
		'psui-objectlink',
		'psui-selectbox',
		'portal-editor'
])
.config(['$routeProvider','$httpProvider', function($routeProvider,$httpProvider) {
	$routeProvider.when('/personal-page', {templateUrl: '/partials/personal-page.html', controller: 'personalPageCtrl', permissions:['System User']});
	$routeProvider.when('/statistics', {templateUrl: '/partials/registry-view.html', controller: 'statistics.viewCtrl', permissions:['Registry - read']});
	$routeProvider.when('/massmailing', {templateUrl: '/partials/massmailing.html', controller: 'massmailing.editCtrl', permissions:['Registry - write']});
	$routeProvider.when('/login', {templateUrl: '/partials/login.html', controller: 'security.loginCtrl'});
	$routeProvider.when('/personal-change-password', {templateUrl: '/partials/personal-change-password.html', controller: 'security.personalChangePasswordCtrl', permissions:['System User']});
	$routeProvider.when('/security/group/edit/', {templateUrl: '/partials/security-group-edit.html', controller: 'security.groupEditCtrl', permissions:['Security - read']});
	$routeProvider.when('/security/user/edit', {templateUrl: 'partials/security-user-edit.html', controller: 'security.userEditCtrl',permissions:['Security - read']});
	$routeProvider.when('/security/profile/edit', {templateUrl: 'partials/security-profile-edit.html', controller: 'security.profileEditCtrl',permissions:['Security - read']});
	$routeProvider.when('/registry/new/:schema', {templateUrl: '/partials/registry-new.html', controller: 'registry.newCtrl',permissions:['Registry - write']});
	$routeProvider.when('/registry/view/:schema/:id', {templateUrl: '/partials/registry-view.html', controller: 'registry.viewCtrl',permissions:['Registry - read']});
	$routeProvider.when('/registry/custom/:template/:schema/:id', {templateUrl: function(params) {
		return '/dataset/get/partials/' + params.template;
	}, controller: 'registry.customTemplateCtrl',permissions:['Registry - read']});

	$routeProvider.when('/registry/generated/:schemaFrom/:idFrom/:generateBy/:template', {templateUrl: function(params) {
		return '/dataset/get/partials/' + params.template;
	}, controller: 'registry.customGenerateToTemplateCtrl',permissions:['Registry - read']});

	$routeProvider.when('/portal/edit/:id?', {templateUrl: '/partials/portal-edit.html', controller: 'portal-editor.editCtrl',permissions:['Registry - write']});
	$routeProvider.when('/portal/menu', {templateUrl: '/partials/portal-menu.html', controller: 'portal-editor.menuCtrl',permissions:['Registry - write']});

	$routeProvider.otherwise({templateUrl: '/partials/login.html', controller: 'security.loginCtrl'});
}])
.config(['$httpProvider', function ($httpProvider) {
	$httpProvider.interceptors.push(function ($q,$injector,$rootScope) {
		return {
			'response': function (response) {
				//Will only be called for HTTP up to 300
				return response;
			},
			'responseError': function (rejection) {
				if (rejection.status === 500) {
					$injector.get ('psui.notificationFactory').warn({translationCode:'server.side.exception',translationData:rejection.data,time:5000} );
				}else
				if (rejection.status === 401) {
					$rootScope.security.currentUser = undefined;
					$rootScope.app.mainMenu=false;
					$injector.get ('$location').url('/login');
					$injector.get ('psui.notificationFactory').warn({translationCode:'security.user.session.expired',time:5000} );
				}else

				if (rejection.status === 403) {
				  $injector.get ('$location').url('/login');
				  $injector.get('psui.notificationFactory').warn({translationCode:'security.user.missing.permissions',translationData:rejection.data.missingPerm,time:5000});
				}else
				return $q.reject(rejection);
			}
		};
	});
}])
//

/**
 * Main function, initializes all required data and scopes. For configuration of $providers
 * use .config
 */
.run(["$rootScope", '$location', 'security.SecurityService', '$cookies','psui.notificationFactory', function($rootScope, $location, SecurityService,$cookies,notificationFactory) {
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
