'use strict';

var log = require('./logging.js').getLogger('schemaController.js');
var extend = require('extend');

var universalDaoModule = require('./UniversalDao.js');

var DEFAULT_CFG = {};

var schemaRegistryModule = require('./schemaRegistry.js');

var SchemaController = function(mongoDriver, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	var schemaRegistry = new schemaRegistryModule.SchemaRegistry();

	this.getCompiledSchema = function(req, resp) {

		var schemaUri = decodeURIComponent(req.url.substring(17, req.url.lenght));


		var schema = schemaRegistry.getSchema(schemaUri);
		if (!schema) {
			resp.send(500, 'schema not found : ' + schema);
			log.info('Schema not found ', schemaUri);
			return;
		}
		resp.send(200, schema.compiled);

	}

};

module.exports = {
	SchemaController : SchemaController
}
