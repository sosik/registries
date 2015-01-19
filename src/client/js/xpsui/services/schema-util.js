(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:SchemaUtil', [  '$http', '$parse', function($http, $parse) {

		return {
			getCompiledSchema: function(schemaUri, suffix) {
				var _schemaUri = schemaUri;
				
				if (suffix){
				 	_schemaUri = this.concatUri(schemaUri, suffix);
				}
				
				return $http({
					method : 'GET',
					cache: true,
					url : '/schema/compiled/' + this.encodeUri(_schemaUri)
				});

			},

			concatUri: function(schemaUri, suffix) {
				
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
			},

			/**
			 * @param {string} schema 	e.g. uri//registries/componaies
			 * @param {object} fields  	e.g. {"name": "baseData.name"}
			 * @param {function} callback
			 */
			getFieldsSchemaFragment: function(schema, fields, callback){
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

			encodeUri: function(schemaUri) {
				return (this.encode(schemaUri));
			},
			/**
			 * @todo the method is in src/shared/js/. Fix required module from 
			 *		angular.module('registries').factory('registries.safeUrlEncoder', [function() {
			 */
			encode: function(_in) {
				var tmp = encodeURIComponent(_in);
				tmp = tmp.replace(/~/g, '%7E');
				var out = tmp.replace(/%/g, '~');

				return out;
			}
		};
		
	} ]);

}(window.angular));