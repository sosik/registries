(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetMatchResultsEdit', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetMatchResultsEdit',
				index: '='
			},
			require: ['^xpsuiPortalArticleContentEdit'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-match-results-edit Link');

				elm.empty();
				elm.addClass('x-portal-widget-edit');

				var titleBar = angular.element('<div class="xpsui-portal-widget-title-bar">{{data.meta.type}}:{{data.meta.name}}<div class="pull-right"><i class="action-button icon-chevron-up" ng-click="moveUp();"></i><i class="action-button icon-chevron-down" ng-click="moveDown();"></i><i class="action-button icon-trash" ng-click="remove();"></i></div></div>');
				var content = angular.element(scope.data.meta.element);
				content.attr('ng-model', 'data.data');
				content.attr('xpsui-contenteditable', 'false');

				elm.append(titleBar);
				elm.append(content);

				$compile(titleBar)(scope);
				$compile(content)(scope);

				scope.moveUp = function() {
					ctrls[0].moveUp(scope.index);
				};

				scope.moveDown = function() {
					ctrls[0].moveDown(scope.index);
				};

				scope.remove = function() {
					ctrls[0].remove(scope.index);
				};

				log.groupEnd();
			}
		};
	}]);

}(window.angular));

