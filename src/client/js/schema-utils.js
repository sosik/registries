angular.module('schema-utils', [])

.factory('schema-utils.SchemaUtilFactory', [ '$http', function($http) {
	var service = {};

	/**
	 * combines schemaUri and suffix to valid schema definition uri.
	 * It does proper URI escaping
	 */
	service.getCompiledSchema = function(schemaUri, suffix) {
		var _schemaUri = this.concatUri(schemaUri, suffix);
		return $http({
		    method : 'GET',
		    url : '/schema/compiled/' + this.encodeUri(_schemaUri)
		});

	};

	service.concatUri = function(schemaUri, suffix) {
		var _schemaUri = schemaUri || '';
		if (!/\/$/.test(_schemaUri)) {
			if (/#/.test(_schemaUri)) {
				// does not end with slash
				if (!/#$/.test(_schemaUri)) {
					_schemaUri += '/';
				}
			} else {
				_schemaUri += '#';
			}
		}

		return _schemaUri + (suffix || '');
	}

	service.encodeUri = function(schemaUri) {
		return (encodeURIComponent(schemaUri));
	};

	service.decodeUri = function(schemaUri) {
		return (decodeURIComponent(schemaUri));
	};

	return service;
} ])
.filter('uriescape', ['schema-utils.SchemaUtilFactory', function(schemaUtilFactory) {
  return  function(data){return encodeURIComponent(schemaUtilFactory.encodeUri(data));};
}]);
