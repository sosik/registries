'use strict';

var express = require('express');
var path = require('path');

var fsCtrl = new (require('./FsCtrl.js')).FsCtrl({rootPath: path.join(process.cwd(),'build/client/js')});
var mongoDriver = require(path.join(process.cwd(), '/build/server/mongoDriver.js'));
var config = require(path.join(process.cwd(), '/build/server/config.js'));
var universalDaoModule = require(process.cwd() + '/build/server/UniversalDao.js');
var universalDaoControllerModule = require(process.cwd() + '/build/server/UniversalDaoController.js');


var noop = function() {return;};

var app = express();
app.disable('view cache');

// FSController



// Static data
app.use(express.static(path.join(process.cwd(), 'build', 'client')));
mongoDriver.init(config.mongoDbURI, function(err) {

	if (err) {
		throw err;
	}
	var lsfilter= function( item){
		if ( /.*Schema[0-9]*\.js/.test(item.name)) {
			return true;
		}
		return false;
	};
	var udc = new universalDaoControllerModule.UniversalDaoController(mongoDriver);
	app.put('/udao/save/:table', express.bodyParser(), function(req, res){udc.save(req, res);});
	app.get('/udao/get/:table/:id', express.bodyParser(), function(req, res){udc.get(req, res);});
	app.get('/udao/list/:table', express.bodyParser(), function(req, res){udc.list(req, res);});

	// FSController
	app.get('/fs/ls*', function(req, res) {fsCtrl.ls(req, res,lsfilter, noop);});
	app.get('/fs/get/*', function(req, res) {fsCtrl.get(req, res, noop);});
	app.get('/fs/rm/*', function(req, res) {fsCtrl.rm(req, res, noop);});
	app.get('/fs/mkdir/*', function(req, res) {fsCtrl.mkdir(req, res, noop);});
	app.put('/fs/put/*', function(req, res) {fsCtrl.put(req, res, noop);});
	// Static data
	app.use(express.static(path.join(process.cwd(), 'build', 'client')));


	var server = app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
		console.log("Http server listening at %j", server.address());
	});
});
