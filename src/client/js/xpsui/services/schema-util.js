(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	/**
	 * @class xpsui:SchemaUtil
	 * @module client
	 * @submodule services
	 */
	.factory('xpsui:SchemaUtil', [  '$http', '$parse', 'xpsui:safeUrlEncoder', function($http, $parse, urlEncoder) {

		var service = {};

		/**
		 * Combines schemaUri and suffix to valid schema definition uri, does proper uri excaping
		 * and returns $http promise to get data from server.
		 *
		 * Http object has cache enabled.
		 *
		 * @method getCompiledSchema
		 * @static
		 * @param schemaUri uri of schema
		 * @param suffix
		 *
		 * @return {Object} fragment of schema
		 *
		 * @example
		 * .getCompiledSchema('uri://registries/people/', 'view')
		 * .success(...)
		 * .error(...)
		 */
		service.getCompiledSchema = function(schemaUri, suffix) {
			var _schemaUri = schemaUri;

			//FIXME this construction requires that schemaUri or suffix contains / at the end or beginning
			if (suffix) {
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
				method : 'POST',
				url : '/search/'+service.encodeUri(schemaUri)
			});
		};

		/**
		 * Gets schema defined by URI and extracts only required fields.
		 *
		 * @param {string} schema 	e.g. uri//registries/componaies
		 * @param {object} fields  	e.g. {"name": "baseData.name"}
		 * @param {function(fields)} callback, where fields is map of fields schema fragments
		 *
		 * @return {undefined}
		 * @method getFieldsSchemaFragment
		 * @static
		 * @async
		 */
		service.getFieldsSchemaFragment = function(schema, fields, callback) {
			// FIXME logging
			this.getCompiledSchema(schema).success(function(data) {
				var field, outFields = {};

				for(field in fields){
					var fieldProp = fields[field].split("."),
						// FIXME very nasty way to handle object path to schema path transformation
						path = [
							"properties",
							fieldProp[0],
							"properties",
							fieldProp[1]
						],
						getter = $parse(path.join('.'))
					;

					outFields[field] = getter(data);
				}

				callback(outFields);
			}).error(function(err) {
				callback(null);
			});
		},

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
		 * Fills object in scopeToFill with path/value pairs form values parameter.
		 *
		 * @param {string} scopeToFill	scope value to be filled.
		 * @param {object} values		values to fill, e.g. [ { 'path': 'model.obj.baseData.name', 'value': 'Peter' }, { 'path': 'model.obj.baseData.surName', 'value': 'Vaskovic' } ]
		 *
		 * @method fillObj
		 */
		service.fillObj = function fillObj(scopeToFill, values) {
			angular.forEach(values, function(value, key) {
				$parse(value.path).assign(scopeToFill, value.value);
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
	} ]);

}(window.angular));
