(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiNotification', ['$rootScope','$timeout', '$compile'/*, '$transate'*/,
		function ($rootScope, $timeout, $compile/*, $translate*/) {
			return {
				restrict: 'AE',
				link: function(scope, elm, attrs, ctrls) {
					elm.addClass('x-notification');
					$rootScope.psuiNotification = ( $rootScope.psuiNotification || {} );
					$rootScope.psuiNotification.message = ( $rootScope.psuiNotification.message || [] );
					scope.$watchCollection('psuiNotification.message', function(newNames,oldNames){
						for (var i = 0; i < $rootScope.psuiNotification.message.length; i++ ){					
							if (!($rootScope.psuiNotification.message[i].element)){
								if($rootScope.psuiNotification.message[i].translationCode){
								//	$translate($rootScope.psuiNotification.message[i].translationCode).then(function(notif){
									$rootScope.psuiNotification.message[i].element = $compile(angular.element('<div class="x-notification-'+ $rootScope.psuiNotification.message[i].type +'">{{\''+ $rootScope.psuiNotification.message[i].translationCode +'\' | translate:\'{data:"'+ $rootScope.psuiNotification.message[i].translationData +'"}\'}}</div>'))(scope);
								//	});
									
								} else {
									$rootScope.psuiNotification.message[i].element = angular.element('<div class="x-notification-'+ $rootScope.psuiNotification.message[i].type +'">'+ $rootScope.psuiNotification.message[i].text +'</div>');
								}
								elm.append($rootScope.psuiNotification.message[i].element);
								if ($rootScope.psuiNotification.message[i].deletable){
									var buttonDelete = angular.element('<button type="button"></button>');
									$rootScope.psuiNotification.message[i].element.append(buttonDelete);
									$rootScope.psuiNotification.message[i].button = buttonDelete;
									var searchedMessage = $rootScope.psuiNotification.message[i];
									buttonDelete.on('click',function(evt){
										for (var j = 0; j < $rootScope.psuiNotification.message.length; j++ ){
											if ($rootScope.psuiNotification.message[j].button[0] == this) {
												$rootScope.psuiNotification.message[j].element.remove();
												$rootScope.psuiNotification.message.splice(j,1);
											}
										}
									})
								}
								
								
								
								if ($rootScope.psuiNotification.message[i].time > 0){
									var searchedMsg = $rootScope.psuiNotification.message[i];
									var messageHide = function(){
										for (var z = 0; z < $rootScope.psuiNotification.message.length; z++ ){
											if ($rootScope.psuiNotification.message[z] == searchedMsg) {
												$rootScope.psuiNotification.message[z].element.remove();
												$rootScope.psuiNotification.message.splice(z,1);
											}
										}
									}
									$rootScope.psuiNotification.message[i].timeout = $timeout( messageHide,searchedMsg.time, false);
								}
								
							}
						}
					})
				}
			}
		}
	]);

}(window.angular));
