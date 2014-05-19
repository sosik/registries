'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ace-ctrl'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/schemalist', {templateUrl: 'partials/schemaList.html', controller: 'SchemaList'});
  $routeProvider.when('/schemaeditor/:id', {templateUrl: 'partials/schemaEditor.html', controller: 'AceCtrl'});
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
