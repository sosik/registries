angular.module('schema-editor', [])

.config(['$routeProvider', function($routeProvider) {
	  $routeProvider.when('/schema/list', {templateUrl: 'partials/schemaList.html', controller: 'schemaListCtrl'});
	  $routeProvider.when('/schema/edit/:id', {templateUrl: 'partials/schemaEditor.html', controller: 'schemaEditorCtrl'});
	}])


.factory('schema-editor.SchemaEditorService', [ '$http', '$rootScope', function($http, $rootScope) {
	var service = {};

	service.getSchemaList = function() {
		return $http({
		    method : 'GET',
		    url : '/schema/ls/',
		})
	};

	service.getFileContent = function(path) {
		var pathContext = 'schema/get/' + path;
		return $http({
		    method : 'GET',
		    url : pathContext,
		    responseType : 'text'
		})
	};

	service.getPostContent = function(path, bytes) {
		var pathContext = 'schema/replace/' + path;
		return $http({
		    method : 'PUT',
		    url : pathContext,
		    data : bytes,
		    headers : {
			    'Content-Type' : 'application/octet-stream'
		    }
		})
	};


	return service;
} ])
.controller('schemaEditorCtrl', [ '$scope', '$routeParams', 'schema-editor.SchemaEditorService', function($scope, $routeParams, schemaService) {

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

	schemaService.getFileContent($scope.path).success(function(data) {
		$scope.aceModel = JSON.stringify(data, null, 4);
		;
	});

	$scope.postData = function(data) {
		schemaService.getPostContent($scope.path, data).success(function(data) {
			console.log('upload done', $scope.path, data);
		});
	}

} ])
.controller('schemaListCtrl', [ '$scope', 'schema-editor.SchemaEditorService', function($scope, schemaService) {

	$scope.schemaList = [];

	schemaService.getSchemaList().success(function(data) {
		$scope.schemaList = data;
	});

	$scope.selectSchema=function(schema){
		$scope.selectSchema=schema;

		schemaService.getFileContent($scope.path).success(function(data) {
			$scope.aceModel = JSON.stringify(data, null, 4);
		});
	}

	$scope.modes = [ 'JSON', 'Scheme', 'XML', 'Javascript' ];
	$scope.mode = $scope.modes[0];
	$scope.path = $scope.selectSchema.name;

	$scope.aceLoaded = function(_editor) {
		// Options
		_editor.setReadOnly(false);
		_editor.getSession().setMode('ace/mode/json');
		ace.config.set("basePath", "/libs/ace-builds/src");
	};

	

	$scope.postData = function(data) {
		schemaService.getPostContent($scope.path, data).success(function(data) {
			console.log('upload done', $scope.path, data);
		});
	}


} ]);