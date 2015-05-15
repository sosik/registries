(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetPureHtmlEdit', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetPureHtmlEdit',
				index: '='
			},
			require: ['^xpsuiPortalArticleContentEdit'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-pure-html-edit Link');

				elm.empty();
				elm.addClass('x-portal-widget-edit');

				var titleBar = angular.element('<div class="xpsui-portal-widget-title-bar">{{data.meta.type}}:{{data.meta.name}}<div class="pull-right"><i class="action-button icon-chevron-up" ng-click="moveUp();"></i><i class="action-button icon-chevron-down" ng-click="moveDown();"></i><i class="action-button icon-trash" ng-click="remove();"></i></div></div>');
				var content = angular.element('<div style="background-color: black; padding: 10px;"></div>');
				var contentInner = angular.element(scope.data.meta.element);
				contentInner.attr('ng-model', 'data.data');
				contentInner.attr('xpsui-contenteditable', 'true');
				content.append(contentInner);
				content.append('<div style="background-color: white; padding: 2px;">CSS Class: <input ng-model="data.css.cssClass"/></div>');

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

