(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiStringView', ['xpsui:logging', function(log) {
		return {
			restrict: 'A',
			require: ['ngModel'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('String view Link');

				var ngModel = ctrls[0];
				var view = angular.element('<div></div>');

				elm.addClass('x-control');
				elm.addClass('x-string-view');

				ngModel.$render = function() {
					if (ngModel && ngModel.$viewValue || ngModel.$viewValue===0 ) {
						if (isNaN(ngModel.$viewValue) && ngModel.$viewValue.replace){
							view.html(ngModel.$viewValue.replace(/(?:\r\n|\r|\n)/g, '<br />'));
						}
						else {
							view.html(ngModel.$viewValue);
						}
					} else {
						view.text(' ');
					}
				};

				elm.append(view);
				log.groupEnd();
			}
		};
	}]);

}(window.angular));
