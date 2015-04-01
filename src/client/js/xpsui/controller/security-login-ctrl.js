(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:SecurityLoginCtrl', [ 
		'$scope', 'xpsui:SecurityService', 
		'$rootScope', 
		'$location',
		'xpsui:NotificationFactory', 
		'xpsui:NavigationService' ,
		function($scope, SecurityService, $rootScope, $location,notificationFactory, navigationService) {
			// FIXME remove this in production
			// $scope.user = 'johndoe';
			// $scope.password = 'johndoe';
			$scope.user = '';
			$scope.password = '';

			/**
			 * Login button click
			 */
			$scope.login = function() {
				SecurityService.getLogin($scope.user, $scope.password).success(function(user) {
					if (user.systemCredentials.profiles.length>1){
						$scope.profiles=user.systemCredentials.profiles;
					}
					else {
						SecurityService.selectProfile(user.systemCredentials.profiles[0].id).success(function(){
							SecurityService.getCurrentUser().success(function(data){
							$rootScope.security.currentUser=data;
							
							if (!navigationService.back()) {
								$location.path('/personal-page');
							}
							});
						});
					}
				}).error(function(err) {
					if (err){
						console.log(err);
					}
					delete $rootScope.security.currentUser;
					var mes = {translationCode:'login.authentication.failed',time:5000};
					notificationFactory.error(mes);
				});
			};

			$scope.selectProfile=function(){
				if (!$scope.selectedProfile) return;
				SecurityService.selectProfile($scope.selectedProfile.id).success(function(){
					 SecurityService.getCurrentUser().success(function(data){
						$rootScope.security.currentUser=data;
						if (!navigationService.back()) {
							$location.path('/personal-page');
						}
					});
				});
			};

			$scope.resetPassword = function() {
				SecurityService.getResetPassword($scope.user);
			};
		} 
	]);

}(window.angular));