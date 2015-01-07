/* jshint node:true */
'use strict';

// require('look').start();
var log = require('./logging.js').getLogger('server.js');
var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var path = require('path');
var fsController=require('./fsController.js');


var mongoDriver = require(path.join(process.cwd(), '/build/server/mongoDriver.js'));
var config = require(path.join(process.cwd(), '/build/server/config.js'));

var universalDaoControllerModule = require(process.cwd() + '/build/server/UniversalDaoController.js');

var securityControllerModule = require('./securityController.js');
var securityServiceModule = require('./securityService.js');
var securityService= new securityServiceModule.SecurityService();

var schemaRegistryModule = require('./schemaRegistry.js');
var csvImportModule = require('./csvImportService.js');

var schemaControllerModule = require('./schemaController.js');
var statisticsControllerModule = require('./statisticsController.js');
var massmailingCotrollerModule = require('./massmailingController.js');

var eventRegistryModule=require('./eventRegistry.js');

var eventSchedulerModule=require('./eventScheduler.js');

var portalApiModule = require('./portal/api-controller.js');

var app = express();

// setup request logging
app.use(require('./request-logger.js')
	.getLogger(require('./logging.js')
		.getLogger('HTTP'))
	.logger()
);
app.disable('view cache');

// Static data
app.use(express.static(path.join(process.cwd(), 'build', 'client')));
app.use('/portal/', express.static(path.join(process.cwd(), 'data', 'portal', 'client')));

