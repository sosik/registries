'use strict';

var log = require('./logging.js').getLogger('schemaController.js');
var extend = require('extend');

var universalDaoModule = require('./UniversalDao.js');

var fsCtrlModule = require('./fsService.js');

var lsfilter= function( item){
	if ( /.*[0-9]*\.json$/.test(item.name)) {
		return true;
	}
	return false;
};

var DEFAULT_CFG = {

    rootPath : process.cwd() + '/build/shared/schemas',
    fileFilter : lsfilter,

};

var schemaRegistryModule = require('./schemaRegistry.js');

var SchemaController = function(mongoDriver, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	var schemaRegistry = new schemaRegistryModule.SchemaRegistry();

	var fsCtrl = new fsCtrlModule.FsCtrl(cfg);

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

	this.schemaRead = function(req, resp) {
		var path = req.url.substring(12, req.url.lenght);

		fsCtrl.get(path, resp, function(err) {
			if (err != null) {
				resp.send(err.code || 500, err);
			}

		});
	};

	this.schemaReplace = function(req, resp) {
		var path = req.url.substring(16, req.url.lenght);

		fsCtrl.replace(path, req, resp, function(err) {
			if (err != null) {
				resp.send(err.code || 500, err);
			}
			schemaRegistry.load();
			
		});
	};

	this.schemaList = function(req, resp) {
		var path = req.url.substring(10, req.url.lenght);
		console.log(path);

		fsCtrl.ls(path, resp, function(err) {
			if (err != null) {
				resp.send(err.code || 500, err);
			}

		});
	};

};

module.exports = {
	SchemaController : SchemaController
}
