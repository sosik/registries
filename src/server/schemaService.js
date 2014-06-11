'use strict';

var log = require('./logging.js').getLogger('loginController.js');
var extend = require('extend');

var universalDaoModule = require('./UniversalDao.js');

var DEFAULT_CFG = {
    userCollection : 'user',
    schemas : [ '/shared/schemas/groups.json', '/shared/schemas/permissions.json', '/shared/schemas/login.json', '/shared/schemas/systemCredentials.json' ]
};

var SchemaToolsModule = require('./SchemaTools.js');

var fs = require('fs');


/**
 * Works as registry for schemas. 
 * <p> Does: initial schema load
 * <P> TODO: schema reload 			 
 */
var SchemaService = function(mongoDriver, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	var schemaTools = new SchemaToolsModule.SchemaTools();

	cfg.schemas.map(function(item) {
		var content = fs.readFileSync(process.cwd() + "/build" + item);

		schemaTools.registerSchema(null, content.toString());
	})

	schemaTools.parse();
	schemaTools.compile();
	
	this.createDefaultObject=function(schmaUri){
		return schemaTools.createDefaultObject(schmaUri);
	}
	
	
	this.getSchema=function(schmaUri){
		return schemaTools.getSchema(schmaUri);
	}
	

};

module.exports = {
		SchemaService : SchemaService
}