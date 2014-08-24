(function() {
'use strict';

var async = require('async');
var log = require('./logging.js').getLogger('ObjectMangler.js');
var consts = require('./SchemaConstants.js');

function ObjectManglerError (message) {
	this.message = message;
}

/**
 * Magles object by schema
 *
 * @param {array} manglers - list of manglers to use
 */
function ObjectMangler(manglers) {
	this.manglers = manglers || [];
}

ObjectMangler.prototype.mangle = function(obj, schema, callback) {
	var manglers = this.manglers;
	function mangleInternal(objFragment, schemaFragment, objPath, localCallback) {
		var propsToVisit = [];
		var prop, i;
		var propDivers = [];


		var manglerFuncFactory = function(objFragment, schemaFragment, objPath, mangler) {
			return function(callback) {
				mangler.mangle(objFragment, schemaFragment, objPath, function(err, localError){
					callback(err, localError);
				});
			};
		};

		for (i = 0; i < manglers.length; i++) {
			propDivers.push(
				manglerFuncFactory(objFragment, schemaFragment, objPath, manglers[i])
			);

		}

		var propDiverFuncFactory = function(propFragment, schemaPropFragment, newPath) {
			return function(callback) {
				mangleInternal(propFragment, schemaPropFragment, newPath, function(err, localErrors) {
					var j;

					if (err) {
						callback(err);
					}

					// flatten localErrors
					var flatErrors = [];
					if (localErrors && Array.isArray(localErrors)) {
						for (j = 0; j < localErrors.length; j++) {
							if (Array.isArray(localErrors[j])) {
								flatErrors = flatErrors.concat(localErrors[j]);
							} else {
								if (localErrors[j]) {
									flatErrors.push(localErrors[j]);
								}
							}
						}
					}
					callback(null, flatErrors);
					return;
				});
			};
		};

		if (schemaFragment && schemaFragment[consts.TYPE_KEYWORD] === 'array' && objFragment && Array.isArray(objFragment)) {
			for (i = 0; i < objFragment.length; i++) {
				propDivers.push(propDiverFuncFactory(objFragment[i], schemaFragment[consts.ITEMS_KEYWORD], objPath.concat('.', i)));
			}
		} else if (!schemaFragment || !schemaFragment[consts.OBJECT_LINK_KEYWORD]){
			// Dive into properties and mangle them
			if (objFragment && (typeof objFragment === 'object')) {
				for (prop in objFragment) {
					propsToVisit.push(prop);
				}
			}

			if (schemaFragment && (typeof schemaFragment === 'object') && schemaFragment[consts.PROPERTIES_KEYWORD]) {
				for (prop in schemaFragment[consts.PROPERTIES_KEYWORD]) {
					if (propsToVisit.indexOf(prop) === -1) {
						propsToVisit.push(prop);
					}
				}
			}

			// there are properties to dive in
			for (i = 0; i < propsToVisit.length; i++) {
				var newPath = objPath.concat('.', propsToVisit[i]);
				log.silly('Investigating property %s', newPath);
				
				var propFragment = null;
				var schemaPropFragment = null;
				if (objFragment && objFragment[propsToVisit[i]]) {
					propFragment = objFragment[propsToVisit[i]];
				}

				if (schemaFragment && schemaFragment[consts.PROPERTIES_KEYWORD] && schemaFragment[consts.PROPERTIES_KEYWORD][propsToVisit[i]]) {
					schemaPropFragment = schemaFragment[consts.PROPERTIES_KEYWORD][propsToVisit[i]];
				}
				
				propDivers.push(
					propDiverFuncFactory(propFragment, schemaPropFragment, newPath)
				);
			}
		}
		async.parallel(propDivers, function(err, localErrors) {
			log.silly('Final callback of %s', objPath);
			// flatten localErrors
			var flatErrors = [];
			var j;
			if (localErrors && Array.isArray(localErrors)) {
				for (j = 0; j < localErrors.length; j++) {
					if (Array.isArray(localErrors[j])) {
						flatErrors = flatErrors.concat(localErrors[j]);
					} else {
						if (localErrors[j]) {
							flatErrors.push(localErrors[j]);
						}
					}
				}
			}
			localCallback(err, flatErrors);
			return;
		});
	}

	mangleInternal(obj, schema, consts.ROOT_KEYWORD, function(err, localErrors) {
		callback(err, localErrors);
	});
};

/**
 * EXPORTS
 */
module.exports = {
	/**
	 * Function return new instance of ObjectMangler
	 */
	create: function(manglers) {
		return new ObjectMangler(manglers);
	}
};
}());
