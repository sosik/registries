'use strict';

var log = require('./logging.js').getLogger('schemaController.js');
var extend = require('extend');
var safeUrlEncoder = require('./safeUrlEncoder.js');

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


var SchemaController = function(mongoDriver,schemaRegistry,eventRegistry, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	var fsCtrl = new fsCtrlModule.FsCtrl(cfg);

	this.getCompiledSchema = function(req, resp) {

		var schemaUri = safeUrlEncoder.decode(req.url.substring(17));

		var schema = schemaRegistry.getSchema(schemaUri);
		if (!schema) {
			resp.send(500, 'schema not found : ' + schema);
			log.info('Schema not found ', schemaUri);
			return;
		}
		resp.status(200).send(schema.compiled);

	};

	this.schemaRead = function(req, resp) {
		var path = req.url.substr(12);

		fsCtrl.get(path, resp, function(err) {
			if (err) {
				resp.send(err.code || 500, err);
			}

		});
	};

	this.schemaReplace = function(req, resp) {
		var path = req.url.substr(16);

		fsCtrl.replace(path, req, resp, function(err) {
			if (err) {
				resp.send(err.code || 500, err);
			}
			schemaRegistry.load();
			eventRegistry.load();

		});
	};

	this.schemaList = function(req, resp) {
		var path = req.url.substr(10);

		fsCtrl.ls(path, resp, function(err) {
			if (err) {
				resp.send(err.code || 500, err);
			}

		});
	};

};

module.exports = {
	SchemaController : SchemaController
};
