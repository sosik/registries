angular.module('security', [])
.factory('security.SecurityService', ['$http', '$rootScope', function($http, $rootScope) {
	var service = {};

	service.getLogin = function(user, password) {
		return $http({
		    method : 'POST',
		    url : '/login/',
		    data : {
		        login : user,
		        password : password
		    }
		});
	};

	service.getCurrentUser = function() {
		return $http({
		    method : 'GET',
		    url : '/user/current'
		});
	};
	
	service.getResetPassword = function(user) {
		return $http({
		    method : 'POST',
		    url : '/resetPassword/',
		    data : {
			    login : user
		    }
		});
	};

	service.getChangePassword = function(currentPassword, newPassword) {
		return $http({
		    method : 'POST',
		    url : '/changePassword',
		    data : {
		        currentPassword : currentPassword,
		        newPassword : newPassword
		    }
		});
	};
	

	service.getUserList = function() {

		return $http({
		    method : 'GET',
		    url : '/user/list',
		});

	};


	service.getLogout = function() {
		return $http({
		    method : 'GET',
		    url : '/logout/',
		});
	};

	service.getSecurityPermissions = function() {

		return $http({
		    method : 'GET',
		    url : '/security/permissions',

		})

	};

	service.getUserPermissions = function(userId) {

		return $http({
		    method : 'GET',
		    url : '/user/permissions/' + userId
		})

	};

	service.updatePermissions = function(userId, permissions) {

		return $http({
		    method : 'POST',
		    url : '/user/permissions/update',
		    data : {
		        userId : userId,
		        permissions : permissions
		    }
		});
	}
	
	/**
	 * checks if current user has all required permissions
	 */
	service.hasPermissions = function(requiredPermissions) {
		if (!requiredPermissions || requiredPermissions.length < 1) {
			// there are no permissions to check, so we have permission
			return true;
		}

		if ($rootScope.security.currentUser && $rootScope.security.currentUser.systemCredentials && $rootScope.security.currentUser.systemCredentials.login &&
				$rootScope.security.currentUser.systemCredentials.login.permissions) {
			for (var i in requiredPermissions) {
				if ($rootScope.security.currentUser.systemCredentials.login.permissions[requiredPermissions[i]] !== true) {
					//missing permission
					return false;
				}
			}

			return true;
		} else {
			// non valid current user, no permissions
			return false;
		}
	}

	return service;
}])
.controller('security.loginCtrl', [ '$scope', 'security.SecurityService', '$rootScope', '$location', function($scope, SecurityService, $rootScope, $location) {
	// FIXME remove this in production
	$scope.user = 'johndoe';
	$scope.password = 'johndoe';
	$scope.alert = null;

	/**
	 * Login button click
	 */
	$scope.login = function() {
		SecurityService.getLogin($scope.user, $scope.password)
		.success(function(data, status, headers, config) {
			$rootScope.security.currentUser = data;
			$scope.alert = null;
			$location.path('/personal-page');
		})
		.error(function(data, status, headers, config) {
			delete $rootScope.security.currentUser;
			$scope.alert = data;
		});
	};
	
	

	$scope.resetPassword = function() {
		SecurityService.getResetPassword($scope.user);
	};
} ])
.controller('security.logoutCtrl', ["$scope", "security.SecurityService", "$location", '$cookieStore', '$rootScope', function($scope, SecurityService, $location, $cookieStore, $rootScope) {
	$scope.logout = function() {
		SecurityService.getLogout().then(function(data, status, headers, config){
			$scope.security.currentUser = undefined;
			$cookieStore.remove('loginName');
			$cookieStore.remove('securityToken');
			$location.path('/login');
		})
	}
}])
.controller('security.userListCtrl', [ '$scope', 'security.SecurityService', function($scope, userApiService) {

	$scope.userList = [];

	userApiService.getUserList().success(function(data) {
		$scope.userList = data;
	});

} ])
.controller('security.userEditCtrl',
        [ '$scope',  'security.SecurityService', '$routeParams', function($scope,  securityService, $routeParams) {

	        $scope.user = {};
	        $scope.user.permissions = [];

	        var remove = function(arr, item) {
		        for (var i = arr.length; i--;) {
			        if (arr[i] === item) {
				        arr.splice(i, 1);
			        }
		        }
	        }

	        securityService.getSecurityPermissions().success(function(data) {
		        $scope.permissions = data;
		        securityService.getUserPermissions($routeParams.id).success(function(data) {
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
	        	securityService.updatePermissions($routeParams.id, $scope.user.permissions);
	        }

        } ])

.controller('security.personalChangePasswordCtrl', [ '$scope', 'security.SecurityService', '$rootScope', '$location', function($scope, SecurityService, $rootScope, $location) {
	$scope.currentPassword = '';
	$scope.newPassword = '';
	$scope.newPasswordCheck = '';
	$scope.alert = null;

	$scope.changePassword = function() {
		if ($scope.newPassword !== $scope.newPasswordCheck) {
			$scope.alert = "Nové a kontrolné heslo sa nerovnajú!!!";
		}
		SecurityService.getChangePassword($scope.currentPassword, $scope.newPassword)
		.success(function(data, status, headers, config){
			$scope.alert = 'Heslo zmenene';
		})
		.error(function(data, status, headers, config){
			$scope.alert = 'Heslo sa nepodarilo zmeniť ' + data;
		});
	};
}]);
