(function(angular) {
	'use strict';


	angular.module('xpsui:controllers')
	.controller('xpsui:RegistryNewCtrl', [
		'$route',
		'$scope',
		'$parse',
		'$routeParams',
		'$http',
		'$location',
		'xpsui:SchemaUtil',
		'xpsui:NotificationFactory',
		'xpsui:NavigationService',
		function($route, $scope, $parse, $routeParams, $http, $location, schemaUtilFactory, notificationFactory, navigationService) {
			// $scope.currentSchemaUri = 'uri://registries/' + schemaUtilFactory.decodeUri($routeParams.schema);
			$scope.currentSchemaUri = schemaUtilFactory.decodeUri($routeParams.schema);
			$scope.model = {};
			$scope.model.obj = {};

			$scope.schemaFormOptions = {
				modelPath: 'model.obj',
				schema: {}
			};

			$scope.save = function() {
				$scope.newForm.xpsui.prepareForSubmit();
				if ($scope.newForm.$invalid) {
					notificationFactory.error({translationCode: 'registry.form.not.filled.correctly', time: 5000});
					return;
				}

				$http({url: '/udao/saveBySchema/'+schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri($scope.currentSchemaUri , 'new')), method: 'PUT',data: $scope.model.obj})
				.success(function(data, status, headers, config){
					notificationFactory.clear();
					//$location.path('/registry/view/' + schemaUtilFactory.encodeUri($routeParams.schema) + '/' + data.id);
					$location.path('/registry/view/' + $routeParams.schema + '/' + data.id);
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
				var filler = navigationService.restore();
				if (filler) {
					schemaUtilFactory.fillObj($scope, filler);
				}
			}).error(function(err) {
				notificationFactory.error(err);
			});
		}
	]);
}(window.angular));
