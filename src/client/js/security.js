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

	service.getLogout = function() {
		return $http({
		    method : 'GET',
		    url : '/logout/',
		});
	};

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

	$scope.changePassword = function() {
		SecurityService.getChangePassword($scope.currentPassword, $scope.newPassword);
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
}]);
