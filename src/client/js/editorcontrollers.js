'use strict';


var config = require("ace/config");
//config.set("packaged",true)

var path = "/lib/ace-builds/src";
config.set("workerPath", path);
config.set("modePath", path);
config.set("themePath", path);


angular.module('ace-ctrl', [ 'ui.ace' ]).controller(
		'AceCtrl',
		[
				'$scope',
				'$routeParams',
				'schemaApiService',
				function($scope, $routeParams, schemaApiService) {

					// The modes

					$scope.modes = [ 'JSON', 'Scheme', 'XML', 'Javascript' ];
					$scope.mode = $scope.modes[0];
					$scope.path = $routeParams.id;

					
					$scope.aceLoaded = function(_editor) {
					    // Options
					    _editor.setReadOnly(false);
					    _editor.getSession().setMode('ace/mode/json');
					    ace.config.set("basePath", "/libs/ace-builds/src");
					  };

					
					schemaApiService.getFileContent($scope.path).success(
							function(data) {
								$scope.aceModel = JSON.stringify(data, null, 4);;
							});

					$scope.postData= function (data){
						 schemaApiService.getPostContent($scope.path,data).success(
									function(data) {
										console.log('upload done',$scope.path,data);
									});
					}
					
				} ]);
