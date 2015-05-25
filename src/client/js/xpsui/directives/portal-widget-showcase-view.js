(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetShowcaseView', ['xpsui:logging', '$compile', '$http', '$sce', '$route', '$interval', '$location', function(log, $compile, $http, $sce, $route, $interval, $location) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetShowcaseView'
			},
			template: '<article ng-repeat="c in model" ng-show="visibleIndex == $index || visibleIndex == \'no\'">'
				+ '<div class="x-portal-widget-showcase-diamond only-location"><div class="x-portal-widget-showcase-diamond-inner"></div></div>'
				+ '<div ng-show="c.img.img" class="x-portal-widget-showcase-image" style="background: url(\'{{c.img.img}}\'); background-repeat: no-repeat; background-size: cover; height: 492px; width: 100%;"></div>'
				+ '<div ng-show="c.img.img" class="x-portal-widget-showcase-textblock"><a ng-click="navigate(c.id)" ng-bind-html="makeSafe(c.title)"></a><div ng-bind-html="makeSafe(c.abstract)"></div></div>'
				+ '<div ng-show="c.img1170.img" style="background: url(\'{{c.img1170.img}}\'); background-repeat: no-repeat; background-size: cover; height: 570px; width: 100%;"></div>'
				+ '<div ng-show="c.img1170.img" class="x-portal-widget-showcase-textblock"><a ng-click="navigate(c.id)" ng-bind-html="makeSafe(c.title)"></a></div>'
				+ '</article>',
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-category-view Link');

				elm.addClass('x-portal-widget-showcase');

				scope.model = [];

				scope.visibleIndex = 0;

				elm.css('height', '492px');

				if (attrs.class.indexOf('portal-content-location') < 0) {
					$interval(function() {
						++scope.visibleIndex;
						if (scope.visibleIndex >= scope.model.length) {
							scope.visibleIndex = 0;
						}
					}, 5000);
				} else {
					scope.visibleIndex = 'no';
				}

				function findFirstOfType(obj, type) {
					for (var j = 0; j < obj.length; ++j) {
						if (obj[j].meta.name === type) {
							return obj[j].data;
						}
					}
				}

				scope.makeSafe = function(str) {
					if (typeof str === 'string') {
						return $sce.trustAsHtml(str);
					}

					return '';
				};

				$http({
					method : 'POST',
					url: '/portalapi/getByTags',
					data: {
						tags: scope.data.data.tags
					}
				})
				.success(function(data, status, headers, config){
					if (data && data.length > 0) {
						scope.model = [];
					   	for (var i = 0; i < data.length; ++i) {
							scope.model.push({
								id: data[i].id,
								title: findFirstOfType(data[i].data, 'title'),
								abstract: findFirstOfType(data[i].data, 'abstract'),
								img: findFirstOfType(data[i].data, 'image'),
								img1170: findFirstOfType(data[i].data, 'image1170'),
								video: findFirstOfType(data[i].data, 'video'),
								content: findFirstOfType(data[i].data, 'content')
							});
							if (findFirstOfType(data[i].data, 'image1170')) {
								elm.css('height', '570px');
							}
					   }
				
						console.log(scope.model);
					}
				}).error(function(err) {
					notificationFactory.error(err);
				});

				scope.navigate = function(aid) {
					$location.path('/portal/edit/'+ aid);
					//$route.updateParams({id: aid});
				};

				log.groupEnd();
			}
		};
	}]);

}(window.angular));


