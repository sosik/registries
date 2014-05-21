'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var module=angular.module('myApp.services', []);
module.value('version', '0.1');
module.factory('schemaApiService', function($http) {

	    var schemaApi = {};

	    schemaApi.getSchemaList = function() {
	      return $http({method: 'GET', url: '/schema/ls/', })
	    };
	    
	    
	    schemaApi.getFileContent = function(path) {
	    	  var pathContext = 'schema/get/'+path;
		      return $http({method: 'GET', url: pathContext,responseType: 'text'})
		    };

	    
	    
	    schemaApi.getPostContent = function (path,bytes){
	    	var pathContext = 'schema/replace/'+path;
	    	return $http({ 
	        method: 'PUT',
	        url: pathContext,
	        data: bytes,
	        headers: {'Content-Type': 'application/octet-stream'}})
	    };
	    
	    return schemaApi;
	  });
	  
