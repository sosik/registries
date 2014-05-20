'use strict';

var express = require('express');
var path = require('path');
var schemaRepoApp=require('./fsController.js');

var mongoDriver = require(path.join(process.cwd(), '/build/server/mongoDriver.js'));
var config = require(path.join(process.cwd(), '/build/server/config.js'));
var universalDaoModule = require(process.cwd() + '/build/server/UniversalDao.js');
var universalDaoControllerModule = require(process.cwd() + '/build/server/UniversalDaoController.js');


var app = express();
app.disable('view cache');

// Static data
app.use(express.static(path.join(process.cwd(), 'build', 'client')));

mongoDriver.init(config.mongoDbURI, function(err) {
	if (err) {
		throw err;
	}
	
	var udc = new universalDaoControllerModule.UniversalDaoController(mongoDriver);
	app.put('/udao/save/:table', express.bodyParser(), function(req, res){udc.save(req, res);});
	app.get('/udao/get/:table/:id', express.bodyParser(), function(req, res){udc.get(req, res);});
	app.get('/udao/list/:table', express.bodyParser(), function(req, res){udc.list(req, res);});

	
	// Static data
//	app.use(express.static(path.join(process.cwd(), 'build', 'client')));

//	app.all('/my*',fsCtrl2.handle);
	
	app.configure('development', function () {

	    app.use(express.static(__dirname + '/public'));
	    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	    
	    // Map schema editor services
	    var lsfilter= function( item){
			if ( /.*Schema[0-9]*\.js/.test(item.name)) {
				return true;
			}
			return false;
		};
	    schemaRepoApp.cfg({rootPath: process.cwd() + '/build/client/js' ,fileFilter: lsfilter});
	    app.use('/schema',schemaRepoApp);
	});


	
	var server = app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
		console.log("Http server listening at %j", server.address());
	});
});
