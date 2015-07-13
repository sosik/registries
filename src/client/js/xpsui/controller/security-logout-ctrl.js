(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller(
		'xpsui:SecurityLogoutCtrl',
		[ '$scope', 'xpsui:SecurityService', '$location', '$localStorage',
				function($scope, SecurityService, $location, $localStorage, $sessionStorage) {
					$localStorage.$reset();
					$scope.logout = function() {
						SecurityService.getLogout().then(function() {
							$scope.security.currentUser = undefined;
							$location.path('/login');
						});
					};
				}
	]);
	
}(window.angular));