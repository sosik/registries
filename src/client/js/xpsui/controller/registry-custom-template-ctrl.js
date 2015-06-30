(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:RegistryCustomTemplateCtrl', ['$scope', '$routeParams', '$http', 
		'xpsui:SchemaUtil', 'xpsui:NotificationFactory', '$location', 'xpsui:NavigationService',
		function($scope, $routeParams, $http, schemaUtilFactory, notificationFactory, $location, navigationService) {
			$scope.model = {};
			$scope.currentSchemaUri = schemaUtilFactory.decodeUri($routeParams.schema);

			if ($routeParams.template == 'playerLicenseCard.html' || $routeParams.template == 'playerHostingCard.html' || $routeParams.template == 'officerCard.html') {
				$scope.model = {};
				$scope.currentSchemaUri = schemaUtilFactory.decodeUri($routeParams.schema);

				$http({ method : 'GET',url: '/udao/getBySchema/'+$routeParams.schema+'/'+ $routeParams.id})
				.success(function(data, status, headers, config){
					$scope.model = data;
				}).error(function(err) {
					notificationFactory.error(err);
				});
				return;
			};


			if ($routeParams.template == 'createMember.html') {
				$http({ method : 'GET',
					url: '/udao/getBySchema/uri~3A~2F~2Fregistries~2FregistrationRequests~23views~2FpeopleRegistrationApplicant~2Fview'
						+ '/' + $routeParams.id})
				.success(function(data, status, headers, config) {
					delete data.id;
					var copyFields = [
					                  { 'path': 'model.obj', 'value': data }
					];
					var uri = '/registry/new/uri~3A~2F~2Fregistries~2Fpeople~23views~2Ffullperson';
					navigationService.navigateToPath(uri, copyFields);
					$location.path(uri);
				}).error(function(err) {
					notificationFactory.error(err);
				});
				return;
			}

			if ($routeParams.template == 'createTransfer.html') {
				$http({ method : 'GET',
					url: '/udao/getBySchema/uri~3A~2F~2Fregistries~2FtransferRequests~23views~2FtransferApplicant~2Fview'
						+ '/' + $routeParams.id})
				.success(function(data, status, headers, config) {
					var copyFields = [
					                  { 'path': 'model.obj.baseData', 'value': data.transferData }
					];
					var uri = '/registry/new/uri~3A~2F~2Fregistries~2Ftransfers~23views~2Ftransfers';
					navigationService.navigateToPath(uri, copyFields);
					$location.path(uri);
				}).error(function(err) {
					notificationFactory.error(err);
				});
				return;
			}

			if ($routeParams.template == 'personalAccountActivation.html') {
				$http({ method : 'GET',
					url: '/udao/getBySchema/uri~3A~2F~2Fregistries~2Fpeople~23views~2Ffullperson~2Fview'
						+ '/' + $routeParams.id})
				.success(function(data, status, headers, config) {
					$http({ method : 'GET', url: '/security/profiles' })
					.success(function(dataProfiles, statusProfiles, headersProfiles, configProfiles) {
						var defaultProfile = {};
						for (var pos = 0; pos < dataProfiles.length; pos++) {
							if (dataProfiles[pos].baseData.name == 'default') {
								defaultProfile = {};
								defaultProfile.oid = dataProfiles[pos].id;
								defaultProfile.refData = { name: dataProfiles[pos].baseData.name };
							}
						}
						var email = '';
						if (data && data.contactInfo) {
							email = data.contactInfo.email;
						}
						var accountName = '';
						if (data && data.baseData) {
							accountName = data.baseData.name;
						}
						var copyFields = [
							{ 'path': 'model.obj.account.email', 'value': email },
							{ 'path': 'model.obj.account.name', 'value': accountName },
							{ 'path': 'model.obj.account.profiles', 'value': [defaultProfile] }
						];
						var uri = '/registry/new/uri~3A~2F~2Fregistries~2FpersonalAccount~23views~2FpersonalAccount';
						navigationService.navigateToPath(uri, copyFields);
						$location.path(uri);
					}).error(function(err) {
						notificationFactory.error(err);
					});
				}).error(function(err) {
					notificationFactory.error(err);
				});
				return;				
			}

		}
	]);
}(window.angular));
