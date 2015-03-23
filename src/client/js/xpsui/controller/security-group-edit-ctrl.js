(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:SecurityGroupEditCtrl', [
		'$scope',
		'xpsui:SecurityService',
		'xpsui:SchemaUtil',
		'xpsui:NotificationFactory',
		'schema',
		function($scope, SecurityService, schemaUtilFactory, notificationFactory, schema) {

			$scope.groups = [];
			$scope.selectedGroup = null;
			$scope.group = {};
			$scope.group.permissions = [];

			$scope.schemaFormOptions = {
				modelPath : 'selectedSchema',
				schema : {}
			};

			$scope.schemaFormOptions.schema = schema;

			// schemaUtilFactory.getCompiledSchema('uri://registries/security#groupmaster', 'new').success(function(data) {
			// 	$scope.schemaFormOptions.schema = data;
			// }).error(function(err) {
			// 	notificationFactory.error(err);
			// });

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

		} 
	]);
	
}(window.angular));