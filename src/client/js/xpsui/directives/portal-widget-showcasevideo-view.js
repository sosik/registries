(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetShowcasevideoView', ['xpsui:logging', '$compile', '$http', '$sce', '$route', '$interval', '$location', function(log, $compile, $http, $sce, $route, $interval, $location) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetShowcasevideoView'
			},
			// template: '<article ng-repeat="c in model" ng-show="visibleIndex == $index">'
			// 	//+ '<div ng-show="c.img.img" style="background: url(\'{{c.img.img}}\'); background-repeat: no-repeat; background-size: cover; height: 492px; width: 100%;"></div>'
			// 	+ '<iframe width="560" height="315" ng-src="{{ trustResource(c.video.src) }}" frameborder="0" allowfullscreen></iframe>'
			// 	+ '{{ trustResource(c.video.src) }}'
			// 	+ '<div class="x-portal-widget-showcasevideo-textblock"><a ng-click="navigate(c.id)" ng-bind-html="makeSafe(c.video.title)"></a><div ng-bind-html="makeSafe(c.video.subTitle)"></div></div></article>',
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-category-view Link');

				elm.addClass('x-portal-widget-showcasevideo');

				scope.model = [];

				scope.visibleIndex = 0;

				elm.css('height', '492px');

				$interval(function() {
					++scope.visibleIndex;
					if (scope.visibleIndex >= scope.model.length) {
						scope.visibleIndex = 0;
					}
				}, 5000);

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
								video: findFirstOfType(data[i].data, 'video'),
								img1170: findFirstOfType(data[i].data, 'image1170'),
								content: findFirstOfType(data[i].data, 'content')
							});
					   }

					   elm.empty();
					   elm.append('<div class="portal-content-title"></div>');
					   for (var i = 0; i < scope.model.length; i++) {
							var article = angular.element('<article ng-show="visibleIndex == ' + i + '"></article>');
					   		var item = angular.element(
					   			'<iframe width="560" height="315" src="' + scope.model[i].video.src + '" frameborder="0" allowfullscreen></iframe>'
								+ '<div class="x-portal-widget-showcasevideo-textblock"><a ng-click="aler(10);navigate(\'' + scope.model[i].id + '\')" >' + scope.model[i].video.title + '</a><div >' + scope.model[i].video.subTitle + '</div></div>');
					   		article.append(item);
					   		elm.append(article);
					   		$compile(article)(scope);
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


