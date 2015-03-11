(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:RegistryCustomTemplateCtrl', ['$scope', '$routeParams', '$http', 
		'xpsui:SchemaUtil', 'xpsui:NotificationFactory', 
		function($scope, $routeParams, $http, schemaUtilFactory, notificationFactory) {
			$scope.model = {};
			$scope.currentSchemaUri = schemaUtilFactory.decodeUri($routeParams.schema);

			$http({ method : 'GET',url: '/udao/getBySchema/'+$routeParams.schema+'/'+ $routeParams.id})
			.success(function(data, status, headers, config){
				$scope.model = data;
			}).error(function(err) {
				notificationFactory.error(err);
			});
		}
	]);
}(window.angular));
