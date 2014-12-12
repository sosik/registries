(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalWidgetCategoryView', ['xpsui:logging', '$compile', '$http', '$sce', '$route', '$location', function(log, $compile, $http, $sce, $route, $location) {
		return {
			restrict: 'A',
			scope: {
				data: '=xpsuiPortalWidgetCategoryView'
			},
			template: '<article ng-repeat="c in model" style="overflow: auto;"><img ng-show="c.img.img" ng-src="{{c.img.img}}" style="width: 164px !important; height: 123px !important;float: right;"></img><a ng-click="navigate(c.id)" ng-bind-html="makeSafe(c.title)"></a><div ng-bind-html="makeSafe(c.abstract)"></div></article>'
				+ '<div style=" text-align: right; ">'
				+ '	<a ng-click="prevPage()" style=" color: #CB2225; "><i class="fa fa-chevron-left x-portal-widget-gallery-prev-btn"></i></a>'
				+ '	&nbsp;&nbsp;<a ng-click="nextPage()" style=" color: #CB2225; "><i class="fa fa-chevron-right x-portal-widget-gallery-next-btn"></i></a>'
				+ '</div>',
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-widget-category-view Link');

				elm.addClass('x-portal-widget-category');

				scope.model = [];
				scope.page = 0;
				scope.numberPerPage = scope.data.data.pageSize;
				console.log('dsa');
				if ((typeof scope.numberPerPage === "undefined")
						|| scope.numberPerPage == '') {
					scope.numberPerPage = 20;
				}
				scope.prevPage = function () {
					scope.page--;
					if (scope.page < 0) {
						scope.page = 0;
					}
					scope.refreshPage();
				};
				scope.nextPage = function () {
					scope.page++;
					var totalPages = Math.ceil((1.0 * scope.modelAll.length) / (1.0 * scope.numberPerPage));
					if (scope.page >= totalPages) {
						scope.page = totalPages-1;
					}
					scope.refreshPage();
				};
				scope.refreshPage = function () {
					scope.model = [];
					var iterateFrom = scope.page*scope.numberPerPage;
					var iterateTo = (scope.page+1)*scope.numberPerPage;
					var iterateTo = (iterateTo < scope.modelAll.length)? iterateTo : scope.modelAll.length;
					for (var i = iterateFrom; i < iterateTo; ++i) {
						scope.model.push(scope.modelAll[i]);
					}
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

				console.log('querying with page size: ' + scope.numberPerPage);
				$http({
					method : 'POST',
					url: '/portalapi/getByTags',
					data: {
						tags: scope.data.data.tags,
						skip: 0,
						limit: null
					}
				})
				.success(function(data, status, headers, config){
					if (data && data.length > 0) {
						scope.modelAll = [];
						for (var i = 0; i < data.length; ++i) {
							scope.modelAll.push({
								id: data[i].id,
								title: findFirstOfType(data[i].data, 'title'),
								abstract: findFirstOfType(data[i].data, 'abstract'),
								img: findFirstOfType(data[i].data, 'image'),
							});
						}
						scope.refreshPage();

						console.log(scope.modelAll);
					}
				}).error(function(err) {
					notificationFactory.error(err);
				});

				scope.navigate = function(aid) {
					$location.path('/portal/edit/' + aid);
					//$route.updateParams({id: aid});
				};

				log.groupEnd();
			}
		};
	}]);

}(window.angular));


