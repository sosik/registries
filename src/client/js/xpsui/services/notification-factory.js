(function(angular) {
	'use strict';

	angular.module('xpsui:services') 
	.factory('xpsui:NotificationFactory', [ "$rootScope", function($rootScope){
		$rootScope.psuiNotification = ( $rootScope.psuiNotification || {} );
		$rootScope.psuiNotification.message = ( $rootScope.psuiNotification.message || [] );
		
		var defaultMessage = {type:'info',text:'error',deletable : true, time:-1, timeout: null};
		var factory = {};
		
		factory.info = function (message){
			var finalMessage = {};
			angular.copy(defaultMessage,finalMessage);
			if (typeof message == 'string'){
				finalMessage.text = message;
			} else {
				if(message.text || message.translationCode){
					angular.extend(finalMessage,message);
				} else {
					finalMessage.text = "!Nestrukturovana sprava!" + JSON.stringify(message);
				}
			}
			finalMessage.type = 'info';
			$rootScope.psuiNotification.message.push(finalMessage);
		}
		
		factory.warn = function (message){
			var finalMessage = {};
			angular.copy(defaultMessage,finalMessage);
			if (typeof message == 'string'){
				finalMessage.text = message;
			} else {
				if(message.text || message.translationCode){
					angular.extend(finalMessage,message);
				} else {
					finalMessage.text = "!Nestrukturovana sprava!" + JSON.stringify(message);
				}
			}
			finalMessage.type = 'warn';
			$rootScope.psuiNotification.message.push(finalMessage);
		}
		
		factory.error = function (message){
			var finalMessage = {};
			angular.copy(defaultMessage,finalMessage);
			if (typeof message == 'string'){
				finalMessage.text = message;
			} else {
				if(message.text || message.translationCode){
					angular.extend(finalMessage,message);
				} else {
					finalMessage.text = "!Nestrukturovana sprava!" + JSON.stringify(message);
				}
			}
			finalMessage.type = 'error';
			$rootScope.psuiNotification.message.push(finalMessage);
		}
		
		factory.clear = function (){
			for (var i = 0; i < $rootScope.psuiNotification.message.length; i++ ){
				$rootScope.psuiNotification.message[i].element.remove();
			}
			$rootScope.psuiNotification.message = [];
		}
		
		return factory;
	}]);
}(window.angular));