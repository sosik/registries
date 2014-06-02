'use strict';

var log = require('./logging.js').getLogger('server.js');
var express = require('express');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var errorhandler = require('errorhandler')
var path = require('path');
var schemaRepoApp=require('./fsController.js');

var mongoDriver = require(path.join(process.cwd(), '/build/server/mongoDriver.js'));
var config = require(path.join(process.cwd(), '/build/server/config.js'));

var universalDaoControllerModule = require(process.cwd() + '/build/server/UniversalDaoController.js');
var loginControllerModule = require('./loginController.js');


var app = express();
app.disable('view cache');

// Static data
app.use(express.static(path.join(process.cwd(), 'build', 'client')));

mongoDriver.init(config.mongoDbURI, function(err) {
	if (err) {
		throw err;
	}
	
	var udc = new universalDaoControllerModule.UniversalDaoController(mongoDriver);
	var loginCtrl= new loginControllerModule.LoginController(mongoDriver);
	
	app.use(cookieParser());
	app.use(loginCtrl.authFilter );
	
	app.put('/udao/save/:table', bodyParser(), function(req, res){udc.save(req, res);});
	app.get('/udao/get/:table/:id', bodyParser(), function(req, res){udc.get(req, res);});
	app.get('/udao/list/:table', bodyParser(), function(req, res){udc.list(req, res);});

	app.post('/login', bodyParser(), function(req, res){loginCtrl.login(req, res);});
	app.get('/logout', bodyParser(), function(req, res){loginCtrl.logout(req, res);});
	app.post('/resetPassword', bodyParser(), function(req, res){loginCtrl.resetPassword(req, res);});
        app.post('/changePassword', bodyParser(), function(req, res){loginCtrl.changePassword(req, res);});
	
	// Static data
//	app.use(express.static(path.join(process.cwd(), 'build', 'client')));

//	app.all('/my*',fsCtrl2.handle);
	
	app.use(express.static(__dirname + '/public'));
	app.use(errorhandler({ dumpExceptions: true, showStack: true }));
	
	// Map schema editor services
	var lsfilter= function( item){
		if ( /.*Schema[0-9]*\.js$/.test(item.name)) {
			return true;
		}
		return false;
	};
	schemaRepoApp.cfg({rootPath: process.cwd() + '/build/client/js' ,fileFilter: lsfilter});
	app.use('/schema',schemaRepoApp);
	    
	var server = app.listen(config.webserverPort || 3000, config.webserverHost || "0.0.0.0", function(){
		log.info("Http server listening at %j", server.address(), {});
	});
});
