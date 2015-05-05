(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetImage1170View', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetImage1170View'
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-image1170-view Link');

				elm.empty();
				elm.addClass('x-portal-widget-view');
//width: 656px !important; height: 492px !important; 
				var content = angular.element('<div class="psui-wrapper" style="text-align: center;"><img ng-src="{{data.data.img}}" style="margin:0;"></img></div>');

				elm.append(content);

				$compile(content)(scope);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));


