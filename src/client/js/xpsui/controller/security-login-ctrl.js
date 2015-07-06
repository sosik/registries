(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:SecurityLoginCtrl', [ 
		'$scope', 'xpsui:SecurityService', 
		'$rootScope', 
		'$location',
		'xpsui:NotificationFactory', 
		'xpsui:NavigationService' ,
		'$localStorage',
		'$cordovaIMEI',
		function($scope, SecurityService, $rootScope, $location,notificationFactory, navigationService, $localStorage, $sessionStorage, $cordovaIMEI) {
			// FIXME remove this in production
			// $scope.user = 'johndoe';
			// $scope.password = 'johndoe';
			$scope.user = '';
			$scope.password = '';
			var uuidbuffer = '';
			var rem = 'false';
			var imei = $cordovaIMEI.get();
			onsole.log("the imei:", imei);
			if($localStorage.uuid == null){
				uuidbuffer = uuid.v4(); // (or 'new Buffer' in node.js)
				$scope.$storage = $localStorage.$default({
					rememberme: false,
					uuid: uuidbuffer,
					profile: '',
				});
			} else {
				$scope.$storage = $localStorage;
				
			}
			var uuidbuffer = uuid.v4(); // (or 'new Buffer' in node.js)
			$scope.$storage = $localStorage.$default({
				rememberme: false,
				uuid: uuidbuffer,
				profile: '',
			});
			$scope.checkboxModel = {
					value : false
			};
			$scope.$storage.rememberme = $localStorage.rememberme;
			//console.log($scope.$storage.rememberme);
			var remembermeelement = document.getElementById('x-rememberme-chk');
			if($scope.$storage.rememberme){
				$scope.checkboxModel.value = true;
				remembermeelement.setAttribute('checked','checked');
				rem = 'true';
			} else {
				$scope.checkboxModel.value = false;
				$localStorage.$reset();
				remembermeelement.setAttribute('checked','unchecked');
				rem = 'false';
			}
			//console.log(remembermeelement);
			//console.log($scope.checkboxModel);
			/**
			 * Login button click
			 */
			$scope.login = function() {
				SecurityService.getLogin($scope.user, $scope.password, uuidbuffer, rem).success(function(user) {
					if($scope.checkboxModel.value){
						$scope.$storage.rememberme = true;
						$scope.$storage.uuid = uuidbuffer;
						$scope.$storage.profile = user.systemCredentials.profiles[0].id;
					} else {
						$localStorage.$reset();
						$scope.$storage.rememberme = false;
						$scope.$storage.uuid = uuidbuffer;
						$scope.$storage.profile = user.systemCredentials.profiles[0].id;
					}
					if (user.systemCredentials.profiles.length>1){
						$scope.profiles=user.systemCredentials.profiles;
					}
					else {
						SecurityService.selectProfile(user.systemCredentials.profiles[0].id).success(function(){
							SecurityService.getCurrentUser().success(function(data){
							$rootScope.security.currentUser=data;
							console.log(data);
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