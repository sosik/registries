'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

.controller('MyCtrl1',
		[ '$scope', function($scope) {

		} ])

.controller('SchemaList', ['$scope', 'schemaApiService', function($scope,schemaApiService) {

	  $scope.schemaList = [];
	  
	  schemaApiService.getSchemaList().success(function(data) {
	    $scope.schemaList = data;
	  });
	 
} ]);
