(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')

	.controller('xpsui:SecurityForgottenResetCtrl', [ '$scope', 'xpsui:SecurityService', '$routeParams', '$location','$timeout','xpsui:NotificationFactory', function($scope, SecurityService, $routeParams, $location,$timeout,notificationFactory) {

		var token=$routeParams.token;
		$scope.done=false;

		SecurityService.getForgotenPasswordReset(token).success(function(data) {
			var mes = {translationCode:'security.forgotten.reset.done',time:3000};
			notificationFactory.info(mes);
			$timeout(function(){	$location.path('/');},5000);
		}).error(function(err,data) {
			var mes = {translationCode:err.code,translationData:err.data,time:3000};
			notificationFactory.error(mes);
		});


	} ]);

}(window.angular));
