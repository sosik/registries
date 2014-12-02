(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetGalleryEdit', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetGalleryEdit',
				index: '='
			},
			require: ['^xpsuiPortalArticleContentEdit'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-gallery-edit Link');

				elm.empty();
				elm.addClass('x-portal-widget-edit');

				var titleBar = angular.element('<div class="xpsui-portal-widget-title-bar">{{data.meta.type}}:{{data.meta.name}}<div class="pull-right"><i class="action-button glyphicon-plus-sign" ng-click="add();"></i><i class="action-button glyphicon-arrow-up" ng-click="moveUp();"></i><i class="action-button glyphicon-arrow-down" ng-click="moveDown();"></i><i class="action-button glyphicon-trash" ng-click="remove();"></i></div></div>');
//				var content = angular.element('<div class="psui-wrapper" style="text-align: center;"><psui-uploadable-image psui-imageresizor="" psui-imageresizor-width="656" psui-imageresizor-height="492" ng-model="data.data.img" style="width: 656px !important; height: 492px !important; background-image: url(https://localhost:3443/img/no_image.jpg); margin:0;"></psui-uploadable-image></div>');

				var content = angular.element('<div style="padding-left: 1px;">' +
						'<div ng-repeat="photo in data.data.images" class="psui-wrapper" style="display: inline-block; padding: 0px; position: relative;">' +
							'<div style="position: absolute; left: 5px; top: 5px;">' +
								'<i class="action-button glyphicon-arrow-left" ng-click="photoLeft($index);"></i>'+
								'<i class="action-button glyphicon-trash" ng-click="photoRemove($index);"></i>'+
								'<i class="action-button glyphicon-arrow-right" ng-click="photoRight($index);"></i>'+
							'</div>' +
								'<psui-uploadable-image psui-imageresizor="" psui-imageresizor-width="656" psui-imageresizor-height="492" ng-model="photo.img" style="width: 162px !important; height: 123px !important; background-image: url(https://localhost:3443/img/no_image.jpg); margin:0;">' +
							'</psui-uploadable-image>' +
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
					scope.data.data.images.push({
					});
				};

				scope.photoLeft = function(idx) {
					if (idx > 0) {
						var tmp = scope.data.data.images[idx];
					
						scope.data.data.images.splice(idx, 1);
						scope.data.data.images.splice(idx-1, 0, tmp);
					}
				};

				scope.photoRight = function(idx) {
					if (idx < scope.data.data.images.length - 1) {
						var tmp = scope.data.data.images[idx];
					
						scope.data.data.images.splice(idx, 1);
						scope.data.data.images.splice(idx+1, 0, tmp);
					}
				};

				scope.photoRemove = function(idx) {
						scope.data.data.images.splice(idx, 1);
				};

				log.groupEnd();
			}
		};
	}]);

}(window.angular));


