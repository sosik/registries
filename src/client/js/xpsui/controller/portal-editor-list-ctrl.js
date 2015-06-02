(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:PortalEditorListCtrl', [
		'$scope',
		'$sce',
		'$route',
		'xpsui:SchemaUtil',
		'xpsui:NotificationFactory',
		'$http',
		'$location',
		'xpsui:DateUtil',
		function(
			$scope,
			$sce,
			$route,
			schemaUtilFactory,
			notificationFactory,
			$http,
			$location,
			dateUtils
		) {

			$scope.model = [];
			$scope.data = [];
			$scope.sort = { "ASC": 1, "DESC": 0 };
			$scope.currSort = { "field": "article.meta.title", "order": $scope.sort.ASC };
			$scope.newCrit = { "field": "", "op": "0", "val": "" };
			$scope.searchCrits = [ angular.copy($scope.newCrit) ];
			$scope.isSearching = false;

			$scope.changeSort = function (newField) {
				if ($scope.currSort.field == newField) {
					$scope.currSort.order = 1 - $scope.currSort.order;
				} else {
					$scope.currSort.field = newField;
					$scope.currSort.order = $scope.sort.ASC;
				}
				$scope.search();
			}
			
			$http({
				method : 'GET',
				url: '/udao/get/portalArticles',
				data: {
				}
			})
			.success(function(data, status, headers, config) {
				$scope.data = data;
			}).error(function(err) {
				notificationFactory.error(err);
			});

			$scope.filterFn = function (val) {
				for (var pos=0; pos<$scope.searchCrits.length; pos++) {
					var crit = $scope.searchCrits[pos];
					if (crit.field == 'article.meta.title') {
						return (val.meta.title && val.meta.title.toLowerCase().indexOf(crit.val.toLowerCase()) > -1);
					} else if (crit.field == 'article.meta.lastModTimestamp') {
					} else if (crit.field == 'article.meta.tags') {
						
					} else if (crit.field == 'article.meta.template') {
						
					}
				}
				return true;
			};
			
			$scope.search = function () {
				$scope.model = angular.copy($scope.data);
				
				$scope.isSearching = true;
				if ($scope.currSort.field == 'article.meta.title') {

					$scope.model.sort(function (val1, val2) {
						return ($scope.currSort.order*2-1)
							* ((val1.meta.title.toLowerCase() > val2.meta.title.toLowerCase())?1:-1);
					});

				} else if ($scope.currSort.field == 'article.meta.lastModTimestamp') {

					$scope.model.sort(function (val1, val2) {
						return ($scope.currSort.order*2-1)
								* (new Date(val1.meta.lastModTimestamp).getTime() 
										- new Date(val2.meta.lastModTimestamp).getTime());
					});

				} else if ($scope.currSort.field == 'article.meta.tags') {
					$scope.model.sort(function (val1, val2) {
						return ($scope.currSort.order*2-1)
							* ((val1.meta.tags.join(',').toLowerCase() > val2.meta.tags.join(',').toLowerCase())?1:-1);
					});
				} else if ($scope.currSort.field == 'article.meta.template') {

					$scope.model.sort(function (val1, val2) {
						return ($scope.currSort.order*2-1)
							* ((val1.meta.template.toLowerCase() > val2.meta.template.toLowerCase())?1:-1);
					});

				}
				$scope.isSearching = false;
			}

			$scope.editArticle = function(articleId) {
				var path = "/portal/edit/" + articleId;

				$location.path(path);
			}

			$scope.removeCrit = function(index) {
				$scope.searchCrits.splice(index, 1);
			}

			$scope.addNewCrit = function () {
				$scope.searchCrits.push(angular.copy($scope.newCrit));
			}
			
			$scope.dateToUI = function(date) {
				return dateUtils.formatter(new Date(date));
			}

		}
	]);
}(angular));
