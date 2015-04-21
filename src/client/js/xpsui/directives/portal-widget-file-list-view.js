(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetFileListView', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetFileListView',
				index: '='
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-file-list-view Link');

				elm.empty();
				elm.addClass('x-portal-widget-edit');


				var content = angular.element('<div style="padding-left: 2px;">' +
						'<div ng-repeat="file in data.data.files" style="padding: 6px 6px;">' +
								'<a href="/uploads/get/{{file.fileId}}" target="_blank" ng-click="$event.stopPropagation();" download="{{file.fileName}}">{{file.fileName}}</a>' +
						'</div>' +
					'</div>');

				elm.append(content);

				$compile(content)(scope);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));
