'use strict';

var log = require('./logging.js').getLogger('fsController.js');
var express = require('express');
var extend = require('extend');
var path = require('path');
var fsCtrlModule = require('./fsService.js');

var app = express();

var DEFAULT_CFG = {
	rootPath : '/tmp',
	filePathRegexp : /^\/fs\/\w+/,
	allowedOperations: [ 'ls', 'get', 'rm', 'mkdir', 'put', 'putgetpath', 'replace' ]
};

app.cfg = function(options) {
	var prop = extend(true, {}, DEFAULT_CFG, options);
	app.prop = prop;
	app.fsCtrl = new fsCtrlModule.FsCtrl(prop);

// Register only allowed operations
// ls
	if (prop.allowedOperations.indexOf('ls') > -1) {
		app.get('/ls*', function(req, resp) {
			var path = req.url.substring(3);

			app.fsCtrl.ls(path, resp, function(err) {
				if (err) {
					resp.send(err.code || 500, err);
				}

			});
		});
// get
	} else if (prop.allowedOperations.indexOf('get') > -1) {
		app.get('/get/*', function(req, resp) {
			var path = req.url.substring(5);

			app.fsCtrl.get(path, resp, function(err) {
				if (err) {
					resp.send(err.code || 500, err);
				}

			});
		});
// rm
	} else if (prop.allowedOperations.indexOf('rm') > -1) {
		app.get('/rm/*', function(req, resp) {
			var path = req.url.substring(4);

			app.fsCtrl.rm(path, resp, function(err) {
				if (err) {
					resp.send(err.code || 500, err);
				}

			});
		});
// mkdir
	} else if (prop.allowedOperations.indexOf('mkdir') > -1) {
		app.get('/mkdir/*', function(req, resp) {
			var path = req.url.substring(7);

			app.fsCtrl.mkdir(path, resp, function(err) {
				if (err) {
					resp.send(err.code || 500, err);
				}

			});
		});
// put
	} else if (prop.allowedOperations.indexOf('put') > -1) {
		app.put('/put/*', function(req, resp) {
			var path = req.url.substring(5);

			app.fsCtrl.put(path, resp, function(err) {
				if (err) {
					resp.send(err.code || 500, err);
				}

			});
		});
// putgetpath
	} else if (prop.allowedOperations.indexOf('putgetpath') > -1) {
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
// replace
	} else if (prop.allowedOperations.indexOf('replace') > -1) {
		app.put('/replace/*', function(req, resp) {
			var path = req.url.substring(9);

			app.fsCtrl.replace(path, req, resp, function(err) {
				if (err) {
					resp.send(err.code || 500, err);
				}

			});
		});
	}
};

module.exports = app;
