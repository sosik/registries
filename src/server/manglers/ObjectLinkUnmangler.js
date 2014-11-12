(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var objectTools = require('./../ObjectTools.js');
	var log = require('./../logging.js').getLogger('manglers/ObjectLinkUnmangler.js');

	function ObjectLinkUnmangler(daoFactory, mongoDriver) {
		this.daoFactory = daoFactory;
		this.mongoDriver = mongoDriver;
	}

	ObjectLinkUnmangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {
		var props = {};
		var prop;

		if (!schemaFragment || !schemaFragment[consts.OBJECT_LINK_KEYWORD]) {
			callback(null, null);
			return;
		}

		if (!objFragment || !objFragment[consts.OBJECT_LINK_OID_KEYWORD]) {
			log.silly('Nothing to unmangle - object');
			callback(null, null);
			return;
		}

		log.silly('ObjectLink unmangler start for %s', objPath);
		var registry = objFragment[consts.OBJECT_LINK_REGISTRY_KEYWORD] || schemaFragment[consts.OBJECT_LINK_REGISTRY_KEYWORD];

		if (!registry) {
			log.debug('Failed to identify registry');
			callback(null, null);
			return;
		}


		for (prop in schemaFragment[consts.OBJECT_LINK_KEYWORD]) {
			if ((prop !== consts.OBJECT_LINK_REGISTRY_KEYWORD)) {
				log.silly('Found prop %s -> %s', prop, schemaFragment[consts.OBJECT_LINK_KEYWORD][prop]);
				props[prop] = schemaFragment[consts.OBJECT_LINK_KEYWORD][prop];
			}
		}

		var localDao = this.daoFactory(this.mongoDriver, {collectionName: registry});

		localDao.get(objFragment[consts.OBJECT_LINK_OID_KEYWORD], function(err, data) {
			var prop;

			if (err) {
				log.error('Failed to get data from collection, objectLink resolution failed');
				callback(err);
				return;
			}

			if (data) {
				objFragment[consts.OBJECT_LINK_REGISTRY_KEYWORD] = registry;

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

	module.exports = function(daoFactory, mongoDriver) {
		return new ObjectLinkUnmangler(daoFactory, mongoDriver);
	};
}());
