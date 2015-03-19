(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	/**
	* Controller used to handele Forgotten Password Page.
	* Page Form reads user email and recaptcha.
	* <br> Controller does:
	* <li> reads Captcha Site Key
	* <li> recreates captcha compoment
	* <li> handles submit to send captha and email address
	* <li> handles potential backend validation  errors
	* @method security.forgottenCtrl
	*/
	.controller('xpsui:SecurityForgottenCtrl', [ '$scope', 'xpsui:SecurityService', '$rootScope', '$location','$timeout','xpsui:NotificationFactory','$window','reCAPTCHA', function($scope, SecurityService, $rootScope, $location,$timeout,notificationFactory,$window,reCAPTCHA) {
		$scope.email = '';
		$scope.capcha = '';
		$scope.done=false;


		SecurityService.getCaptchaKey().success(function(json){
			reCAPTCHA.destroy();
			reCAPTCHA.setPublicKey(json.key);
			reCAPTCHA.create('captcha');
			reCAPTCHA.reload();
		}).error(
			function(err,data) {
				var mes = {translationCode:err.code,translationData:err.data,time:3000};
				notificationFactory.error(mes);
			}
		);


		$scope.submit=function(){
			SecurityService.getForgotenToken($scope.email, {challenge:reCAPTCHA.challenge(),response:reCAPTCHA.response()}).success(function(data) {
				var mes = {translationCode:'security.forgotten.token.generated',time:3000};

				notificationFactory.info(mes);
				$scope.done=true;

				$timeout(function(){$location.path('/'); },5000);
			}).error(function(err,data) {
				var mes = {translationCode:err.code,translationData:err.data,time:3000};
				notificationFactory.error(mes);
				$window.Recaptcha.reload();
			});
		}
	} ]);

}(window.angular));
