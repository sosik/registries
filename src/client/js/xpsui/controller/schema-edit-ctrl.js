(function(angular) {
	'use strict';

	angular.module('xpsui:controllers')
	.controller('xpsui:SchemaEditCtrl', [ '$scope', 'xpsui:SchemaEditorService','xpsui:NotificationFactory', function($scope, schemaService,notificationFactory) {

		$scope.schemaList = [];

		schemaService.getSchemaList().success(function(data) {
			$scope.schemaList = data;
		});

		$scope.selectSchema=function(schema){
			$scope.selectedSchema=schema;
			schemaService.getFileContent(schema.name).success(function(data) {
				$scope.aceModel = JSON.stringify(data, null, '\t');
			}).error(function(err){$scope.alert=err;});
		}

		$scope.modes = [ 'JSON', 'Scheme', 'XML', 'Javascript' ];
		$scope.mode = $scope.modes[0];

		$scope.aceLoaded = function(_editor) {
			// Options
			_editor.setReadOnly(false);
			_editor.getSession().setMode('ace/mode/json');
			ace.config.set("basePath", "/libs/ace-builds/src");
		};

		
		$scope.postData = function(data) {
			try{
				schemaService.getPostContent($scope.selectedSchema.name, JSON.stringify(JSON.parse(data), null, '\t')).success(function(data) {
					$scope.selectedSchema=null;
				}).error(function(err){$scope.alert=err;});
				
			}	
			catch(err){
				console.log(err);
				notificationFactory.error({type:'error',text:'Nevalidná schéma: '+ err.message,deletable : true, time:-1, timeout: null});
			}
			
		}


	} ]);

}(window.angular));