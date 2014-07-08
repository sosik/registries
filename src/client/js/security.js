angular.module('security', [ 'generic-search', 'schema-utils'])
//
.factory(
        'security.SecurityService',
        [
                '$http',
                '$rootScope',
                function($http, $rootScope) {
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

	                service.getUserList = function() {

		                return $http({
		                    method : 'GET',
		                    url : '/user/list',
		                });

	                };

	                service.getSecurityGroups = function() {

		                return $http({
		                    method : 'GET',
		                    url : '/udao/list/groups',
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

	                service.getUserPermissions = function(userId) {

		                return $http({
		                    method : 'GET',
		                    url : '/user/permissions/' + userId
		                });

	                };

	                service.updateUserSecurity = function(userId,loginName,email, permissions, groups) {

		                return $http({
		                    method : 'POST',
		                    url : '/user/security/update',
		                    data : {
		                    	userId : userId,
		                        loginName: loginName, 
		                        email: email,
		                    	permissions : permissions,
		                        groups : groups
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

		                if ($rootScope.security.currentUser && $rootScope.security.currentUser.systemCredentials
		                        && $rootScope.security.currentUser.systemCredentials.login
		                        && $rootScope.security.currentUser.systemCredentials.permissions) {
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
                } ])
//
.controller('security.loginCtrl', [ '$scope', 'security.SecurityService', '$rootScope', '$location','psui.notificationFactory', function($scope, SecurityService, $rootScope, $location,notificationFactory) {
	// FIXME remove this in production
	$scope.user = 'johndoe';
	$scope.password = 'johndoe';

	/**
	 * Login button click
	 */
	$scope.login = function() {
		SecurityService.getLogin($scope.user, $scope.password).success(function(data, status, headers, config) {
			$rootScope.security.currentUser = data;
			$location.path('/personal-page');
		}).error(function(data, status, headers, config) {
			delete $rootScope.security.currentUser;
			 var mes = {translationCode:'login.authentication.failed',time:5000};
			 notificationFactory.error(mes);
		});
	};

	$scope.resetPassword = function() {
		SecurityService.getResetPassword($scope.user);
	};
} ])
//
.controller(
        'security.logoutCtrl',
        [ "$scope", "security.SecurityService", "$location", '$cookieStore', '$rootScope',
                function($scope, SecurityService, $location, $cookieStore, $rootScope) {
	                $scope.logout = function() {
		                SecurityService.getLogout().then(function(data, status, headers, config) {
			                $scope.security.currentUser = undefined;
			                $cookieStore.remove('loginName');
			                $cookieStore.remove('securityToken');
			                $location.path('/login');
		                })
	                };
                } 
        ])
//                
.controller(
        'security.groupEditCtrl',
        [
                '$scope',
                'security.SecurityService',
                'schema-utils.SchemaUtilFactory',
                'psui.notificationFactory',
                function($scope, SecurityService, schemaUtilFactory, notificationFactory) {

	                $scope.groups = [];
	                $scope.selectedGroup = null;
	                $scope.group = {};
	                $scope.group.permissions = [];

	                $scope.schemaFormOptions = {
	                    modelPath : 'selectedSchema',
	                    schema : {}
	                };

	                schemaUtilFactory.getCompiledSchema('uri://registries/security#groupmaster', 'new').success(function(data) {
		                $scope.schemaFormOptions.schema = data;
	                }).error(function(err) {
		                notificationFactory.error(err);
	                });

	                var remove = function(arr, item) {
		                for (var i = arr.length; i--;) {
			                if (arr[i] === item) {
				                arr.splice(i, 1);
			                }
		                }
	                };

	                function fillGroupPerm(group, perms) {
		              
	                	var retval = [];
		                if (!group.security) {
			                group.security = {
				                permissions : {}
			                };
		                }

		                var groupper = group.security.permissions;

		                for ( var p in groupper) {
			                if (groupper[p]) {
				                retval.push(p);
				                remove(perms, p);
			                }
		                }
		                return retval;
	                }

	                SecurityService.getSecurityGroups().success(function(data) {
		                $scope.groups = data;
	                });

	                SecurityService.getSecurityPermissions().success(function(data) {
		                $scope.permissions = data;
	                });

	                $scope.addPermission = function(value) {
		                $scope.group.permissions.push(value);
		                remove($scope.permissions, value);

	                };
	                $scope.removePermission = function(value) {
		                $scope.permissions.push(value);
		                remove($scope.group.permissions, value);
	                };

	                $scope.updateGroupPermissions = function() {
		                SecurityService.updateSecurityGroup($scope.selectedGroup.id, $scope.selectedGroup.baseData.name, $scope.selectedGroup.baseData.id,
		                        $scope.group.permissions, $scope.selectedGroup.baseData.parent);
		                $scope.selectedGroup = null;
		                setTimeout(function() {
		                	 SecurityService.getSecurityGroups().success(function(data) {
		 		                $scope.groups = data;
		 	                });
			               
		                }, 500);
	                };

	                $scope.selectGroup = function(group) {
		                $scope.selectedGroup = group;
		                SecurityService.getSecurityPermissions().success(function(data) {
			                $scope.permissions = data;
			                $scope.group.permissions = fillGroupPerm($scope.selectedGroup, data);
		                }).error(function(err) {
		                	 notificationFactory.error(err);
		                });
	                };

                } ])

//
.controller(
        'security.userEditCtrl',
        [ '$scope', '$routeParams', 'security.SecurityService', 'generic-search.GenericSearchFactory', 'schema-utils.SchemaUtilFactory',
                'psui.notificationFactory', function($scope, $routeParams, securityService, genericSearchFactory, schemaUtilFactory, notificationFactory) {

	                var entityUri = 'uri://registries/member';

	                $scope.userList = [];
	                $scope.selectedUser = null;

	                $scope.user = {};
	                $scope.user.permissions = [];
	                $scope.user.groups = [];
	                $scope.headers = {};

	                $scope.removeCrit = function(index) {
		                $scope.searchCrit.splice(index, 1);
	                };

	                $scope.searchCrit = [];

	                $scope.editCrit = function(index) {
		                $scope.critTempAtt = $scope.searchCrit[index].attribute;
		                $scope.critTempOper = $scope.searchCrit[index].oper;
		                $scope.critTempVal = $scope.searchCrit[index].value;
	                };

	                $scope.addCrit = function() {
		                $scope.searchCrit.push({});
	                };

	                schemaUtilFactory.getCompiledSchema(entityUri, 'search').success(function(data) {
		                $scope.searchDef = genericSearchFactory.parseSearchDef(data);
		                $scope.entity = data.title;
		                $scope.addCrit({});
		                $scope.headers = data.listFields;
	                }).error(function(err) {
		                notificationFactory.error(err);

	                });

	                function convertCriteria(crit) {
		                var retval = [];

		                crit.map(function(c) {

			                if (c.attribute && c.attribute.path && c.operator.value) {
				                if (!c.value) {
					                c.value = '';
				                }
				                retval.push({
				                    f : c.attribute.path,
				                    v : c.value,
				                    op : c.operator.value
				                });
			                }
		                });

		                return retval;

	                }

	                $scope.search = function() {
		                genericSearchFactory.getSearch(entityUri, convertCriteria($scope.searchCrit)).success(function(data) {
			                $scope.userList = data;
		                }).error(function(err) {
			                notificationFactory.error(err);
		                });
	                };

	                function remove(arr, item) {
		                for (var i = arr.length; i--;) {
			                if (arr[i] === item) {
				                arr.splice(i, 1);
			                }
		                }
	                }

	                $scope.addPermission = function(value) {
		                $scope.user.permissions.push(value);
		                remove($scope.permissions, value);

	                };
	                $scope.removePermission = function(value) {
		                $scope.permissions.push(value);
		                remove($scope.user.permissions, value);
	                };

	                $scope.addGroup = function(value) {
		                $scope.user.groups.push(value);
		                remove($scope.groups, value);

	                };
	                $scope.removeGroup = function(value) {
		                $scope.groups.push(value);
		                remove($scope.user.groups, value);
	                };

	                function fillUserPerm(user, perms) {
		                var retval = [];
		                if ( 'systemCredentials' in user ){
		                	if('permissions' in user.systemCredentials ){
		                		for(per in user.systemCredentials.permissions ){
		                			if (user.systemCredentials.permissions[per]){
		                				retval.push(per);
						                remove(perms, per);
		                			}
		                		}
		                	}
		                }
		                
		                return retval;
	                }

	                function fillUserGroups(user, groups) {
	                	var retval = [];

		                if (!user.systemCredentials.groups == null) {
			                user.systemCredentials.groups = [];
		                }

		                for ( var ug in user.systemCredentials.groups) {
			                var usergroup = user.systemCredentials.groups[ug];
			                groups.map(function(item) {

				                if (usergroup.id === item.id) {
					                retval.push(item);
					                remove(groups, item);
				                }

			                });
		                }

		                return retval;
	                }

	                $scope.selectUser = function(user) {
		                $scope.selectedUser = user;

		                securityService.getSecurityPermissions().success(function(data) {
			                $scope.permissions = data;
			                $scope.user.permissions = fillUserPerm($scope.selectedUser, data);
		                }).error(function(err){ notificationFactory.error(err);});

		                securityService.getSecurityGroups().success(function(data) {
			                $scope.groups = data;
			                $scope.user.groups = fillUserGroups($scope.selectedUser, $scope.groups);
		                }).error(function(err){
		                	 notificationFactory.error(err);
		                	});;

	                };

	                $scope.updateUserSecurity = function() {
		                securityService.updateUserSecurity($scope.selectedUser.id, $scope.selectedUser.systemCredentials.login.loginName,$scope.selectedUser.systemCredentials.login.email, $scope.user.permissions, $scope.user.groups).success(function(data) {
			                $scope.selectedUser = null;
			                $scope.userList = [];
		                });
	                };
	                
	                $scope.resetPassword= function (){
	                	 securityService.updateUserSecurity($scope.selectedUser.id, $scope.selectedUser.systemCredentials.login.loginName,$scope.selectedUser.systemCredentials.login.email, $scope.user.permissions, $scope.user.groups).success(function(data) {
	                		 securityService.getResetPassword($scope.selectedUser.id).success(function (data){
	                			   notificationFactory.info({type:'info',text:'Nové heslo bolo zaslané na: ' +$scope.selectedUser.systemCredentials.login.email,deletable : true, time:5000, timeout: null}); 
	                		 });
			             });
	                };

                } ])
//
.controller(
        'security.personalChangePasswordCtrl',
        [ '$scope', 'security.SecurityService', '$rootScope', '$location', 'psui.notificationFactory',
                function($scope, SecurityService, $rootScope, $location, notificationFactory) {
	                $scope.currentPassword = '';
	                $scope.newPassword = '';
	                $scope.newPasswordCheck = '';

	                $scope.changePassword = function() {
		                if ($scope.newPassword !== $scope.newPasswordCheck) {
					var mes = {translationCode:'personal.change.password.passwords.not.equal'};
					notificationFactory.warn(mes);
		                } else {
			                SecurityService.getChangePassword($scope.currentPassword, $scope.newPassword).success(function(data, status, headers, config) {
						var mes = {translationCode:'personal.change.password.password.changed'};
						notificationFactory.info(mes);
			                }).error(function(data, status, headers, config) {
						var mes = {translationCode:'personal.change.password.password.not.changed',translationData:data};
						notificationFactory.error(mes);
			                });
		                }
	                };
                } ]);
