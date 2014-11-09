(function() {
'use strict';

var async = require('async');
var log = require('./logging.js').getLogger('ObjectMangler.js');
var consts = require('./SchemaConstants.js');

var bson = require('mongodb').BSONPure;

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
	var context= {o:obj,s:schema};

	function mangleInternal(ctx,objFragment, schemaFragment, objPath, localCallback) {
		var propsToVisit = [];
		var prop, i;
		var propDivers = [];



		var manglerFuncFactory = function(ctx,objFragment, schemaFragment, objPath, mangler) {
			return function(callback) {
				setTimeout(function(){
					try{
						mangler.mangle(ctx,objFragment, schemaFragment, objPath, function(err, localError){
							callback(err, localError);
						});
					} catch (err) {
						log.error(err.stack);
						callback(err);
					}

				},0);
			};
		};

		for (i = 0; i < manglers.length; i++) {
			propDivers.push(
				manglerFuncFactory(ctx,objFragment, schemaFragment, objPath, manglers[i])
			);

		}

		var propDiverFuncFactory = function(ctx,propFragment, schemaPropFragment, newPath) {
			return function(callback) {
				mangleInternal(ctx,propFragment, schemaPropFragment, newPath, function(err, localErrors) {
					var j;

					if (err) {
						log.error('Mangiling of path %s failed', newPath, err);
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
				propDivers.push(propDiverFuncFactory(ctx,objFragment[i], schemaFragment[consts.ITEMS_KEYWORD], objPath.concat('.', i)));
			}
		} else if (!schemaFragment || !schemaFragment[consts.OBJECT_LINK_KEYWORD]){
			// Dive into properties and mangle them
			if (objFragment && (typeof objFragment === 'object')) {
				for (prop in objFragment) {
					if(! objFragment instanceof bson.Binary ) propsToVisit.push(prop);
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
				var newPath = objPath? objPath.concat('.', propsToVisit[i]):propsToVisit[i];
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
					propDiverFuncFactory(ctx,propFragment, schemaPropFragment, newPath)
				);
			}
		}
		async.parallelLimit(propDivers, 10, function(err, localErrors) {
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
			// setTimeout(function(){
			// },0);
			return;
		});
	}

	setTimeout(function(){
	mangleInternal(context,obj, schema, null, function(err, localErrors) {
		callback(err, localErrors);
	});

	},0);
};

/**
 * 	EXPORTS
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
