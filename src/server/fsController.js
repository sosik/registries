'use strict';

var log = require('./logging.js').getLogger('fsController.js');
var express = require('express');
var extend = require('extend');
var path = require('path');
var fsCtrlModule = require('./fsService.js');

var DEFAULT_CFG = {
	rootPath : '/tmp',
	filePathRegexp : /^\/fs\/\w+/,
	allowedOperations: [ 'ls', 'get', 'rm', 'mkdir', 'put', 'putgetpath', 'replace' ]
};

var create = function(options) {
	var app = express();

	var prop = extend(true, {}, DEFAULT_CFG, options);

	if (options && options.allowedOperations) {
		// ovewrride default deep copy
		prop.allowedOperations = options.allowedOperations;
	}

	app.prop = prop;
	app.fsCtrl = new fsCtrlModule.FsCtrl(prop);

// Register only allowed operations
// ls
	if (prop.allowedOperations.indexOf('ls') > -1) {
		log.verbose('Registering allowed opperation ls');
		app.get('/ls*', function(req, resp) {
			var path = req.url.substring(3);

			app.fsCtrl.ls(path, resp, function(err) {
				if (err) {
					log.error('Failed to ls', err);
					resp.send(err.code || 500, err);
				}

			});
		});
	}
	
// get
	if (prop.allowedOperations.indexOf('get') > -1) {
		log.verbose('Registering allowed opperation get');
		app.get('/get/*', function(req, resp) {
			var path = req.url.substring(5);

			app.fsCtrl.get(path, resp, function(err) {
				if (err) {
					log.error('Failed to get', err);
					resp.send(err.code || 500, err);
				}

			});
		});
	}

// rm
	if (prop.allowedOperations.indexOf('rm') > -1) {
		log.verbose('Registering allowed opperation rm');
		app.get('/rm/*', function(req, resp) {
			var path = req.url.substring(4);

			app.fsCtrl.rm(path, resp, function(err) {
				if (err) {
					log.error('Failed to rm', err);
					resp.send(err.code || 500, err);
				}

			});
		});
	}

// mkdir
	if (prop.allowedOperations.indexOf('mkdir') > -1) {
		log.verbose('Registering allowed opperation mkdir');
		app.get('/mkdir/*', function(req, resp) {
			var path = req.url.substring(7);

			app.fsCtrl.mkdir(path, resp, function(err) {
				if (err) {
					log.error('Failed to mkdir', err);
					resp.send(err.code || 500, err);
				}

			});
		});
	}

// put
	if (prop.allowedOperations.indexOf('put') > -1) {
		log.verbose('Registering allowed opperation put');
		app.put('/put/*', function(req, resp) {
			var path = req.url.substring(5);

			app.fsCtrl.put(path, resp, function(err) {
				if (err) {
					log.error('Failed to put', err);
					resp.send(err.code || 500, err);
				}

			});
		});
	}

// putgetpath
	if (prop.allowedOperations.indexOf('putgetpath') > -1) {
		log.verbose('Registering allowed opperation putgetpath');
		app.put('/putgetpath/*', function(req, resp) {
			var path = req.url.substring('/putgetpath/'.length);

			app.fsCtrl.putGetPath(path, req, req.get('Content-Type'), function(err, path) {
				if (err) {
					log.error('Failed to putGetPath', err);
					resp.send(500, err);
				}
				log.info('Saved file %s', path);
				resp.send(200, path);
			});
		});
	}

// replace
	if (prop.allowedOperations.indexOf('replace') > -1) {
		app.put('/replace/*', function(req, resp) {
			var path = req.url.substring(9);

			app.fsCtrl.replace(path, req, resp, function(err) {
				if (err) {
					log.error('Failed to replace', err);
					resp.send(err.code || 500, err);
				}

			});
		});
	}


	return app;
}

module.exports = {create: create};
