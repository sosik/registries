(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:RegistryCustomTemplateCtrl', ['$scope', '$routeParams', '$http', 
		'xpsui:SchemaUtil', 'xpsui:NotificationFactory', '$location', 'xpsui:NavigationService',
		function($scope, $routeParams, $http, schemaUtilFactory, notificationFactory, $location, navigationService) {
			$scope.model = {};
			$scope.currentSchemaUri = schemaUtilFactory.decodeUri($routeParams.schema);

			
			if ($routeParams.template == 'createMember.html') {
				$http({ method : 'GET',
					url: '/udao/getBySchema/uri~3A~2F~2Fregistries~2Frequisitions~23views~2FpeopleRegistrationApplicant~2Fview'
						+ '/' + $routeParams.id})
				.success(function(data, status, headers, config) {
					var copyFields = [
					                  { 'path': 'model.obj', 'value': data }
					];
					navigationService.navigateToPath(
							'/registry/new/uri~3A~2F~2Fregistries~2Fpeople~23views~2Ffullperson', 
							copyFields);
					$location.path("/registry/new/uri~3A~2F~2Fregistries~2Fpeople~23views~2Ffullperson");
				}).error(function(err) {
					notificationFactory.error(err);
				});
				return;
			}
		}
	]);
}(window.angular));
