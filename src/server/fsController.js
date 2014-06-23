'use strict';

var log = require('./logging.js').getLogger('fsController.js');
var express = require('express');
var extend = require('extend');
var path = require('path');
var fsCtrlModule = require('./fsService.js');

var app = express();

var DEFAULT_CFG = {
	rootPath : '/tmp',
	filePathRegexp : /^\/fs\/\w+/
};

app.cfg = function(options) {
	var prop = extend(true, {}, DEFAULT_CFG, options);
	app.prop = prop;
	app.fsCtrl = new fsCtrlModule.FsCtrl(prop);
};

app.get('/ls*', function(req, resp) {
	var path = req.url.substring(3, req.url.lenght);

	app.fsCtrl.ls(path, resp, function(err) {
		if (err != null) {
			resp.send(err.code || 500, err);
		}

	});
});

app.get('/get/*', function(req, resp) {
	var path = req.url.substring(5, req.url.lenght);

	app.fsCtrl.get(path, resp, function(err) {
		if (err != null) {
			resp.send(err.code || 500, err);
		}

	});
});

app.get('/rm/*', function(req, resp) {
	var path = req.url.substring(4, req.url.lenght);

	app.fsCtrl.rm(path, resp, function(err) {
		if (err != null) {
			resp.send(err.code || 500, err);
		}

	});
});

app.get('/mkdir/*', function(req, resp) {
	var path = req.url.substring(7, req.url.lenght);

	app.fsCtrl.mkdir(path, resp, function(err) {
		if (err != null) {
			resp.send(err.code || 500, err);
		}

	});
});

app.put('/put/*', function(req, resp) {
	var path = req.url.substring(5, req.url.lenght);

	app.fsCtrl.put(path, resp, function(err) {
		if (err != null) {
			resp.send(err.code || 500, err);
		}

	});
});

app.put('/putgetpath/*', function(req, resp) {
	console.log(app);
	var path = req.url.substring('/putgetpath/'.length, req.url.lenght);

	app.fsCtrl.putGetPath(path, req, req.get('Content-Type'), function(err, path) {
		if (err) {
			log.error('Failed to putGetPath', err);
			resp.send(500, err);
		}
		log.info('Saved file %s', path);
		resp.send(200, path);
	});
});

app.put('/replace/*', function(req, resp) {
	var path = req.url.substring(9, req.url.lenght);

	app.fsCtrl.replace(path, req, resp, function(err) {
		if (err != null) {
			resp.send(err.code || 500, err);
		}

	});
});

module.exports = app;
