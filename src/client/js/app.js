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
  $routeProvider.when('/schemalist', {templateUrl: 'partials/schemaList.html', controller: 'SchemaListCtrl'});
  $routeProvider.when('/schemaeditor/:id', {templateUrl: 'partials/schemaEditor.html', controller: 'AceCtrl'});
  $routeProvider.when('/login', {templateUrl: 'partials/LoginPage.html', controller: 'LoginCtrl'});
  
  $routeProvider.when('/security/roles', {templateUrl: 'partials/securityRoleList.html', controller: 'SecurityCtrl'})
  
  $routeProvider.when('/user/list', {templateUrl: 'partials/userList.html', controller: 'UserCtrl'});
  
  $routeProvider.when('/user/edit/:id', {templateUrl: 'partials/userEdit.html', controller: 'UserEditCtrl'});
  
  $routeProvider.when('/changepassword', {templateUrl: 'partials/ChangePasswordPage.html', controller: 'LoginCtrl'});
  //$routeProvider.otherwise({redirectTo: '/schemalist'});
}]);