(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetFileListEdit', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetFileListEdit',
				index: '='
			},
			require: ['^xpsuiPortalArticleContentEdit'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-file-list-edit Link');

				elm.empty();
				elm.addClass('x-portal-widget-edit');

				var titleBar = angular.element('<div class="xpsui-portal-widget-title-bar">{{data.meta.type}}:{{data.meta.name}}<div class="pull-right"><i class="action-button icon-add" ng-click="add();"></i><i class="action-button icon-chevron-up" ng-click="moveUp();"></i><i class="action-button icon-chevron-down" ng-click="moveDown();"></i><i class="action-button icon-trash" ng-click="remove();"></i></div></div>');

				var content = angular.element('<div style="padding-left: 1px;">' +
						'<div ng-repeat="file in data.data.files" class="psui-wrapper" style="padding: 10px; position: relative;">' +
							'<div style="position: absolute; right: 5px; top: 10px;">' +
								'<i class="action-button icon-chevron-left" ng-click="photoLeft($index);"></i>'+
								'<i class="action-button icon-trash" ng-click="photoRemove($index);"></i>'+
								'<i class="action-button icon-chevron-right" ng-click="photoRight($index);"></i>'+
							'</div>' +
								'<div><div xpsui-uploadable-file ng-model="data.data.files[$index]"></div></div>' +
						'</div>' +
					'</div>');
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

				scope.add = function() {
					scope.data.data.files.push({
					});
				};

				scope.photoLeft = function(idx) {
					if (idx > 0) {
						var tmp = scope.data.data.files[idx];
					
						scope.data.data.files.splice(idx, 1);
						scope.data.data.files.splice(idx-1, 0, tmp);
					}
				};

				scope.photoRight = function(idx) {
					if (idx < scope.data.data.files.length - 1) {
						var tmp = scope.data.data.files[idx];
					
						scope.data.data.files.splice(idx, 1);
						scope.data.data.files.splice(idx+1, 0, tmp);
					}
				};

				scope.photoRemove = function(idx) {
						scope.data.data.files.splice(idx, 1);
				};

				log.groupEnd();
			}
		};
	}]);

}(window.angular));
