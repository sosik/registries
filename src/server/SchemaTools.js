'use strict';

/**
 * Tools for schemas parsing, compilation and management.
 *
 * @module server
 * @submodule SchemaTools
 */
var log = require('./logging.js').getLogger('SchemaTools.js');
var URL = require('url');
var path = require('path');
var extend = require('extend');
var util = require('util');
var schemaConstants = require('./SchemaConstants.js');

/**
 * SchemaTools class. Used as main schemas manipulation class.
 *
 * @class SchemaTools
 * @constructor
 */
//TODO honor JSON pointer reference
//TODO honor JSON reference reference
//TODO honor URI reference for URI validation
//TODO handle recursive schemas properly
var SchemaTools = function() {

	// hashTable storing registered caches
	var schemasCache = {};

	/**
	* Helper function that normalizes URI to common format
	*/
	var normalizeURL = function(url) {
		//TODO do path normalization
		if (!url) {
			throw new Error('Cannot normalize undefined url');
		}

		if (!url.hash) {
			url.hash = '#';
		}

		if (url.pathname) {
			url.pathname = path.normalize(url.pathname);
		}
		return url;
	};

	/**
	 * Add schema to schema cache for uri resolution.
	 * If URI does not contain fragment (#) identification, # is appended to
	 * the end of URI.
	 *
	 * @method registerSchema
	 * @param {string} uri - resolution uri
	 * @param {string|object} schema - schema as string or json object
	 * @param {boolean} override - true if new schema should override old one
	 */
	this.registerSchema = function(uri, schema, override) {
		var schemaObj = null;

		log.silly('registering object', uri);

		if (typeof schema === 'string') {
			try {
				schemaObj = JSON.parse(schema);
			} catch (ex) {
				log.error('Failed to parse schema invalid JSON', ex);
				throw ex;
			}
		} else if (typeof schema === 'object') {
			schemaObj = schema;
		}

		if (!schemaObj) {
			throw new Error('Failed to parse schema object');
		}


		// if there is no uri provided, extract one from schema itself
		var url;
		if (uri) {
			url = normalizeURL(URL.parse(uri));
		} else {
			// extract id from schema
			if (schemaObj.id) {
				url = normalizeURL(URL.parse(schemaObj.id));

			} else {
				throw new Error('Neither uri or schema.id defined');
			}
		}

		if (schemasCache[URL.format(url)] && !override) {
			throw new Error('Schema already defined');
		}
		schemasCache[URL.format(url)] = {
			url: url,
			def: schemaObj,
			compiled: null
		};
	};

	/**
	 * Get registered schema. If there is no schema with coresponding uri,
	 * it returns null. It does deep uri identification and traversing so it
	 * can return subschema of larger schema registered by registerSchema method.
	 *
	 * @method getSchema
	 * @param {String} uri uri of schema
	 * @return {Object} schema object or null it there no such schema registered
	 */
	this.getSchema = function(uri) {
		var url = URL.parse(normalizeURL(URL.parse(uri)));
		// console.log('getSch',URL.format(url),JSON.stringify( schemasCache[URL.format(url)]));
		return schemasCache[URL.format(url)] || null;
	};


	/**
	 * finds schema-fragments that ends with specified suffix
	 *
	 * @method getSchemaNamesBySuffix
	 * @param {String} suffix suffix to look for
	 */
	this.getSchemaNamesBySuffix = function(suffix) {
		//TODO do traversing in schema structure URI and fragment information
		var retVal = [];
		// var suffix2='#'+suffix;
		var suffix2 = suffix;
		for (var schemaUrl in schemasCache) {
			if (schemaUrl.indexOf(suffix2, schemaUrl.length - suffix2.length) !== -1) {
				retVal.push(schemaUrl.toString());
			}
		}

		return retVal;
	};

	var that = this;
	var parseInternal = function(uri, schema, localPath) {
		for (var prop in schema.def) {
			switch (prop) {
				case '$schema':
				case 'id' :
				case 'type' :
				case schemaConstants.EXTENDS_KEYWORD:
				case schemaConstants.REF_KEYWORD:
					// skip schema keywords;
					break;
				default:
					var propLocalPath = null;
					var propUrl = null;

					if (schema.def[prop] && schema.def[prop].id && prop !== 'properties') {
						// id is defined, lets override canonical resolution, but only if it is not inside properties
						propUrl = URL.resolve(uri, schema.def[prop].id);
						// make id argument absolute
						schema.def[prop].id = propUrl;
						propLocalPath = URL.parse(propUrl).hash;
						propLocalPath = (propLocalPath && propLocalPath.length > 0 ? propLocalPath : '#');
					} else {
						propLocalPath = localPath + (localPath === '#' ? '' : '/') + prop;
						propUrl = URL.resolve(uri, propLocalPath);
					}

					if (schema.def[prop] && typeof schema.def[prop] === 'object') {
						// dive only if it is object
						that.registerSchema(propUrl, schema.def[prop], true);
						parseInternal(propUrl, that.getSchema(propUrl), propLocalPath);
					}
			}
		}
	};

	/**
	 * Parses all registred schema
	 *
	 * @method parse
	 */
	this.parse = function() {
		// TODO consider property ID only if it is defined in main structure not in "properties"
		for (var schemaUri in schemasCache) {
			parseInternal(schemaUri, schemasCache[schemaUri], schemasCache[schemaUri].url.hash);
		}
	};

	function diveAndUpdate(orig, changes) {
		var props = Object.getOwnPropertyNames(changes);
		for (var i = 0; i < props.length; ++i) {
			if (changes[props[i]] === null) {
				delete orig[props[i]];
			} else if (typeof changes[props[i]] === 'object') {
				if (orig.hasOwnProperty(props[i])) {
					if (typeof orig[props[i]] === 'object') {
						diveAndUpdate(orig[props[i]], changes[props[i]]);
					} else {
						orig[props[i]] = changes[props[i]];
					}
				} else {
					orig[props[i]] = changes[props[i]];
				}
			} else {
				// it is not object neither null, set it
				orig[props[i]] = changes[props[i]];
			}
		}
	}
	/**
	 * Internal schema compilation function, Recursively traverses aobject and does
	 * compilation of schema.
	 * This function directly modifies obj parameter. It does not check obj parameter for
	 * validity.
	 *
	 * @param {object} obj parsed definition of schema
	 * @return {object} in form of {done: true/false, val: computed value}
	 * @throws exceptions
	 */
	var self = this;
	var compileInternal = function(obj) {
		var p, refSchema, compiledSchema, errMessage, res, props, propName;

		if ( obj && typeof obj === 'object') {
			// obj is object or array
			if (Array.isArray(obj)) {
				// obj is array
				for (p in obj) {
					res = compileInternal(obj[p]);
					if (res.done) {
						obj[p] = res.val;
					} else {
						return {done: false, val: null};
					}
				}
				return {done: true, val: obj};
			} else {
				// $ref
				if (obj.hasOwnProperty(schemaConstants.REF_KEYWORD)) {
					if (Object.getOwnPropertyNames(obj).length > 1) {
						// there is more properties but $ref has to be
						// only property
						errMessage = util.format('%s has to be only property', schemaConstants.REF_KEYWORD);
						log.silly(errMessage);
						throw new Error(errMessage);
					}

					refSchema = self.getSchema(obj[schemaConstants.REF_KEYWORD]);

					if (refSchema === null) {
						// there is no such schema registered
						errMessage = util.format('Referenced schema not found %s', obj[schemaConstants.REF_KEYWORD]);
						log.silly(errMessage);
						throw new Error(errMessage);
					}

					compiledSchema = refSchema.compiled;

					if (typeof compiledSchema === 'undefined' || compiledSchema === null) {
						// ref schema is not compiled
						log.silly('Referenced schema not compiled %s', obj[schemaConstants.REF_KEYWORD]);
						return {done: false, val: null};
					}

					// we are done with whole object as $ref can be only property
					return {done: true, val: compiledSchema};

				} else if (obj.hasOwnProperty(schemaConstants.EXTENDS_KEYWORD)) {
					// extends
					var extendedSchema = self.getSchema(obj[schemaConstants.EXTENDS_KEYWORD]);

					if (extendedSchema === null) {
						// there is no such schema registered
						errMessage = util.format('Extended schema not found %s', obj[schemaConstants.EXTENDS_KEYWORD]);
						log.silly(errMessage);
						throw new Error(errMessage);
					}

					compiledSchema = extendedSchema.compiled;

					if (typeof compiledSchema === 'undefined' || compiledSchema === null) {
						// extended schema is not compiled
						log.silly('Extended schema not compiled %s', obj[schemaConstants.EXTENDS_KEYWORD]);
						return {done: false, val: null};
					}

					// def has to be compiled (def can contain internal refs and extends possibly)
					var defWOExtend = JSON.parse(JSON.stringify(obj));
					delete defWOExtend[schemaConstants.EXTENDS_KEYWORD];

					var r = compileInternal(defWOExtend);
					var compiledDef;

					if (r.done === false) {
						return {done: false, val: null};
					} else {
						compiledDef = r.val;
					}

					// now we have compiled schema
					var extended = {};
					extended = JSON.parse(JSON.stringify(compiledSchema));
					diveAndUpdate(extended, compiledDef);

					return {done: true, val: extended};
				}

				props = Object.getOwnPropertyNames(obj);
				for (p in props) {
					propName = props[p];
					if (propName === schemaConstants.OBJECT_LINK_KEYWORD ||
							propName === schemaConstants.OBJECT_LINK2_KEYWORD) {
						// do not dive into objectLink and objectLink2
					} else {
						res = compileInternal(obj[propName]);
						// log.silly(res);
						if (res.done) {
							obj[propName] = res.val;
						} else {
							return {done: false, val: null};
						}
					}
				}



				return {done: true, val: obj};
			}
		} else {
			// whole obj is primitive type, return it as is
			return {done: true, val: obj};
		}
	};

	/**
	 * Compiles all registered schemas into one uberSchema and
	 * each schema individually.
	 * Schema compilation means replacing of all $ref objects by instance
	 * of full schema definitioin registered by related uri.
	 *
	 * @method compile
	 */
	this.compile = function() {
		var schemaUrl;
		for (schemaUrl in schemasCache) {
			// first clear previous compilations
			schemasCache[schemaUrl].compiled = null;
		}

		var allDone = false;
		while(!allDone) {
			allDone = true;
			for (schemaUrl in schemasCache) {
				//TODO implement support for local references

				try {
					var res = compileInternal(extend(true, (Array.isArray(schemasCache[schemaUrl].def) ? [] : {}), schemasCache[schemaUrl].def));
					if (res.done) {
						schemasCache[schemaUrl].compiled = res.val;
					} else {
						log.silly('Schema not parsed completely, next round needed');
						allDone = false;
					}
				} catch (e) {
					log.silly('Failed to compile schemas', e.stack);
					throw e;
				}
			}
		}

	};

	/**
	 * Creates empty object by schema definition
	 *
	 * @method createDefaultObject
	 * @param {String} uri uri of schema to use as object definition
	 * @return {Object} empty object definded by schema
	 */
	this.createDefaultObject = function(uri) {
		var compiledSchema = schemasCache[uri];


		if (!compiledSchema) {
			return false;
		}

		var iterateSchema = function(schemaFragment) {

			if ('default' in schemaFragment) {
				// there is default so lets use it
				if (schemaFragment.default === 'object') {
					return extend(true, {}, schemaFragment.default);
				} else {
					return schemaFragment.default;
				}
			}

			var res = {};
			if ('properties' in schemaFragment) {
				// only dive in if there are properties defined
				for (var prop in schemaFragment.properties) {
					// all definitions in properties should be opbjects by RFC
					res[prop] = iterateSchema(schemaFragment.properties[prop]);
				}

				return res;
			}

			return null;

		};

		return iterateSchema(compiledSchema.compiled);
	};
};

module.exports = {
	SchemaTools: SchemaTools
};
