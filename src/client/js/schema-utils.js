angular.module('schema-utils', ['registries'])
.factory('schema-utils.SchemaUtilFactory', [ '$http', 'registries.safeUrlEncoder', function($http, urlEncoder) {
	var service = {};

	/**
	 * combines schemaUri and suffix to valid schema definition uri.
	 * It does proper URI escaping
	 */
	service.getCompiledSchema = function(schemaUri, suffix) {
		var _schemaUri = schemaUri;
		
		if (suffix){
		 _schemaUri = this.concatUri(schemaUri, suffix);
		}
		
		return $http({
			method : 'GET',
			cache: true,
			url : '/schema/compiled/' + this.encodeUri(_schemaUri)
		});

	};

	service.listBySchema = function(schemaUri) {
		return $http({
			method : 'GET',
			url : '/udao/listBySchema/'+service.encodeUri(schemaUri)
		});
	};

	/**
	 * Generates empty object from schema
	 *
	 * @param {object} schema object to generate object by
	 * @param {object} object that will be enriched by properties descripbed in schema
	 */
	service.generateObjectFromSchema = function generateObjectFromSchema(schema, obj) {
		var _obj = obj;
		angular.forEach(schema.properties, function(value, key){
			if (value.type === 'object') {
				_obj[key] = {};
				generateObjectFromSchema(value, _obj[key]);
			} else if (value.type === 'array') {
				_obj[key] = [];
			} else {
				if (value.default) {
					_obj[key] = value.default;
				} else {
					_obj[key] = '';
				}
			}
		});
	};


	/**
	 * concatenates schema uri and fragment in propper way
	 */
	service.concatUri = function(schemaUri, suffix) {
		console.log(schemaUri, suffix);
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
	};

	/**
	 * encodes string to be uri compatible but not decoded by infrastructure itself
	 */
	service.encodeUri = function(schemaUri) {
		return (urlEncoder.encode(schemaUri));
	};

	/**
	 * decodes previously encoded string
	 */
	service.decodeUri = function(schemaUri) {
		return (urlEncoder.decode(schemaUri));
	};

	return service;
} ])
/**
 * Filter for encoding url directly in html code
 */
.filter('uriescape', ['schema-utils.SchemaUtilFactory', function(schemaUtilFactory) {
	return  function(data){return schemaUtilFactory.encodeUri(data);};
}]);
