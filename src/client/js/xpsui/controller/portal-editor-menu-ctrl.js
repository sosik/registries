(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:PortalEditorMenuCtrl', [
		'$scope',
		'$sce',
		'$route',
		'xpsui:SchemaUtil',
		'xpsui:NotificationFactory',
		'$http',
		'$location',
		function(
			$scope,
			$sce,
			$route,
			schemaUtilFactory,
			notificationFactory,
			$http,
			$location
		) {
			var portalSchemaUri = schemaUtilFactory.decodeUri('uri://registries/portal#');
			var emptyMenu = {
				index: {
					name: 'ROOT',
					transCode: null,
					tags: [],
					hash: '',
					subElements: []
				}
			};

			$scope.model = angular.copy(emptyMenu);

			$scope.cancel = function() {
				$route.reload();
			};

			$scope.save = function() {
				$http({
					url: '/udao/save/portalMenu',
					method: 'PUT',
					data: $scope.model
				})
				.success(function(data, status, headers, config){
					notificationFactory.clear();
					$route.reload();
				}).error(function(err) {
					notificationFactory.error({translationCode:'registry.unsuccesfully.saved', time:3000});
				});
			};

			$http({
				method : 'GET',
				url: '/udao/list/portalMenu',
				data: {
				}
			})
			.success(function(data, status, headers, config){
				if (data && data.length > 0 && data[0].index) {
					$scope.model = data[0];
				}
			}).error(function(err) {
				notificationFactory.error(err);
			});

		}
	]);
}(angular));
