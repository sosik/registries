'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MyCtrl1', ['$scope', function($scope) {
	  

  }])
  .controller('MyCtrl2', ['$scope', function($scope) {

  }])

   .controller('SchemaList', ['$scope', function($scope) {
    $scope.schemaList = [
                         {
                        	    "type": "f",
                        	    "size": 0,
                        	    "contentType": "image/jpeg",
                        	    "name": "test.jpg"
                        	  }
                        ];
    }]);
