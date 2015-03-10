(function(angular) {
	'use strict';

	angular.module('xpsui:filters')
	.filter('xpsuiuriescape', ['xpsui:SchemaUtil', function(schemaUtilFactory) {
		return  function(data){return schemaUtilFactory.encodeUri(data);};
	}]);

}(window.angular));