(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiDashboardWidgetEmpty', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			link: function(scope, elm, attrs, ctrls) {
				log.group('xpsui-dashboard-widget-empty Widget');
				console.log('hello!');

				elm.empty();

				elm.addClass('dashboard-widget-container');
				var titleBar = angular.element('<div class="dashboard-widget-title">Empty widget</div>');
				var content = angular.element(
					'<div class="dashboard-widget-content">'
					+ 'Empty widget content.<br/>'
					+ '</div>');

				elm.append(titleBar);
				elm.append(content);

				$compile(titleBar)(scope);
				$compile(content)(scope);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));
