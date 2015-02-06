(function(angular) {
	'use strict';

	/**
	 * Easy object access using dot notation
	 *
	 * TODO: Move this to some utils module
	 *
	 * @param obj
	 * @param key
	 * @param def
	 * @returns {*}
	 */
	function dotAccess(obj, key, def) {
		key = Array.isArray(key) ? key : key.split('.');
		for (var i = 0, l = key.length; i < l; i++) {
			var part = key[i];
			if (!(part in obj)) return def;
			obj = obj[part];
		}
		return obj;
	}

	angular.module('xpsui:services')
		.factory('xpsui:Calculator:ComputationRegistry', [ '$q', function(q) {

			// TODO: Move this to the shared and import it here with require()
			// This will be exported as shared library for the server and browser
			// when the browserify will work
			return 	{

				/**
				 * Default noop function
				 *
				 * @param {*} args
				 * @returns {*}
				 */
				noop: function(args) { return args; },

				/**
				 * Concat all values from args - keys are sorted, before concatenation
				 *
				 * @param {object|array} args
				 * @returns {string}
				 */
				concat: function(args) {
					var keys = Object.keys(args).sort(),
						result = '';
					for (var i = 0; i < keys.length; i++) {
						result = result.concat(args[keys[i]])
					}
					return result;
				},

				/**
				 * Get value from the scope object
				 *
				 * @param {object} args Args must be an object with "path" property
				 * @param {object} scope
				 * @param {*} def
				 * @returns {*}
				 */
				'get': function(args, scope, def) {
					var deferred = q.defer();

					if (!args.path) {
						deferred.reject("Invalid Schema: args.path not found!");
					} else {
						deferred.resolve(dotAccess(scope, args.path, def));
					}

					return deferred.promise;
				}
			};

		}])

		.factory('xpsui:Calculator:ComputedProperty', [ '$q', 'xpsui:Calculator:ComputationRegistry', function(q, computationRegistry) {

			// TODO: Move this to the shared and import it here with require()

			/**
			 * Constructor for the ComputedProperty
			 *
			 * ```js
				{
					"onlyEmpty": false,                   // If true - modify model only if the current model value is undefined or ""
					"func": "concat",                     // Function from "xpsui:Calculator:ComputationRegistry",
					"args": {                             // {array|object} - based on the requirements of the function from ComputationRegistry
						1: "Ing.",                        // Arguments can be strings
							2: {                          // or another computation
								"func": "get",
								"args": {
								"path": "baseData.name"
							}
						}
					}
				}
			 * ```
			 * @param schema
			 * @constructor
			 */
			function ComputedProperty(schema) {
				this.schema = schema;
			}

			/**
			 * Getter function
			 *
			 * @param scope
			 * @returns {*}
			 */
			ComputedProperty.prototype.getter = function(scope) {
				var computationFunc = computationRegistry[this.schema.func] || computationRegistry.noop;

				// Check arguments
				var args = {},
					self = this;

				for (var argName in this.schema.args) {
					if (!this.schema.args.hasOwnProperty(argName)) {
						continue;
					}

					var arg = this.schema.args[argName];

					if (typeof arg === 'object') {
						var argProperty = new ComputedProperty(arg);
						args[argName] = argProperty.getter(scope);
					} else {
						args[argName] = arg; //q.when(arg);
					}
				}

				return q.all(args).then(function(results) {
					return computationFunc(results, scope, self.schema.def);
				});
			};

			ComputedProperty.prototype.watcher = function(scope) {
				var self = this;

				function collect(subschema) {
					var result = [];
					for (var argName in subschema.args) {
						if (!subschema.args.hasOwnProperty(argName)) {
							continue;
						}

						var arg = subschema.args[argName];
						// Ignore scalar arguments and arguments without watch property set to 'true'
						if (typeof arg !== 'object') {
							continue;
						}

						if (arg.func === 'get') {
							// Only if watch === true
							if (arg.watch === true) {
								result.push(dotAccess(scope, arg.args.path, arg.def));
							}
						} else if (arg.args) {
							result = result.concat(collect(arg));
						}
					}

					return result;
				}

				return function() {
					return collect(self.schema);
				}
			};

			return ComputedProperty;

		}])

		.factory('xpsui:Calculator', ['xpsui:Calculator:ComputedProperty', function(ComputedProperty) {
			return {
				/**
				 * Create new instance of the ComputedProperty
				 *
				 * @param {object} schema
				 * @returns {ComputedProperty}
				 */
				createProperty: function(schema) {
					return new ComputedProperty(schema);
				}
			}
		}]);

}(window.angular));
