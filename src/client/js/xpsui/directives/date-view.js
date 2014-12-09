(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiDateView', ['xpsui:logging','xpsui:DateUtil', function(log, dateUtil) {
		return {
			restrict: 'A',
			require: ['ngModel'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('String view Link');

				var ngModel = ctrls[0];
				var view = angular.element('<div></div>');

				elm.addClass('x-control');
				elm.addClass('x-date-view');

				ngModel.$render = function() {
					view.text(dateUtil.formatter(ngModel.$viewValue) || ' ');	
				};

				elm.append(view);
				log.groupEnd();
			}
		};
	}]);

}(window.angular));
