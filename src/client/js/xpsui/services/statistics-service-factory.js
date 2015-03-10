(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:StatisticsServiceFactory', ['$http','$rootScope','xpsui:SchemaUtil', function($http, $rootScope,schemaUtilFactory) {
		var service = {};

		service.getStatisticsData = function() {
			return $http({
				method : 'get',
				url : '/statistics/',
			});
		};
		return service;
	}]);

}(window.angular));