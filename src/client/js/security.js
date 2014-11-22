'use strict';
angular.module('security', [ 'generic-search', 'schema-utils'])
//
.factory(
		'security.SecurityService',
		[
				'$http',
				'$rootScope','schema-utils.SchemaUtilFactory',
				function($http, $rootScope,schemaUtilFactory) {
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
							method : 'GET',
							url : '/udao/listBySchema/'+schemaUtilFactory.encodeUri(entityUri),
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
				} ])
//
.controller('security.loginCtrl', [ '$scope', 'security.SecurityService', '$rootScope', '$location','psui.notificationFactory', function($scope, SecurityService, $rootScope, $location,notificationFactory) {
	// FIXME remove this in production
	// $scope.user = 'johndoe';
	// $scope.password = 'johndoe';
	$scope.user = '';
	$scope.password = '';

	/**
	 * Login button click
	 */
	$scope.login = function() {
		SecurityService.getLogin($scope.user, $scope.password).success(function(user) {
			if (user.systemCredentials.profiles.length>1){
				$scope.profiles=user.systemCredentials.profiles;
			}
			else {
				SecurityService.selectProfile(user.systemCredentials.profiles[0].id).success(function(){
					SecurityService.getCurrentUser().success(function(data){
					$rootScope.security.currentUser=data;
					$location.path('/personal-page');
					});
				});
			}
		}).error(function(err) {
			if (err){
				console.log(err);
			}
			delete $rootScope.security.currentUser;
			var mes = {translationCode:'login.authentication.failed',time:5000};
			notificationFactory.error(mes);
		});
	};

	$scope.selectProfile=function(){
		if (!$scope.selectedProfile) return;
		SecurityService.selectProfile($scope.selectedProfile.id).success(function(){
			 SecurityService.getCurrentUser().success(function(data){
				$rootScope.security.currentUser=data;
				$location.path('/personal-page');
			});
		});
	};

	$scope.resetPassword = function() {
		SecurityService.getResetPassword($scope.user);
	};
} ])
//
.controller(
		'security.logoutCtrl',
		[ '$scope', 'security.SecurityService', '$location',
				function($scope, SecurityService, $location) {
					$scope.logout = function() {
						SecurityService.getLogout().then(function() {
							$scope.security.currentUser = undefined;
							$location.path('/login');
						});
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

					var entityUri = 'uri://registries/user#security';
					var pageSize=20;

					$scope.userList = [];
					$scope.selectedUser = null;

					$scope.user = {};

					$scope.headers = {};

					$scope.profiles=[];
					$scope.user.profiles=[];

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


					function convertSortBy(searchBy){
						if (!searchBy)  {
							return null;
						}
						return [{ f:searchBy.header.field, o: searchBy.direction}];
					}

					$scope.search = function() {
						var c = convertCriteria($scope.searchCrit);
						// add forced criteria

					$scope.lastCriteria=JSON.parse(JSON.stringify(c));

					genericSearchFactory.getSearch(entityUri, c,convertSortBy( $scope.sortBy),0,pageSize).success(function(data) {
						$scope.userList = data;
					}).error(function(err) {
						notificationFactory.error(err);
					});
				};


					$scope.searchNext = function() {
						var c = convertCriteria($scope.searchCrit);
		// add forced criteria

						genericSearchFactory.getSearch(entityUri, $scope.lastCriteria,convertSortBy( $scope.sortBy),$scope.userList.length,pageSize).success(function(data) {

						data.map(function (newItems){
							$scope.userList.push(newItems);
						});


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

					$scope.addProfile = function(value) {
						$scope.user.profiles.push(value);
						remove($scope.profiles, value);
					};
					$scope.removeProfile = function(value) {
						$scope.profiles.push(value);
						remove($scope.user.profiles, value);
					};

					function fillUserProfiles(user, groups) {
						var retval = [];

						if (!('systemCredentials' in user)){
							 user.systemCredentials={};
						}
						if ( !('profiles' in user.systemCredentials)) {
							user.systemCredentials.profiles = [];
						}

						user.systemCredentials.profiles.map(function(pr){
							groups.map(function(item) {
								if (pr === item.id) {
									retval.push(item);
									remove(groups, item);
								}
							});
						});

						return retval;
					}

					$scope.selectUser = function(user) {
						$scope.selectedUser = user;

						securityService.getSecurityProfiles().success(function(data) {
							$scope.profiles = data;
							$scope.user.profiles = fillUserProfiles($scope.selectedUser, data);
						}).error(function(err){ notificationFactory.error(err);});

						if (!('systemCredentials' in user)){
							user.systemCredentials={};
							if ('contactInfo' in user && 'email' in user.contactInfo){
								user.systemCredentials.login={loginName:user.contactInfo.email,email:user.contactInfo.email};
								setTimeout( $scope.updateUserSecurity(),2000);
							} else {
									user.systemCredentials={};
									user.systemCredentials.login={loginName:''};
							}
						}

					};

					function convertProfiles(profiles){
						var retval=[];

						for (var profile in profiles){
							retval.push(profiles[profile].id);
						}

						return retval;
					}

					$scope.updateUserSecurity = function() {
						securityService.updateUserSecurity($scope.selectedUser.id, $scope.selectedUser.systemCredentials.login.loginName,$scope.selectedUser.systemCredentials.login.email,convertProfiles( $scope.user.profiles)).success(function() {
							notificationFactory.info({translationCode:'security.user.edit.modification.done',time:3000});
							$scope.search();
						}).error(function (err){
							console.log(err);
							notificationFactory.error(err)});
					};

					$scope.resetPassword= function (){
						 securityService.updateUserSecurity($scope.selectedUser.id, $scope.selectedUser.systemCredentials.login.loginName,$scope.selectedUser.systemCredentials.login.email, $scope.user.permissions, $scope.user.groups,$scope.user.profiles).success(function() {
							 securityService.getResetPassword($scope.selectedUser.id).success(function (){
								 notificationFactory.info({type:'info',text:'Nové heslo bolo zaslané na: ' +$scope.selectedUser.systemCredentials.login.email,deletable : true, time:5000, timeout: null});
								 }).error(function (err){
									 console.log(err);
									 notificationFactory.error(err);
									 });

						 }).error(function (err){
							 console.log(err);
							 notificationFactory.error(err);
							 });
					};

				} ])
//
.controller(
		'security.profileEditCtrl',
		[ '$scope', '$routeParams', 'security.SecurityService', 'generic-search.GenericSearchFactory', 'schema-utils.SchemaUtilFactory',
				'psui.notificationFactory', function($scope, $routeParams, securityService, genericSearchFactory, schemaUtilFactory, notificationFactory) {

					var entityUri = 'uri://registries/security#profilesmaster';

					$scope.profileList = [];
					$scope.selectedProfile = null;

					$scope.profile = {};
					$scope.profile.permissions = [];
					$scope.profile.groups = [];
					$scope.headers = {};



					$scope.removeCrit = function(index) {
						$scope.searchCrit.splice(index, 1);
					};

					$scope.searchCrit = [];
					$scope.profileCrit=[];

					$scope.editCrit = function(index) {
						$scope.critTempAtt = $scope.searchCrit[index].attribute;
						$scope.critTempOper = $scope.searchCrit[index].oper;
						$scope.critTempVal = $scope.searchCrit[index].value;
					};

					$scope.addCrit = function() {
						$scope.searchCrit.push({});
					};

					$scope.addProfileCrit = function() {
						$scope.profileCrit.push({});
					};
					$scope.removeProfileCrit = function(index) {
						$scope.profileCrit.splice(index, 1);
					};

					$scope.schemaChange=function(crit,done) {
						schemaUtilFactory.getCompiledSchema(crit.schema).success(function(data) {
						crit.attDef = genericSearchFactory.parseSearchDef(data);

						if (done) done(crit);

					}).error(function(err) {
						notificationFactory.error(err);

					});


					};

					schemaUtilFactory.getCompiledSchema(entityUri, 'search').success(function(data) {
						$scope.searchDef = genericSearchFactory.parseSearchDef(data);
						$scope.entity = data.title;
						$scope.addCrit({});
						$scope.headers = data.listFields;

					}).error(function(err) {
						notificationFactory.error(err);

					});

					securityService.getSecuritySearchSchemas().success(function(data){
						$scope.searchSchemas=data;
					}).error(function(err) {
						notificationFactory.error(err);

					});

					function mapOperator(operator){
						for(var op in $scope.searchDef.operators){
							if ($scope.searchDef.operators[op].value===operator) return $scope.searchDef.operators[op];
						}
					}

					function mapAttribute(attributes,attribute){
						for(var att in attributes){
							if (attributes[att].path===attribute){
							return attributes[att];
							}
						}
					}

					function convertCriteria(crit) {

						var retval = [];

						crit.map(function(c) {
							if (c && c.attribute && c.attribute.path) {
								if (c.attribute.objectLink){
									retval.push({
										f : c.attribute.path,
										v : c.object.oid,
										op : c.operator.value
									});
								}
								else {
									retval.push({
										f : c.attribute.path,
										v : c.value,
										op : c.operator.value
									});
								}

							}
						});
						return retval;
					}

					function convertProfileCriteria(crit) {

						var retval = [];

						crit.map(function(c) {
							if (c && c.attribute && c.attribute.path) {
								if (c.attribute.render && c.attribute.render.objectLink){
									retval.push({
										schema: c.schema,
										f : c.attribute.path,
										v : c.obj.oid,
										op : c.operator.value,
										obj: c.obj
									});
								}
								else {
									retval.push({
										schema: c.schema,
										f : c.attribute.path,
										v : c.value,
										op : c.operator.value
									});
								}

							}
						});
						return retval;
					}


					$scope.search = function() {
						genericSearchFactory.getSearch(entityUri, convertCriteria($scope.searchCrit)).success(function(data) {
							$scope.profileList = data;
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
						$scope.profile.permissions.push(value);
						remove($scope.permissions, value);

					};
					$scope.removePermission = function(value) {
						$scope.permissions.push(value);
						remove($scope.profile.permissions, value);
					};

					$scope.addGroup = function(value) {
						$scope.profile.groups.push(value);
						remove($scope.groups, value);

					};
					$scope.removeGroup = function(value) {
						$scope.groups.push(value);
						remove($scope.profile.groups, value);
					};

					function fillProfilePerm(profile, perms) {
						var retval = [];
						if ( 'security' in profile ){
							if('permissions' in profile.security ){
								for(var per in profile.security.permissions ){
									if (profile.security.permissions[per]){
										retval.push(per);
										remove(perms, per);
									}
								}
							}
						}

						return retval;
					}

					function fillProfileGroups(profile, groups) {
						var retval = [];

						if (!('security' in profile)){
							 profile.security={};
						}
						if ( !('groups' in profile.security)) {
							profile.security.groups = [];
						}

						for ( var ug in profile.security.groups) {
							var profilegroup = profile.security.groups[ug];
							groups.map(function(item) {

								if (profilegroup.id === item.id) {
									retval.push(item);
									remove(groups, item);
								}

							});
						}

						return retval;
					}



					$scope.selectProfile = function(profile) {
						$scope.selectedProfile = profile;
						$scope.profileCrit=[];

						if (!('security' in profile)){
							profile.security={};
						}

						if ( !('groups' in profile.security)) {
							profile.security.groups = [];
						}
						if ('forcedCriteria' in profile.security){
							profile.security.forcedCriteria.map(function(schemaCrit){
								schemaCrit.criteria.map(function(crit){
									var modelCrit={schema:schemaCrit.applySchema,operator:mapOperator(crit.op),attribute:crit.f,value:crit.v};
										$scope.schemaChange(modelCrit,function(c){
												c.attribute=mapAttribute( c.attDef.attributes,c.attribute);
												c.obj=crit.obj;
												$scope.profileCrit.push(c);
										});

								});

							});
						}
						securityService.getSecurityPermissions().success(function(data) {
							$scope.permissions = data;
							$scope.profile.permissions = fillProfilePerm($scope.selectedProfile, data);

						}).error(function(err){ notificationFactory.error(err);});

						securityService.getSecurityGroups().success(function(data) {
							$scope.groups = data;
							$scope.profile.groups = fillProfileGroups($scope.selectedProfile, $scope.groups);
						}).error(function(err){
							 notificationFactory.error(err);
							});

					};

					$scope.updateProfileSecurity = function() {
						securityService.updateProfileSecurity($scope.selectedProfile.id, $scope.selectedProfile.baseData.name, $scope.profile.permissions, $scope.profile.groups,convertProfileCriteria($scope.profileCrit)).success(function(data) {
							notificationFactory.info({translationCode:'security.profile.edit.modification.done',time:3000});
							$scope.search();
						}).error(function (err){
							console.log(err);
							notificationFactory.error(err)});
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
							SecurityService.getChangePassword($scope.currentPassword, $scope.newPassword).success(function(data) {
						var mes = {translationCode:'personal.change.password.password.changed'};
						notificationFactory.info(mes);
							}).error(function(err,data) {
						var mes = {translationCode:'security.user.missing.permissions',translationData:data,time:3000};
						notificationFactory.error(mes);
							});
						}
					};
				} ]);
