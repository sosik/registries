'use strict';

var log = require('./logging.js').getLogger('loginController.js');
var extend = require('extend');

var universalDaoModule = require('./UniversalDao.js');

var DEFAULT_CFG = {
    schemas : [ '/shared/schemas/groups.json', '/shared/schemas/permissions.json', '/shared/schemas/login.json', '/shared/schemas/systemCredentials.json','/shared/schemas/people.json','/shared/schemas/company.json' ]
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
		var content = fs.readFileSync(process.cwd() + "/build" + item);

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