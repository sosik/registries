(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:SchemaEditorIndexCtrl', ['$scope', 'schemas', function ($scope, schemas) {

		$scope.schemaList = schemas;

	}]);

}(window.angular));