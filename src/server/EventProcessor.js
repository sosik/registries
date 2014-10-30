'use strict';

// require('look').start();
var log = require('./logging.js').getLogger('EventProcessor.js');
var path = require('path');
var fs = require('fs');
var fsController=require('./fsController.js');

var mongoDriver = require(path.join(process.cwd(), '/build/server/mongoDriver.js'));
var config = require(path.join(process.cwd(), '/build/server/config.js'));

var universalDaoControllerModule = require(process.cwd() + '/build/server/UniversalDaoController.js');

var securityControllerModule = require('./securityController.js');
var securityServiceModule = require('./securityService.js');
var securityService= new securityServiceModule.SecurityService();

var schemaRegistryModule = require('./schemaRegistry.js');

var schemaControllerModule = require('./schemaController.js');

var eventRegistryModule=require('./eventRegistry.js');

var eventSchedulerModule=require('./eventScheduler.js');


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
	var eventRegistry=new eventRegistryModule.EventRegistry({eventHandlersPath:eventHandlers,mongoDriver:mongoDriver,eventScheduler:eventScheduler,config:config});
	eventScheduler.setEventRegistry(eventRegistry);
	eventScheduler.start();

});
