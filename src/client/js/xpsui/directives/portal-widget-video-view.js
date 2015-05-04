(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetVideoView', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetVideoView'
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-video-view Link');

				elm.empty();
				elm.addClass('x-portal-widget-view');

				var content = angular.element(
						'<div class="psui-wrapper" style="text-align: center;">'
						+ '  <iframe width="560" height="315" src="' + scope.data.data.src + '" frameborder="0" allowfullscreen></iframe>'
						+ '  <h3>{{data.data.title}}</h3>'
						+ '  <h3>{{data.data.subTitle}}</h3>'
						+ scope.data.data.text
						+ '</div>');

				elm.append(content);

				$compile(content)(scope);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));


