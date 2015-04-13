(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiUploadableImageView', ['xpsui:NotificationFactory', function(notificationFactory) {
		return {
			restrict: 'A',
			require: ['?ngModel'],
			scope: true,
			controller: function() {
			},
			link: function(scope, elm, attrs, ctrls) {
				var imgWidth = attrs.psuiWidth || 0;
				var imgHeight = attrs.psuiHeight || 0;

				elm.attr('style', 
					(imgHeight ? 'height:'+imgHeight+'px !important;':'')
				);

				elm.addClass('xpsui-uploadable-image-view');

				var ngModel = ctrls[0];
				if (ngModel) {
					ngModel.$render = function() {
						elm.css('background-image', 'url('+(ngModel.$viewValue || 'img/no_photo.jpg')+')');
					};

				}
				
			}
		}
	}]);

}(window.angular));