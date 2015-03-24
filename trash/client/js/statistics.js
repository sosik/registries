angular.module('statistics', [])
.factory(
	'statistics.StatisticsServiceFactory',
	[
	'$http',
	'$rootScope','schema-utils.SchemaUtilFactory',
	function($http, $rootScope,schemaUtilFactory) {
		var service = {};

		service.getStatisticsData = function() {
			return $http({
				method : 'get',
				url : '/statistics/',
			});
		};
		return service;
	}

	])
.controller('statistics.viewCtrl_', ['$scope', '$routeParams', '$http', '$location','schema-utils.SchemaUtilFactory','psui.notificationFactory','statistics.StatisticsServiceFactory', function($scope, $routeParams, $http, $location,schemaUtilFactory,StatisticsServiceFactory) {
	var generateObjectFromSchema = function(schema, obj) {
		var _obj = obj;
		angular.forEach(schema.properties, function(value, key){
			if (value.type === 'object') {
				_obj[key] = {};
				generateObjectFromSchema(value, _obj[key]);
			} else {
				_obj[key] = '';
			}
		});
	};

	$scope.model = {};
	$scope.model.obj = {};

	$scope.schemaFormOptions = {
		modelPath: 'model.obj',
		schema: {}
	};

	var schemaUri = 'uri://registries/statistics';

	schemaUtilFactory.getCompiledSchema(schemaUri, 'view')
	.success(function(data) {
		$scope.schemaFormOptions.schema = data;

		StatisticsServiceFactory.getStatisticsData.success(function(data, status, headers, config){
			generateObjectFromSchema($scope.schemaFormOptions.schema, $scope.model.obj);
			$scope.model.obj = data;
		}).error(function(err) {
			notificationFactory.error(err);
		});

	});
}])
.controller('statistics.viewCtrl', ['$scope', '$routeParams', '$http', '$location','schema-utils.SchemaUtilFactory','psui.notificationFactory','statistics.StatisticsServiceFactory', function($scope, $routeParams, $http, $location,schemaUtilFactory,notificationFactory,StatisticsServiceFactory) {
	var generateObjectFromSchema = function(schema, obj) {
		var _obj = obj;
		angular.forEach(schema.properties, function(value, key){
			if (value.type === 'object') {
				_obj[key] = {};
				generateObjectFromSchema(value, _obj[key]);
			} else {
				_obj[key] = '';
			}
		});
	};

	$scope.currentId = $routeParams.id;
	$scope.currentSchemaUri = 'uri://registries/statistics';
	$scope.currentSchema = schemaUtilFactory.encodeUri($scope.currentSchemaUri);

	$scope.model = {};
	$scope.model.obj = {};

	$scope.schemaFormOptions = {
		modelPath: 'model.obj',
		schema: {}
	};

	$scope.save = function() {
		// $http({url: '/udao/saveBySchema/'+schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri($scope.currentSchemaUri, 'new')), method: 'PUT',data: $scope.model.obj})
		// .success(function(data, status, headers, config){
		// 	notificationFactory.info({translationCode:'registry.succesfully.saved', time:3000});
		// })
		// .error(function(data, status, headers, config) {
		// 	notificationFactory.error({translationCode:'registry.unsuccesfully.saved', time:3000});
		// });
	};

	// $scope.$on('psui:model_changed', function() {
	// 	$scope.save();
	// });

	var schemaUri = 'uri://registries/statistics';

	schemaUtilFactory.getCompiledSchema(schemaUri, 'view')
	.success(function(data) {
		$scope.schemaFormOptions.schema = data;
		StatisticsServiceFactory.getStatisticsData().success(function(data, status, headers, config){
			generateObjectFromSchema($scope.schemaFormOptions.schema, $scope.model.obj);
			$scope.model.obj = data;
		}).error(function(err) {
			notificationFactory.error(err);
		});

	});
}]);
