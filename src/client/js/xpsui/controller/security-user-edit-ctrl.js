(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller( 'xpsui:SecurityUserEditCtrl', [
		'$scope',
		'$routeParams',
		'xpsui:SecurityService',
		'xpsui:GenericSearchFactory',
		'xpsui:SchemaUtil',
		'xpsui:NotificationFactory',
		function($scope, $routeParams, securityService, genericSearchFactory, schemaUtilFactory, notificationFactory) {

			var entityUri = 'uri://registries/userSecurity';
			var pageSize=20;

			$scope.userList = [];
			$scope.selectedUser = null;

			$scope.user = {};

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
				$scope.schema = data;
				$scope.addCrit({});
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

			$scope.fieldKeyDown = function($event) {
				if ($event.keyCode == 13) {
					$scope.search();
					//$event.stopPropagation();
					$event.preventDefault();
					return false;
				}
			};
		}
	]);

}(window.angular));
