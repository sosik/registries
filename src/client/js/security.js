angular.module('security', [])
.factory('security.LoginService', function($http) {
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

	return service;
})
.controller('security.loginCtrl', [ '$scope', 'security.LoginService', '$rootScope', '$location', function($scope, LoginService, $rootScope, $location) {
	// FIXME remove this in production
	$scope.user = 'johndoe';
	$scope.password = 'johndoe';
	$scope.alert = null;

	/**
	 * Login button click
	 */
	$scope.login = function() {
		LoginService.getLogin($scope.user, $scope.password)
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

	$scope.logout = function() {
		LoginService.getLogout();
	};

	$scope.resetPassword = function() {
		LoginService.getResetPassword($scope.user);
	};

	$scope.changePassword = function() {
		LoginService.getChangePassword($scope.currentPassword, $scope.newPassword);
	};

} ])
.controller('security.logoutCtrl', ["$scope", "security.LoginService", "$location", '$cookieStore', function($scope, LoginService, $location, $cookieStore) {
	$scope.logout = function() {
		LoginService.getLogout().then(function(data, status, headers, config){
			$cookieStore.remove('loginName');
			$cookieStore.remove('securityToken');
			$location.path('/login');
		})
	}
}]);
