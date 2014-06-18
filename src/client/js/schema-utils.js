angular.module('schema-utils', [])

.factory('schema-utils.SchemaUtilFactory', [ '$http', '$rootScope', function($http, $rootScope) {
	var service = {};

	service.getCompiledSchema = function(schemaUri) {

		return $http({
		    method : 'GET',
		    url : '/schema/compiled/' + encodeURIComponent(schemaUri)
		});

	};

	return service;
} ]).filter('uriescape', function() {
  return  function(data){return encodeURIComponent(encodeURIComponent(data));};
});