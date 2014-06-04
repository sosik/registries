'use strict';

var log = require('./logging.js').getLogger('fsService.js');
var URL = require('url');
var path = require('path');
var extend = require('extend');
var util = require('util');

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
	 * @param {string} uri - resolution uri
	 * @param {string|object} schema - schema as string or json object
	 * @param {boolean} override - true if new schema should override old one
	 */
	this.registerSchema = function(uri, schema, override) {
		var schemaObj = null;
		

		if (typeof schema === 'string') {
			schemaObj = JSON.parse(schema);
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
	 */
	this.getSchema = function(uri) {
		//TODO do traversing in schema structure URI and fragment information
		var url = URL.parse(normalizeURL(URL.parse(uri)));
		return schemasCache[URL.format(url)];
	};

	var that = this;
	var parseInternal = function(uri, schema, localPath) {
		for (var prop in schema.def) {
			switch (prop) {
				case '$schema':
				case 'id' :
				case 'type' : 
				case '$ref' : 
					// skip schema keywords;
					break;
				default:
					var propLocalPath = null;
					var propUrl = null;

					if (schema.def[prop].id) {
						// id is defined, lets override canonical resolution
						propUrl = URL.resolve(uri, schema.def[prop].id);
						// make id argument absolute
						schema.def[prop].id = propUrl;
						propLocalPath = URL.parse(propUrl).hash;
						propLocalPath = (propLocalPath && propLocalPath.length > 0 ? propLocalPath: "#");
					} else {
						propLocalPath = localPath + (localPath === "#" ? '' : '/') + prop;
						propUrl = URL.resolve(uri, propLocalPath);
					}

					if ('object' === typeof schema.def[prop]) {
						// dive only if it is object
						that.registerSchema(propUrl, schema.def[prop], true);
						parseInternal(propUrl, that.getSchema(propUrl), propLocalPath);
					}
			}
		}
	}

	this.parse = function() {
		for (var schemaUri in schemasCache) {
			parseInternal(schemaUri, schemasCache[schemaUri], schemasCache[schemaUri].url.hash);
		}
	}

	var that = this;
	var compileInternal = function(obj) {
		for (var prop in obj) {
			if (('object' === typeof obj[prop]) && ("$ref" in obj[prop])) {
				//TODO text if it is only property (check RFC)
				//TODO support for local references
				var compiled = that.getSchema(obj[prop].$ref).compiled;
				if (compiled) {
					obj[prop] = compiled;
				} else {
					// there is still work to do
					return false;
				}
			} else if (prop === '$ref') {
				//TODO check if it os only property
				var compiled = that.getSchema(obj.$ref).compiled;
				if (compiled) {
					return compiled;	
				} else {
					// there is still work to do
					return false;
				}
			} else if ('object' === typeof obj[prop]) {
				// dive deeper, it is not $ref
				if (!compileInternal(obj[prop])) {
					// there is still work to do in lower level
					return false;
				}
				// lower level is ok, lets continue with next porperty
			}
		}

		// we iterated deeply whole object and it seams ok
		return obj;
	}

	/**
	 * Compiles all registered schemas into one uberSchema and
	 * each schema individually.
	 * Schema compilation means replacing of all $ref objects by instance
	 * of full schema definitioin registered by related uri.
	 */
	this.compile = function() {
		for (var schemaUrl in schemasCache) {
			// first clear previous compilations
			schemasCache[schemaUrl].compiled = null;
		}

		var allDone = false;
		while(!allDone) {
			allDone = true;
			for (var schemaUrl in schemasCache) {
				//TODO implement support for local references
				var res = compileInternal(extend(true, {}, schemasCache[schemaUrl].def));
				if (res) {
					schemasCache[schemaUrl].compiled = res;
				} else {
					allDone = false;
				}
			}
		}
	}

	this.createDefaultObject = function(uri) {
		var compiledSchema = schemasCache[uri];
		

		if (!compiledSchema) {
			return false;
		}

		var iterateSchema = function(schemaFragment) {
			
			if ('default' in schemaFragment) {
				// there is default so lets use it
				if ('object' === schemaFragment.default) {
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
	}
};

module.exports = {
	SchemaTools: SchemaTools
}
