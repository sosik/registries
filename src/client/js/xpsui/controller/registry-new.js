(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:RegistryNewCtrl', ['$route',
			'$scope',
			'$routeParams',
			'$http',
			'$location',
			'xpsui:SchemaUtil',
			'psui.notificationFactory',
	function($route, $scope, $routeParams, $http, $location,schemaUtilFactory,notificationFactory) {
		$scope.currentSchemaUri = 'uri://registries/' + schemaUtilFactory.decodeUri($routeParams.schema);

		$scope.model = {};
		$scope.model.obj = {};

		$scope.schemaFormOptions = {
			modelPath: 'model.obj',
			schema: {}
		};

		$scope.save = function() {
			$scope.newForm.psui.prepareForSubmit();
			if ($scope.newForm.$invalid) {
				notificationFactory.error({translationCode: 'registry.form.not.filled.correctly', time: 5000});
				return;
			}

			$http({url: '/udao/saveBySchema/'+schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri($scope.currentSchemaUri , 'new')), method: 'PUT',data: $scope.model.obj})
			.success(function(data, status, headers, config){
				notificationFactory.clear();
				$location.path('/registry/view/' + schemaUtilFactory.encodeUri($scope.currentSchemaUri) + '/' + data.id);
			}).error(function(err) {
				notificationFactory.error({translationCode:'registry.unsuccesfully.saved', time:3000});
			});
		};

		$scope.cancel = function() {
			$route.reload();
		};

		schemaUtilFactory.getCompiledSchema($scope.currentSchemaUri, 'new').success(function(data) {
			$scope.schemaFormOptions.schema = data;
			schemaUtilFactory.generateObjectFromSchema($scope.schemaFormOptions.schema, $scope.model.obj);
		}).error(function(err) {
			notificationFactory.error(err);
		});
	}]);
}(window.angular));
