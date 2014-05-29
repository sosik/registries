'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

.controller('MyCtrl1', [ '$scope', function($scope) {

} ])

.controller('SchemaListCtrl', [ '$scope', 'schemaApiService', function($scope, schemaApiService) {

	$scope.schemaList = [];

	schemaApiService.getSchemaList().success(function(data) {
		$scope.schemaList = data;
	});

} ])

.controller('LoginCtrl', [ '$scope', 'LoginApiService', function($scope, LoginApiService) {
	$scope.user = 'johndoe';
	$scope.password = 'johndoe';

	$scope.login = function() {
		console.log($scope.user + ':' + $scope.password);

		LoginApiService.getLogin($scope.user, $scope.password);
	}

	$scope.logout = function() {
		LoginApiService.getLogout();
	}

} ]);
