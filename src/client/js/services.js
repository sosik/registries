'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
var module = angular.module('myApp.services', []);
module.value('version', '0.1');
module.factory('schemaApiService', function($http) {

	var schemaApi = {};

	schemaApi.getSchemaList = function() {
		return $http({
		    method : 'GET',
		    url : '/schema/ls/',
		})
	};

	schemaApi.getFileContent = function(path) {
		var pathContext = 'schema/get/' + path;
		return $http({
		    method : 'GET',
		    url : pathContext,
		    responseType : 'text'
		})
	};

	schemaApi.getPostContent = function(path, bytes) {
		var pathContext = 'schema/replace/' + path;
		return $http({
		    method : 'PUT',
		    url : pathContext,
		    data : bytes,
		    headers : {
			    'Content-Type' : 'application/octet-stream'
		    }
		})
	};

	return schemaApi;
});

module.factory('LoginApiService', function($http) {

	var service = {};

	service.getLogin = function(user, password) {

		return $http({
		    method : 'POST',
		    url : '/login/',
		    data : {
		        login : user,
		        password : password
		    }
		})

	};

	service.getResetPassword = function(user) {

		return $http({
		    method : 'POST',
		    url : '/resetPassword/',
		    data : {
			    login : user
		    }
		})

	};

	service.getChangePassword = function(currentPassword, newPassword) {

		return $http({
		    method : 'POST',
		    url : '/changePassword',
		    data : {
		        currentPassword : currentPassword,
		        newPassword : newPassword
		    }
		})

	};

	service.getLogout = function() {

		return $http({
		    method : 'GET',
		    url : '/logout/',

		})

	};

	return service;
});

module.factory('securityApiService', function($http) {

	var service = {};

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

	return service;
});

module.factory('searchApiService', function($http) {

	var service = {};

	service.getSearchDef = function(entity) {

		return $http({
		    method : 'POST',
		    url : '/search/def',
		    data : {
			    searchSchema : searchSchema
			    entity:entity
		    }
		});
	}

	service.getSearch = function(searchSchema, criteria) {

		return $http({
		    method : 'POST',
		    url : '/search',
		    data : {
		        searchSchema : searchSchema,
		        criteria : criteria
		    }
		});
	}

	return service;
});

module.factory('userApiService', function($http) {

	var service = {};

	service.getUserList = function() {

		return $http({
		    method : 'GET',
		    url : '/user/list',
		});

	};

	return service;
});
