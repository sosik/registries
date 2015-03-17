/**
 * Manglers that processes object coming from client and do necessary sanitation.
 *
 * @module server
 * @submodule manglers
 */
(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/ObjectLink2Mangler.js');

	/**
	 *
	 * Mangler that mangles ObjectLink2 schema element.
	 * Generally this mangler only removes elements that should not be stored in database
	 *
	 * @TODO Mangler should validate keyword data
	 *
	 * @class ObjectLink2Mangler
	 * @constructor
	 */
	function ObjectLink2Mangler() {
	}

	/**
	 * Generic mangling function
	 *
	 * @method
	 * @param ctx
	 * @param objFragment
	 * @param schemaFragment
	 * @param objPath
	 * @param callback
	 */
	ObjectLink2Mangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {
		var prop;

		if (!objFragment || !schemaFragment || !schemaFragment[consts.OBJECT_LINK2_KEYWORD]) {
			callback(null, null);
			return;
		}

		log.silly('ObjectLink2 mangler start for %s', objPath);
		// remove all unneeded properties
		for (prop in objFragment) {
			if ((prop !== consts.OBJECT_LINK2_SCHEMA_KEYWORD) && (prop !== consts.OBJECT_LINK2_OID_KEYWORD)) {
				log.silly('Deleting field %s', prop);
				delete objFragment[prop];
			}
		}

		log.debug('ObjectLink2 mangling finished for %s',  objPath);
		callback(null, []);
	};

	module.exports = function() {
		return new ObjectLink2Mangler();
	};
}());
