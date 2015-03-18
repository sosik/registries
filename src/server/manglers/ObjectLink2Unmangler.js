(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var objectTools = require('./../ObjectTools.js');
	var log = require('./../logging.js').getLogger('manglers/ObjectLink2Unmangler.js');

	function ObjectLink2Unmangler(daoFactory, mongoDriver, schemaRegistry) {
		this.daoFactory = daoFactory;
		this.mongoDriver = mongoDriver;
		this.schemaRegistry = schemaRegistry;
	}

	ObjectLink2Unmangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {
		var props = {};
		var prop;

		if (!schemaFragment || !schemaFragment[consts.OBJECT_LINK2_KEYWORD]) {
			//FIXME add logging message on debug level
			//FIXME all manglers should log this message on debug level, fix all manglers
			log.silly('Nothing to unmangle - this is not objectLink2 by schema');
			callback(null, null);
			return;
		}

		if (!objFragment || !objFragment[consts.OBJECT_LINK2_OID_KEYWORD]) {
			//FIXME fix looging level and message in all manglers
			log.silly('Nothing to unmangle - no oid in object');
			callback(null, null);
			return;
		}

		log.debug('ObjectLink2 unmangler start for %s', objPath);

		// Fields definition from schema
		var fieldsDef = schemaFragment[consts.OBJECT_LINK2_KEYWORD][consts.OBJECT_LINK2_FIELDS_KEYWORD];

		// if there is no definition of fields schema is considered invalid
		if (!fieldsDef) {
			//FIXME common schema validation action
			log.warn('Missing "%s" definition of objectLink2 element at %s',
					consts.OBJECT_LINK2_FIELDS_KEYWORD,
					objPath);
			callback(null, null);
			return;
		}


		for (prop in schemaFragment[consts.OBJECT_LINK2_KEYWORD][consts.OBJECT_LINK2_FIELDS_KEYWORD]) {
				log.silly('Found prop %s -> %s', prop, schemaFragment[consts.OBJECT_LINK2_KEYWORD][consts.OBJECT_LINK2_FIELDS_KEYWORD][prop]);
				props[prop] = schemaFragment[consts.OBJECT_LINK2_KEYWORD][consts.OBJECT_LINK2_FIELDS_KEYWORD][prop];
		}


		var remoteSchemaUri = objFragment[consts.OBJECT_LINK2_SCHEMA_KEYWORD] || schemaFragment[consts.OBJECT_LINK2_KEYWORD][consts.OBJECT_LINK2_SCHEMA_KEYWORD];
		var remoteSchema = this.schemaRegistry.getSchema(remoteSchemaUri);

		if (!remoteSchema || !remoteSchema.compiled.table) {
			log.warn('Failed to load remote schema %s', remoteSchemaUri);
			callback(null, null);
			return;
		}

		var localDao = this.daoFactory(this.mongoDriver, {collectionName: remoteSchema.compiled.table});

		localDao.get(objFragment[consts.OBJECT_LINK2_OID_KEYWORD], function(err, data) {
			log.silly('Data callback for %s', objPath);

			var prop;

			// log.error(data);

			if (err) {
				log.error('Failed to get data from collection, objectLink resolution failed');
				callback(err);
				return;
			}

			if (data) {

				objFragment[consts.OBJECT_LINK_REFDATA_KEYWORD] = {};
				for (prop in props) {
					var val=objectTools.evalPath(data, props[prop]);
					if (val&&val.v) {
						 objFragment[consts.OBJECT_LINK_REFDATA_KEYWORD][prop] = val.v;
					}
					else{
						objFragment[consts.OBJECT_LINK_REFDATA_KEYWORD][prop] = val;
					}
				}
			}
			log.debug('ObjectLink unmangling finished for %s',  objPath);
			callback(null, []);
		});
	};

	module.exports = function(daoFactory, mongoDriver, schemaRegistry) {
		return new ObjectLink2Unmangler(daoFactory, mongoDriver, schemaRegistry);
	};
}());
