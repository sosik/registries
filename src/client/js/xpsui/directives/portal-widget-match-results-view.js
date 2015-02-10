(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetMatchResultsView', ['xpsui:logging', '$compile', '$sce', function(log, $compile, $sce) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetMatchResultsView'
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-match-results-view Link');

				elm.empty();
				elm.addClass('x-portal-widget-view');

				var content = angular.element(scope.data.meta.element);
				content.attr('ng-bind-html', 'makeSafe(data.data);');

				elm.append(content);

				$compile(content)(scope);

				log.groupEnd();

				scope.makeSafe = function(str) {
					if (typeof str === 'string') {
						return $sce.trustAsHtml(str);
					}

					return '';
				};

			}
		};
	}]);

}(window.angular));

