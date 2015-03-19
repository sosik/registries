(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:SchemaEditorService', [ '$http', '$rootScope', function($http, $rootScope) {
		var service = {};

		service.getSchemaList = function () {
			return $http({
				method: 'GET',
				url: '/schema/ls/'
			})
		};

		service.getFileContent = function (path) {
			var pathContext = 'schema/get/' + path;
			return $http({
				method: 'GET',
				url: pathContext,
				responseType: 'text'
			})
		};

		service.getPostContent = function (path, bytes) {
			var pathContext = 'schema/replace/' + path;
			return $http({
				method: 'PUT',
				url: pathContext,
				data: bytes,
				headers: {
					'Content-Type': 'application/octet-stream'
				}
			})
		};


		return service;
	}]);

}(window.angular));