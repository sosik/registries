'use strict';

var log = require('./logging.js').getLogger('SchemaRegistry.js');
var extend = require('extend');

var universalDaoModule = require('./UniversalDao.js');

var DEFAULT_CFG = {
    schemas : [  '/shared/schemas/permissions.json', '/shared/schemas/login.json', '/shared/schemas/systemCredentials.json','/shared/schemas/people.json','/shared/schemas/company.json','/shared/schemas/group.json','/shared/schemas/groupMaster.json', '/shared/schemas/member.json' ]
};

var SchemaToolsModule = require('./SchemaTools.js');

var fs = require('fs');

/**
 * Works as 'static' registry for schemas.
 * <p>
 * Does: initial schema load
 * 		 delegates to SchemaTool		 
 * <P>
 * TODO: schema reload
 */
var SchemaRegistry = function(options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	var schemaTools = new SchemaToolsModule.SchemaTools();

	cfg.schemas.map(function(item) {

		log.info('Registering schema',item);
		var content = fs.readFileSync(process.cwd() + "/build" + item);
		log.silly('Registering schema',content.toString());
		schemaTools.registerSchema(null, content.toString());
	})

	schemaTools.parse();
	schemaTools.compile();

	this.createDefaultObject = function(schmaUri) {
		return schemaTools.createDefaultObject(schmaUri);
	}

	this.getSchema = function(schmaUri) {
		return schemaTools.getSchema(schmaUri);
	}

};

module.exports = {
		SchemaRegistry : SchemaRegistry
}
