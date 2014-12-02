(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetShowcaseEdit', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetShowcaseEdit',
				index: '='
			},
			require: ['^xpsuiPortalArticleContentEdit'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-category-edit Link');

				elm.empty();
				elm.addClass('x-portal-widget-edit');

				var titleBar = angular.element('<div class="xpsui-portal-widget-title-bar">{{data.meta.type}}:{{data.meta.name}}<div class="pull-right"><i class="action-button glyphicon-arrow-up" ng-click="moveUp();"></i><i class="action-button glyphicon-arrow-down" ng-click="moveDown();"></i><i class="action-button glyphicon-trash" ng-click="remove();"></i></div></div>');
				var content = angular.element(
					'<form class="form">'
					+'<fieldset class="form-group" style="background-color: black; padding: 10px;" ng-show="mode !== \'edit\'">'
					+'<div style="background-color: white; padding-top: 10px; padding-bottom: 10px;">'
					+'<div class="form-group row">'
					+' <label class="col-sm-2 control-label">Tagy:</label>'
					+' <div class="col-sm-4"><div class="input-group"><div portal-multistring-edit ng-model="data.data.tags"></div></div></div>'
					+'</div>'
					+'</div>'
					+'</fieldset>'
					+'</form>');


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


