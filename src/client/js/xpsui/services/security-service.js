(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:SecurityService', ['$http', '$rootScope','xpsui:SchemaUtil', function($http, $rootScope,schemaUtilFactory) {
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
		service.selectProfile=function(profileId){
			return $http({
				method : 'POST',
				url : '/user/profile/',
				data : {
					profileId : profileId
				}
			});
		};

		service.getCurrentUser = function() {
			return $http({
				method : 'GET',
				url : '/user/current'
			});
		};

		service.getResetPassword = function(userId) {
			return $http({
				method : 'POST',
				url : '/resetPassword/',
				data : {
					userId : userId
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

		service.getSecurityGroups = function() {
			var entityUri='uri://registries/security#groupmaster/new';
			return $http({
				method : 'POST',
				url : '/search/'+schemaUtilFactory.encodeUri(entityUri),
			});

		};
		service.getForgotenToken = function(email,captcha) {
			return $http({
				method : 'POST',
				url : '/forgotten/token/',
				data : {
					email : email,
					captcha: captcha
				}
			});
		};

		service.getForgotenPasswordReset = function(token) {
			return $http({
				method : 'GET',
				url : '/forgotten/reset/'+token
			});
		};
		service.getCaptchaKey = function(token) {
			return $http({
				method : 'GET',
				url : '/captcha/sitekey/'
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

			});

		};
		service.getSecurityProfiles = function() {

			return $http({
				method : 'GET',
				url : '/security/profiles',

			});

		};
		service.getSecuritySearchSchemas= function() {

			return $http({
				method : 'GET',
				url : '/security/search/schemas',
			});

		};
		service.getUserPermissions = function(userId) {

			return $http({
				method : 'GET',
				url : '/user/permissions/' + userId
			});

		};

		service.updateUserSecurity = function(userId,loginName,email,profiles) {

			return $http({
				method : 'POST',
				url : '/user/security/update',
				data : {
					userId : userId,
					loginName: loginName,
					email: email,
					profiles : profiles
				}
			});
		};

		service.updateProfileSecurity = function(profileId,profileName, permissions, groups,criteria) {

			return $http({
				method : 'POST',
				url : '/security/profile/update',
				data : {
					profileId : profileId,
					profileName: profileName,
					permissions : permissions,
					groups : groups,
					criteria: criteria
				}
			});
		};

		service.updateSecurityGroup = function(oid, groupName, groupId, permissions, parent) {

			return $http({
				method : 'POST',
				url : '/group/security/update',
				data : {
					oid : oid,
					permissions : permissions,
					groupName : groupName,
					groupId : groupId,
					parent : parent
				}
			});

		};

		/**
		 * checks if current user has all required permissions
		 */
		service.hasPermissions = function(requiredPermissions) {
			if (!requiredPermissions || requiredPermissions.length < 1) {
				// there are no permissions to check, so we have
				// permission
				return true;
			}

			if ($rootScope.security.currentUser && $rootScope.security.currentUser.systemCredentials && $rootScope.security.currentUser.systemCredentials.login &&
			 $rootScope.security.currentUser.systemCredentials.permissions) {
				for ( var i in requiredPermissions) {
					if ($rootScope.security.currentUser.systemCredentials.permissions[requiredPermissions[i]] !== true) {
						// missing permission
						return false;
					}
				}

				return true;
			} else {
				// non valid current user, no permissions
				return false;
			}
		};

		return service;
	} ]);

}(window.angular));
