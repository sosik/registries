(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:SecurityProfileEditCtrl', [
		'$scope',
		'$routeParams',
		'xpsui:SecurityService',
		'xpsui:GenericSearchFactory',
		'xpsui:SchemaUtil',
		'xpsui:NotificationFactory',
		function($scope, $routeParams, securityService, genericSearchFactory, schemaUtilFactory, notificationFactory) {

			var entityUri = 'uri://registries/security#profilesmaster';

			$scope.profileList = [];
			$scope.selectedProfile = null;

			$scope.profile = {};
			$scope.profile.permissions = [];
			$scope.profile.groups = [];



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
				$scope.schema = data;
				$scope.addCrit({});

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
						if (c.attribute.objectLink2){
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
						if (c.attribute.render && c.attribute.render.objectLink2){
							retval.push({
								schema: c.schema,
								f : c.attribute.path,
								v : c.obj ? c.obj.oid : null,
								expr : c.expr,
								op : c.operator.value,
								obj: c.obj
							});
						}
						else {
							retval.push({
								schema: c.schema,
								f : c.attribute.path,
								v : c.value,
								expr : c.expr,
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
						schemaCrit.crits.map(function(crit){
							var modelCrit={schema:schemaCrit.applySchema,operator:mapOperator(crit.op),attribute:crit.f,value:crit.v};
								$scope.schemaChange(modelCrit,function(c){
										c.attribute=mapAttribute( c.attDef.attributes,c.attribute);
										c.obj=crit.obj;
										c.expr=crit.expr;
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
