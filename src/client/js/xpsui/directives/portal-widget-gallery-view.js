(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetGalleryView', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetGalleryView',
				index: '='
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-gallery-view Link');

				elm.empty();
				elm.addClass('x-portal-widget-edit');


				var content = angular.element('<div style="padding-left: 2px;">' +
						'<div ng-repeat="photo in data.data.images" style="display: inline-block; padding-left: 1px;">' +
								'<img ng-src="{{photo.img}}" style="width: 162px !important; height: 123px !important; margin:0;" ng-click="show($index);"></img>' +
						'</div>' +
					'</div>');

				var viewer = angular.element('<div ng-show="viewerVisible" style="z-index: 100; position: fixed; top: 0; height:100%; left:0; width: 100%; display: table;">' +
						'<div style="display: table-cell; vertical-align: middle; width: 625px; margin-left: auto; margin-right: auto;">'+
						'<div style="display: block; vertical-align: middle; width: 676px; min-height: 535px; margin-left: auto; margin-right: auto; position: relative; background-color: white; box-shadow: 0 3px 3px gray;">'+
							'<div ng-repeat="photo in data.data.images" ng-show="visibleIndex == $index" style="display: inline-block; padding-left: 1px; position: absolute; top: 10px; bottom: 10px; left: 10px; right: 10px;">' +
									'<img ng-src="{{photo.img}}" style="width: 656px !important; height: 492px !important; margin:0;"></img>' +
									'<div style="position: absolute; bottom: 0; left: 0;">' +
										'<i class="glyphicon-chevron-left" ng-click="photoLeft();"></i>'+
										'<i class="glyphicon-chevron-right" ng-click="photoRight();"></i>'+
									'</div>'+
									'<div style="position: absolute; bottom: 0; right: 0; font-size: 18px;">' +
										'<i class="glyphicon-remove" ng-click="close();"></i>'+
									'</div>'+
							'</div>' +
						'</div>' +
						'</div>' +
					'</div>');

				scope.viewerVisible = false;

				scope.visibleIndex = 0;

				scope.show = function(idx) {
					scope.viewerVisible = true;
					scope.visibleIndex = idx;
				};

				scope.close = function(idx) {
					scope.viewerVisible = false;
				};

				scope.photoLeft = function() {
					--scope.visibleIndex;

					if (scope.visibleIndex < 0) {
						scope.visibleIndex = scope.data.data.images.length-1;
					}
				};
				scope.photoRight = function() {
					++scope.visibleIndex;

					if (scope.visibleIndex > scope.data.data.images.length-1) {
						scope.visibleIndex = 0;
					}
				};

				elm.append(content);
				elm.append(viewer);

				$compile(content)(scope);
				$compile(viewer)(scope);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));


