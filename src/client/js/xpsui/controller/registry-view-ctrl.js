(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:RegistryViewCtrl', ['$scope', '$routeParams', '$http', '$location','xpsui:SchemaUtil','xpsui:NotificationFactory', function($scope, $routeParams, $http, $location,schemaUtilFactory,notificationFactory) {
		//$scope.currentSchema = 'uri://registries/' + $routeParams.schema;
		$scope.currentSchema = $routeParams.schema;
		$scope.currentId = $routeParams.id;
		//$scope.currentSchemaUri = schemaUtilFactory.decodeUri('uri://registries/' + $routeParams.schema);
		$scope.currentSchemaUri = schemaUtilFactory.decodeUri($routeParams.schema);

		$scope.model = {};
		$scope.model.obj = {};

		$scope.schemaFormOptions = {
			modelPath: 'model.obj',
			schema: {}
		};

		$scope.save = function() {
			$http({url: '/udao/saveBySchema/'+schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri($scope.currentSchemaUri, 'view')), method: 'PUT',data: $scope.model.obj})
			.success(function(data, status, headers, config){
				$http({ method : 'GET',url: '/udao/getBySchema/'+schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri(schemaUri, 'view'))+'/'+ $scope.currentId})
				.success(function(data, status, headers, config){
					schemaUtilFactory.generateObjectFromSchema($scope.schemaFormOptions.schema, $scope.model.obj);
					$scope.model.obj = data;
				}).error(function(err) {
					notificationFactory.error(err);
				});
				notificationFactory.info({translationCode:'registry.succesfully.saved', time:3000});
			})
			.error(function(data, status, headers, config) {
				if (status===400){
					for(var item in data.error){

						data.error[item].map(function(fieldError){
							notificationFactory.warn({translationCode:fieldError.c,translationData:fieldError.d, time:3000});
						});
					}

				} else {
					notificationFactory.error({translationCode:'registry.unsuccesfully.saved', time:3000});
				}
			});
		};

		$scope.$on('xpsui:model_changed', function() {
			$scope.save();
		});

		var schemaUri = schemaUtilFactory.decodeUri($scope.currentSchema);

		schemaUtilFactory.getCompiledSchema(schemaUri, 'view')
		.success(function(data) {
			$scope.schemaFormOptions.schema = data;

			$http({ method : 'GET',url: '/udao/getBySchema/'+schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri(schemaUri, 'view'))+'/'+ $scope.currentId})
			.success(function(data, status, headers, config){
				schemaUtilFactory.generateObjectFromSchema($scope.schemaFormOptions.schema, $scope.model.obj);
				$scope.model.obj = data;
			}).error(function(err) {
				notificationFactory.error(err);
			});

		});
	}]);
}(window.angular));
