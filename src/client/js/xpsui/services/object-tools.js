(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:ObjectTools', [function() {
		function ObjectTools() {
		}

		ObjectTools.prototype.getSchemaFragmentByObjectPath = function(schema, path) {
			if (!schema) {
				// no schema
				return;
			}

			if (!path || !path.length || path.length < 1) {
				// no relevant path
				return;
			}

			var propertiesFragment;

			if (schema.type === 'array') {
				// it is array def
				propertiesFragment = schema.items;
			} else {
				// we assume schemafragment is object def
				propertiesFragment = schema.properties;
			}

			if (!propertiesFragment) {
				return;
			}

			var dotPosition = path.indexOf('.');
			if (dotPosition > -1) {
				// there is another fragment
				var pathPropName = path.substring(0, dotPosition);
				return this.getSchemaFragmentByObjectPath(propertiesFragment[pathPropName], path.substring(dotPosition+1));
			} else {
				// this is final fragment
				return propertiesFragment[path];
			}

		};

		return new ObjectTools();
	}]);
	
}(window.angular));