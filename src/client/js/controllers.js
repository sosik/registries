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

.controller('SearchCtrl', [ '$scope', 'searchApiService', function($scope, searchApiService) {

	$scope.searchDef = {};

	$scope.alert = null;
	$scope.searchCrit = [];

	searchApiService.getSearchDef('makak').success(function(data) {

		$scope.searchDef = data;
	}).error(function(err) {
		$scope.alert = err;
	});

	$scope.addCrit = function() {
		$scope.alert = null;

		if (!$scope.critTempAtt) {
			$scope.alert = "Attribute must be specified";
			return;
		}

		if (!$scope.critTempOper) {
			$scope.alert = "Operator must be specified";
			return;
		}

		if (!$scope.critTempVal) {
			$scope.alert = "Value must be specified";
			return;
		}

		$scope.searchCrit.push({
		    attribute : $scope.critTempAtt,
		    oper : $scope.critTempOper,
		    value : $scope.critTempVal
		});
		$scope.critTempAtt = null;
		$scope.critTempOper = null;
		$scope.critTempVal = null;
		console.log($scope.searchCrit);
	};

	$scope.removeCrit = function(index) {
		$scope.searchCrit.splice(index, 1);
	};

	$scope.editCrit = function(index) {
		$scope.critTempAtt = $scope.searchCrit[index].attribute;
		$scope.critTempOper = $scope.searchCrit[index].oper;
		$scope.critTempVal = $scope.searchCrit[index].value;
	};
	
	function convertCriteria(crit){
		
		var retval=[];
		for(var c in crit){
			retval.push({f:c.attribute.path,v:c.value,op: c.oper.value });
		}
		return retval;
		
	}
	$scope.search = function() {
		searchApiService.getSearch($scope.searchDef.schema,  $scope.searchCrit).success(function(data) {
			$scope.data = data;
		});
	};

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
	        $scope.user.permissions = [];

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
				        remove($scope.permissions, data.permissions[i]);
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

.controller('LoginCtrl', [ '$scope', 'LoginApiService', function($scope, LoginApiService) {
	$scope.user = 'johndoe';
	$scope.password = 'johndoe';

	$scope.currentPassword = 'johndoe';
	$scope.newPassword = 'johndoe2';

	$scope.login = function() {

		LoginApiService.getLogin($scope.user, $scope.password);
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
