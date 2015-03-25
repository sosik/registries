(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller( 'xpsui:SecurityPersonalChangePasswordCtrl', [ 
		'$scope', 
		'xpsui:SecurityService', 
		'$rootScope', 
		'$location', 
		'xpsui:NotificationFactory',
		function($scope, SecurityService, $rootScope, $location, notificationFactory) {
			$scope.currentPassword = '';
			$scope.newPassword = '';
			$scope.newPasswordCheck = '';

			$scope.changePassword = function() {
				if ($scope.newPassword !== $scope.newPasswordCheck) {
			var mes = {translationCode:'personal.change.password.passwords.not.equal'};
			notificationFactory.warn(mes);
				} else {
					SecurityService.getChangePassword($scope.currentPassword, $scope.newPassword).success(function(data) {
				var mes = {translationCode:'personal.change.password.password.changed'};
				notificationFactory.info(mes);
					}).error(function(err, data) {
						if (data == 400) {
							var mes = {translationCode: err.code,translationData:data,time:3000};
							notificationFactory.error(mes);
						} else {
							var mes = {translationCode:'security.user.missing.permissions',translationData:data,time:3000};
							notificationFactory.error(mes);
						}
					});
				}
			};
		} 
	]);
	
}(window.angular));