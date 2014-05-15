'use strict';

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

//					// The ui-ace option
//					$scope.aceOption = {
//						mode : "json",
//						theme : "twilight",
//						onLoad : function(_ace) {
//							_ace.getSession().setMode('ace/mode/json');
//							_ace.getSession().setTheme("ace/theme/twilight");
//							// HACK to have the ace instance in the scope...
//							$scope.modeChanged = function() {
//
//							};
//
//						}
//					};

					$scope.path = $routeParams.id;

					schemaApiService.getFileContent($scope.path).success(
							function(data) {
								$scope.aceModel = JSON.stringify(data, null, 4);;
							});

					schemaApiService.getPostContent();
					$scope.postData= function (){
						var f=schemaApiService.getPostContent($scope.path,$scope.aceModel);
						f();
					}
					
				} ]);
