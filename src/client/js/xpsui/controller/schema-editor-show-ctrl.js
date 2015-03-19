(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:SchemaEditorShowCtrl', [
		'$scope', '$routeParams', '$location', 'schema', 'xpsui:SchemaEditorService', 'xpsui:NotificationFactory',
		function ($scope, $routeParams, $location, schema, schemaService, notificationFactory) {

			$scope.schema = JSON.stringify(schema, null, "\t");
			$scope.loading = false;

			$scope.aceConfig = {
				useWrapMode: true,
				showGutter: true,
				theme: 'twilight',
				mode: 'json',
				onLoad: function aceOnLoad(_editor) {
					// Options
					_editor.setReadOnly(false);
					_editor.getSession().setMode('ace/mode/json');
					ace.config.set("basePath", "/libs/ace-builds/src");
				}
			};

			$scope.postData = function saveSchema(data) {
				$scope.loading = true;
				try {
					schemaService.getPostContent($routeParams.schema,
						JSON.stringify(JSON.parse(data), null, '\t')).success(function redirectToIndex(data) {
							// On success go to the index
							$location.url('/schema/edit');
						}).error(function displayError(err) {
							$scope.alert = err;
							$scope.loading = false;
						});
				}
				catch (err) {
					$scope.loading = false;
					notificationFactory.error({
						type: 'error',
						text: 'Nevalidná schéma: ' + err.message,
						deletable: true,
						time: -1,
						timeout: null
					});
				}

			}

		}
	]);

}(window.angular));