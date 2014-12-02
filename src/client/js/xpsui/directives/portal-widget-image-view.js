(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetImageView', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetImageView'
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-image-view Link');

				elm.empty();
				elm.addClass('x-portal-widget-view');

				var content = angular.element('<div class="psui-wrapper" style="text-align: center;"><img ng-src="{{data.data.img}}" style="width: 656px !important; height: 492px !important; margin:0;"></img></div>');

				elm.append(content);

				$compile(content)(scope);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));


