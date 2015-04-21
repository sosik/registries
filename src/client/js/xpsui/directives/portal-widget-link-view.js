(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetLinkView', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetLinkView'
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-link-view Link');

				elm.empty();
				elm.addClass('x-portal-widget-view');
				var target = scope.data.data.newWindow?' target="_blank" ': ' ';
				var content = angular.element('<div class="psui-wrapper" style="text-align: left; padding: 10px;"><a href="{{data.data.href|httpPrefixed}}" ' + target + ' >{{data.data.title}}</a></div>');

				elm.append(content);

				$compile(content)(scope);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));