mongoDriver.init(config.mongoDbURI, function(err) {
	if (err) {
		throw err;
	}

	// Load and register schemas
	var schemasListPaths = JSON.parse(
		fs.readFileSync(path.join(config.paths.schemas, '_index.json')))
		.map(function(item) {
			return path.join(config.paths.schemas, item);
	});


	var eventHandlers = path.join(config.paths.schemas, '_event_handlers.json');


	var schemaRegistry = new schemaRegistryModule.SchemaRegistry({schemasList:schemasListPaths});

	var eventScheduler=new eventSchedulerModule.EventScheduler(mongoDriver);

	var importService = new csvImportModule.CsvImportService(config,mongoDriver,JSON.parse(fs.readFileSync(path.join(config.paths.schemas, '_importDefs.json'))));

	var eventRegistry=new eventRegistryModule.EventRegistry({eventHandlersPath:eventHandlers,mongoDriver:mongoDriver,eventScheduler:eventScheduler,config:config,importService:importService});

	eventScheduler.setEventRegistry(eventRegistry);

	var udc = new universalDaoControllerModule.UniversalDaoController(mongoDriver, schemaRegistry,eventRegistry);
	importService.setUdc(udc);

	var securityCtrl= new  securityControllerModule.SecurityController(mongoDriver,schemaRegistry,config);

	var statisticsCtrl = new statisticsControllerModule.StatisticsController(mongoDriver,{});
	var schemaCtrl = new schemaControllerModule.SchemaController(mongoDriver,schemaRegistry,eventRegistry,{
		rootPath: config.paths.schemas
	});

	var massmailingCtr= new massmailingCotrollerModule.MassmailingController(mongoDriver,config);

	app.use(cookieParser());
	app.use(securityCtrl.authFilter);

	app.put('/udao/save/:table',  securityService.authenRequired,bodyParser.json(), udc.save);
	app.put('/udao/saveBySchema/:schema',securityService.authenRequired, bodyParser.json(),udc.saveBySchema);
	app.get('/udao/get/:table/:id',securityService.authenRequired, bodyParser.json(), udc.get);
	app.get('/udao/getBySchema/:schema/:id',securityService.authenRequired, udc.getBySchema);
	app.get('/udao/list/:table',securityService.authenRequired, bodyParser.json(), udc.list);
	app.get('/udao/listBySchema/:schema',securityService.authenRequired, bodyParser.json(), udc.listBySchema);
	app.get('/udao/articleTagsDistinct',securityService.authenRequired, bodyParser.json(),function(req,res){udc.getArticleTagsDistinct(req,res);});
	app.post('/udao/search/:table',securityService.authenRequired, bodyParser.json(), udc.search);
	app.post('/search/count/:schema',securityService.authenRequired, bodyParser.json(),udc.searchBySchemaCount);
	app.post('/search/:schema',securityService.authenRequired, bodyParser.json(),udc.searchBySchema);

	app.post('/login', bodyParser.json(), function(req, res){securityCtrl.login(req, res);});
	app.get('/logout', bodyParser.json(), function(req, res){securityCtrl.logout(req, res);});
	app.get('/user/current',securityService.authenRequired, bodyParser.json(), function(req, res){securityCtrl.getCurrentUser(req, res);});
	app.post('/user/profile',securityService.authenRequired, bodyParser.json(), function(req, res){securityCtrl.selectProfile(req, res);});

	app.post('/resetPassword',securityService.hasPermFilter('Security - write').check, bodyParser.json(),function(req, res){securityCtrl.resetPassword(req, res);});
	app.post('/changePassword',securityService.hasPermFilter('System User').check, bodyParser.json(),function(req, res){securityCtrl.changePassword(req, res);});

	app.get('/security/permissions',securityService.authenRequired,function(req,res){securityCtrl.getPermissions(req,res);});
	app.get('/security/search/schemas',securityService.authenRequired,function(req,res){securityCtrl.getSearchSchemas(req,res);});
	app.post('/massmailing/send',securityService.hasPermFilter('Registry - write').check,bodyParser.json(),function(req,res){massmailingCtr.sendMail(req,res);});

	app.get('/statistics',securityService.hasPermFilter('Registry - read').check,function(req,res){statisticsCtrl.getStatistics(req,res);});

	app.get('/schema/compiled/*',securityService.hasPermFilter('System User').check,bodyParser.json(),function(req,res){schemaCtrl.getCompiledSchema(req,res);});
	app.get('/schema/ls*',securityService.hasPermFilter('System Admin').check,bodyParser.json(),function(req,res){schemaCtrl.schemaList(req,res);});
	app.get('/schema/get/*',securityService.hasPermFilter('System Admin').check,bodyParser.json(),function(req,res){schemaCtrl.schemaRead(req,res);});
	app.put('/schema/replace/*',securityService.hasPermFilter('System Admin').check,bodyParser.json(),function(req,res){schemaCtrl.schemaReplace(req,res);});

	app.get('/user/permissions/:id',securityService.hasPermFilter('Security - write').check,bodyParser.json(),function(req,res){securityCtrl.getUserPermissions(req,res);});
	app.post('/user/permissions/update',securityService.hasPermFilter('Security - write').check, bodyParser.json(),function(req,res){securityCtrl.updateUserPermissions(req,res);});
	app.post('/user/security/update',securityService.hasPermFilter('Security - write').check, bodyParser.json(),function(req,res){securityCtrl.updateUserSecurity(req,res);});
	app.post('/group/security/update',securityService.hasPermFilter('Security - write').check, bodyParser.json(),function(req,res){securityCtrl.updateGroupSecurity(req,res);});
	app.post('/security/profile/update',securityService.hasPermFilter('Security - write').check, bodyParser.json(),function(req,res){securityCtrl.updateSecurityProfile(req,res);});
	app.get('/security/profiles',securityService.authenRequired,function(req,res){securityCtrl.getProfiles(req,res);});

	var portalApi = new portalApiModule(mongoDriver);
	app.post('/portalapi/getByTags', bodyParser.json(), function(req, res) {portalApi.getByTags(req, res);});

	// Static data
//	app.use(express.static(path.join(process.cwd(), 'build', 'client')));

//	app.all('/my*',fsCtrl2.handle);

	app.use(express.static(__dirname + '/public'));
	app.use(errorhandler({ dumpExceptions: true, showStack: false }));

	log.verbose('Configuring photos sub applicaction');
	var photosRepoApp = fsController.create({rootPath: config.paths.photos ,fileFilter: null});
	app.use('/photos',photosRepoApp);

	var uploadsRepoApp = fsController.create({rootPath: config.paths.uploads ,fileFilter: null});
	app.use('/uploads',uploadsRepoApp);


	log.verbose('Configuring dataset sub applicaction');
	var datasetRepoApp = fsController.create({
			rootPath:config.paths.dataset,
			allowedOperations: ['get'],
			fileFilter: null});
	app.use('/dataset',datasetRepoApp);

	log.verbose('Configuring portal client sub applicaction');
	var portalClientRepoApp = fsController.create({
			rootPath: config.paths.portalClient,
			allowedOperations: ['get'],
			fileFilter: null});
//	app.use('/portal', portalClientRepoApp);

//	var server = app.listen(config.webserverPort || 3000, config.webserverHost || "0.0.0.0", function(){
//		log.info("Http server listening at %j", server.address(), {});
//	});


	if (process.env.REGISTRIES_PRODUCTION || process.env.NODE_ENV == 'test') {
		// We are in production environment, use only http port

		var port = config.webserverPort;
		var host = config.webserverHost;

		// Create an HTTP service.
		http.createServer(app)
		.listen(port, host, function() {
			log.info('Http server listening at %s:%s', host, port);
		});
	} else {
		// We are NOT in production environment, use https port

		var port = config.webserverSecurePort;
		var host = config.webserverHost;

		var sslKey =fs.readFileSync(path.join(process.cwd(), 'build', 'server', 'ssl', 'server.key'));
		var sslCert =fs.readFileSync(path.join(process.cwd(), 'build', 'server', 'ssl', 'server.crt'));

		var ssl = {
				key: sslKey.toString(),
				cert: sslCert.toString(),
				passphrase: 'changeit'
		};

		// Create an HTTPS service identical to the HTTP service.
		https.createServer(ssl, app)
		.listen(port, host, function(){
			log.info('Https (secure) server listening at %s:%s', host, port);
		});
	}

});
