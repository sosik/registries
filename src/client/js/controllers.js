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

.controller('SecurityCtrl', [ '$scope', 'securityApiService', function($scope, securityApiService) {

	$scope.permissions = [];

	securityApiService.getSecurityPermissions().success(function(data) {
		$scope.permissions = data;
	});

} ])

.controller('SearchCtrl', [ '$scope', 'searchApiService', function($scope, securityApiService) {

	$scope.searchDef = {
		makak : 'makak'
	};
	$scope.searchCrit = {};

	securityApiService.getSearchDef().success(function(data) {
		$scope.searchDef = data;
	});

} ])

.controller('UserCtrl', [ '$scope', 'userApiService', function($scope, userApiService) {

	$scope.userList = [];

	userApiService.getUserList().success(function(data) {
		$scope.userList = data;
	});

} ])

.controller('UserEditCtrl',
        [ '$scope', 'userApiService', 'securityApiService', '$routeParams', function($scope, userApiService, securityApiService, $routeParams) {


	        $scope.user = {};
	        $scope.user.permissions=[];

	        var remove = function(arr, item) {
	        	for (var i = arr.length; i--;) {
			        if (arr[i] === item) {
				        arr.splice(i, 1);
			        }
		        }
	        }

	        securityApiService.getSecurityPermissions().success(function(data) {
		        $scope.permissions = data;
		        securityApiService.getUserPermissions($routeParams.id).success(function(data) {
		        	$scope.user = data;
		        	
		        	for (var i = data.permissions.length; i--;) {
		        		remove( $scope.permissions,data.permissions[i]);
			        }
		        	
		        });
	        });


	        $scope.addPermission = function(value) {
		        $scope.user.permissions.push(value);
		        remove($scope.permissions, value);

	        };
	        $scope.removePermission = function(value) {
		        $scope.permissions.push(value);
		        remove($scope.user.permissions, value);
	        };

	        $scope.updatePermissions = function() {
		        securityApiService.updatePermissions($routeParams.id, $scope.user.permissions);
	        }

        } ])

.controller('LoginCtrl', [ '$scope', '$location', '$window', 'LoginApiService', function($scope, $location, $window, LoginApiService) {
	$scope.user = 'johndoe';
	$scope.password = 'johndoe';

	$scope.currentPassword = 'johndoe';
	$scope.newPassword = 'johndoe2';

	$scope.login = function() {

		LoginApiService.getLogin($scope.user, $scope.password).success(function(data) {
			$window.location='/index.html';
		}).error(function(err,status){$scope.alert='asdsadsa'});
	};

	$scope.logout = function() {
		LoginApiService.getLogout();
	};

	$scope.resetPassword = function() {
		LoginApiService.getResetPassword($scope.user);
	};

	$scope.changePassword = function() {
		LoginApiService.getChangePassword($scope.currentPassword, $scope.newPassword);
	};

} ]);
