(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var objectTools = require('./../ObjectTools.js');
	var log = require('./../logging.js').getLogger('manglers/ObjectLink2Unmangler.js');

	function ObjectLink2Unmangler(daoFactory, mongoDriver) {
		this.daoFactory = daoFactory;
		this.mongoDriver = mongoDriver;
	}

	ObjectLink2Unmangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {
		var props = {};
		var prop;

		if (!schemaFragment || !schemaFragment[consts.OBJECT_LINK2_KEYWORD]) {
			//FIXME add logging message on debug level
			//FIXME all manglers should log this message on debug level, fix all manglers
			callback(null, null);
			return;
		}

		if (!objFragment || !objFragment[consts.OBJECT_LINK2_OID_KEYWORD]) {
			//FIXME fix looging level and message in all manglers
			log.silly('Nothing to unmangle - object');
			callback(null, null);
			return;
		}

		log.silly('ObjectLink2 unmangler start for %s', objPath);
		var registry = objFragment[consts.OBJECT_LINK2_REGISTRY_KEYWORD] ||
			schemaFragment[consts.OBJECT_LINK2_REGISTRY_KEYWORD];

		if (!registry) {
			//FIXME can this happen even previous checks probably solves this?
			log.debug('Failed to identify registry');
			callback(null, null);
			return;
		}

		// Fields definition from schema
		var fieldsDef = schemaFragment[consts.OBJECT_LINK2_FIELDS_KEYWORD];

		// if there is no definition of fields schema is considered invalid
		if (!fieldsDef) {
			//FIXME common schema validation action
			log.warn('Missing "%s" definition of objectLink2 element at %s',
					consts.OBJECT_LINK2_FIELDS_KEYWORD,
					objectPath);
			callback(null, null);
			return;
		}


		log.debug('ObjectLink2 unmangling finished for %s',  objPath);
		callback(null, []);
	};

	module.exports = function(daoFactory, mongoDriver) {
		return new ObjectLink2Unmangler(daoFactory, mongoDriver);
	};
}());
