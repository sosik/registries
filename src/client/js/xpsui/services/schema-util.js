(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:SchemaUtil', [  '$http', '$parse', 'xpsui:safeUrlEncoder', function($http, $parse, urlEncoder) {

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
		 * get schema1's fields
		 *
		 * @param {string} schema 	e.g. uri//registries/componaies
		 * @param {object} fields  	e.g. {"name": "baseData.name"}
		 * @param {function} callback
		 */
		service.getFieldsSchemaFragment = function(schema, fields, callback){
			this.getCompiledSchema(schema).success(function(data) {
				var field, outFields = {};

				for(field in fields){
					var fieldProp = fields[field].split("."),
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