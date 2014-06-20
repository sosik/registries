angular.module('security', [ 'generic-search', 'schema-utils' ]).factory(
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

		                })

	                };

	                service.getUserPermissions = function(userId) {

		                return $http({
		                    method : 'GET',
		                    url : '/user/permissions/' + userId
		                })

	                };

	                service.updateUserSecurity = function(userId, permissions, groups) {

		                return $http({
		                    method : 'POST',
		                    url : '/user/security/update',
		                    data : {
		                        userId : userId,
		                        permissions : permissions,
		                        groups : groups
		                    }
		                });
	                }

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
		                        && $rootScope.security.currentUser.systemCredentials.login.permissions) {
			                for ( var i in requiredPermissions) {
				                if ($rootScope.security.currentUser.systemCredentials.login.permissions[requiredPermissions[i]] !== true) {
					                // missing permission
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
                } ]).controller('security.loginCtrl',
        [ '$scope', 'security.SecurityService', '$rootScope', '$location', function($scope, SecurityService, $rootScope, $location) {
	        // FIXME remove this in production
	        $scope.user = 'johndoe';
	        $scope.password = 'johndoe';
	        $scope.alert = null;

	        /**
			 * Login button click
			 */
	        $scope.login = function() {
		        SecurityService.getLogin($scope.user, $scope.password).success(function(data, status, headers, config) {
			        $rootScope.security.currentUser = data;
			        $scope.alert = null;
			        $location.path('/personal-page');
		        }).error(function(data, status, headers, config) {
			        delete $rootScope.security.currentUser;
			        $scope.alert = data;
		        });
	        };

	        $scope.resetPassword = function() {
		        SecurityService.getResetPassword($scope.user);
	        };
        } ]).controller(
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
	                }
                } ]).controller('security.securityGroupEditCtrl', [ '$scope', 'security.SecurityService', function($scope, SecurityService) {

	$scope.groups = [];
	$scope.selectedGroup = null;

	var remove = function(arr, item) {
		for (var i = arr.length; i--;) {
			if (arr[i] === item) {
				arr.splice(i, 1);
			}
		}
	}

	SecurityService.getSecurityGroups().success(function(data) {
		$scope.groups = data;
	});

	SecurityService.getSecurityPermissions().success(function(data) {
		$scope.permissions = data;
		console.log(data);

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
		SecurityService.updatePermissions($routeParams.id, $scope.user.permissions);
	};

	$scope.selectGroup = function(group) {
		console.log('selected group', group);
		$scope.selectedGroup = group;
	};

} ]).controller('security.userListCtrl', [ '$scope', 'security.SecurityService', function($scope, userApiService) {

	$scope.userList = [];

	userApiService.getUserList().success(function(data) {
		$scope.userList = data;
	});

} ]).controller(
        'security.userEditCtrl',
        [ '$scope', '$routeParams', 'security.SecurityService', 'generic-search.GenericSearchFactory', 'schema-utils.SchemaUtilFactory',
                function($scope, $routeParams, securityService, genericSearchFactory, schemaUtilFactory) {

	                var entityUri = 'uri://registries/member#';

	                $scope.searchCrit = [ {} ];

	                $scope.userList = [];
	                $scope.selectedUser = null;

	                $scope.user = {};
	                $scope.user.permissions = [];
	                $scope.user.groups = [];

	                // $scope.addCrit = function() {
	                // $scope.alert = null;
	                //
	                // if (!$scope.critTempAtt) {
	                // $scope.alert = "Attribute must be specified";
	                // return;
	                // }
	                //
	                // if (!$scope.critTempOper) {
	                // $scope.alert = "Operator must be specified";
	                // return;
	                // }
	                //
	                // if (!$scope.critTempVal) {
	                // $scope.alert = "Value must be specified";
	                // return;
	                // }
	                //
	                // $scope.searchCrit.push({
	                // attribute : $scope.critTempAtt,
	                // oper : $scope.critTempOper,
	                // value : $scope.critTempVal
	                // });
	                // $scope.critTempAtt = null;
	                // $scope.critTempOper = null;
	                // $scope.critTempVal = null;
	                // };
	                $scope.addCrit = function() {
		                $scope.searchCrit.push({});
	                }

	                $scope.removeCrit = function(index) {
		                $scope.searchCrit.splice(index, 1);
	                };

	                $scope.editCrit = function(index) {
		                $scope.critTempAtt = $scope.searchCrit[index].attribute;
		                $scope.critTempOper = $scope.searchCrit[index].oper;
		                $scope.critTempVal = $scope.searchCrit[index].value;
	                };

	                schemaUtilFactory.getCompiledSchema(entityUri).success(function(data) {

		                $scope.searchDef = genericSearchFactory.parseSearchDef(data);
		                $scope.entity = data.title;
	                }).error(function(err) {
		                $scope.alert = err;
	                });

	                function convertCriteria(crit) {
		                console.log(crit);
		                var retval = [];
		                
		                crit.map(function(c){
		                	
		                	if (c.attribute && c.attribute.path && c.operator.value) {
		                		if (!c.value){
		                			c.value='';
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
		                $scope.alert = null;
		                console.log('serarchwqsdsad');
		                genericSearchFactory.getSearch(entityUri, convertCriteria($scope.searchCrit)).success(function(data) {
			                $scope.userList = data;
		                }).error(function(err) {
			                $scope.alert = err;
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

		                perms.map(function(item) {

			                if (user.systemCredentials.permissions[item]) {
				                retval.push(item);
				                remove(perms, item);
			                }
		                });

		                return retval;
	                }

	                function fillUserGroups(user, groups) {
		                var retval = [];

		                if (!user.systemCredentials.groups == null) {
			                user.systemCredentials.groups = [];
		                }

		                console.log(groups);

		                for ( var ug in user.systemCredentials.groups) {
			                var usergroup = user.systemCredentials.groups[ug];
			                groups.map(function(item) {
				                console.log(user.systemCredentials.groups);

				                if (usergroup.id === item.id) {
					                console.log('match');
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
			                console.log($scope.user.permissions);

		                });

		                securityService.getSecurityGroups().success(function(data) {
			                $scope.groups = data;
			                $scope.user.groups = fillUserGroups($scope.selectedUser, $scope.groups);
		                });

	                };

	                $scope.updateUserSecurity = function() {
		                securityService.updateUserSecurity($scope.selectedUser.id, $scope.user.permissions, $scope.user.groups).success(function(data) {
			                $scope.selectedUser = null;
			                $scope.userList = [];
		                });
	                };

                } ])

.controller('security.personalChangePasswordCtrl',
        [ '$scope', 'security.SecurityService', '$rootScope', '$location', function($scope, SecurityService, $rootScope, $location) {
	        $scope.currentPassword = '';
	        $scope.newPassword = '';
	        $scope.newPasswordCheck = '';
	        $scope.alert = null;

	        $scope.changePassword = function() {
		        if ($scope.newPassword !== $scope.newPasswordCheck) {
			        $scope.alert = "Nové a kontrolné heslo sa nerovnajú!!!";
		        }
		        SecurityService.getChangePassword($scope.currentPassword, $scope.newPassword).success(function(data, status, headers, config) {
			        $scope.alert = 'Heslo zmenene';
		        }).error(function(data, status, headers, config) {
			        $scope.alert = 'Heslo sa nepodarilo zmeniť ' + data;
		        });
	        };
        } ]);
