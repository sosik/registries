angular.module('schema-editor', ['psui-notification'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/schema/edit', {
      templateUrl: 'partials/schema-editor-index.html',
      controller: 'schema-editor.IndexCtrl',
      permissions: ['System Admin'],
      resolve: {
        schemas: ['schema-editor.SchemaEditorService', function (schemaService) {
          return schemaService.getSchemaList().then(function (response) {
            return response.data;
          });
        }]
      }
    });

    $routeProvider.when('/schema/edit/:schema', {
      templateUrl: 'partials/schema-editor-show.html',
      controller: 'schema-editor.ShowCtrl',
      permissions: ['System Admin'],
      resolve: {
        // Load schema from the server
        schema: ['$route', 'schema-editor.SchemaEditorService', function ($route, schemaService) {
          return schemaService.getFileContent($route.current.params.schema).then(function (response) {
            return response.data;
          });
        }]
      }
    });

  }])

  .run(['$rootScope', '$location', function ($rootScope, $location) {
    // If the schema wasn't loaded, $routeChangeError will be fired
    // in this case we just redirect back to IndexCtrl
    $rootScope.$on("$routeChangeError", function (event, current, previous, rejection) {
      if (current.originalPath === '/schema/edit/:schema') {
        $location.url('/schema/edit');
        event.preventDefault();
      }
    })
  }])

//
  .factory('schema-editor.SchemaEditorService', ['$http', function ($http) {
    var service = {};

    service.getSchemaList = function () {
      return $http({
        method: 'GET',
        url: '/schema/ls/'
      })
    };

    service.getFileContent = function (path) {
      var pathContext = 'schema/get/' + path;
      return $http({
        method: 'GET',
        url: pathContext,
        responseType: 'text'
      })
    };

    service.getPostContent = function (path, bytes) {
      var pathContext = 'schema/replace/' + path;
      return $http({
        method: 'PUT',
        url: pathContext,
        data: bytes,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      })
    };


    return service;
  }])
//
  .controller('schema-editor.IndexCtrl', ['$scope', 'schemas', function ($scope, schemas) {

    $scope.schemaList = schemas;

  }])

  .controller('schema-editor.ShowCtrl', [
    '$scope', '$routeParams', '$location', 'schema', 'schema-editor.SchemaEditorService', 'psui.notificationFactory',
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

    }]);
