(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/ObjectLinkMangler.js');

	function ObjectLinkMangler() {
	}

	ObjectLinkMangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {
		var prop;

		if (!objFragment || !schemaFragment || !schemaFragment[consts.OBJECT_LINK_KEYWORD]) {
			callback(null, null);
			return;
		}

		log.silly('ObjectLink mangler start for %s', objPath);
		// remove all uneeded properties
		for (prop in objFragment) {
			if ((prop !== consts.OBJECT_LINK_REGISTRY_KEYWORD) && (prop !== consts.OBJECT_LINK_OID_KEYWORD)) {
				log.silly('Deleting field %s', prop);
				delete objFragment[prop];
			}
		}

		log.debug('ObjectLink mangling finished for %s',  objPath);
		callback(null, []);
	};

	module.exports = function() {
		return new ObjectLinkMangler();
	};
}());
