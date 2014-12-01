'use strict';

var extend = require('extend');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

var log = require('./logging.js').getLogger('EventRegistry.js');


var eventTypes= {
	ENTITY_CREATED: 'entity-created',
	ENTITY_MODIFIED: 'entity-modified',
	ENTITY_REMOVED: 'entity-removed'
};

/**
 * Works as 'static' registry for eventHandlers.
 */
var EventRegistry = function(ctx) {
	var self=this;
	ctx.eventRegistry=this;
	this.load=function() {
		log.info('Loading EventRegistry');
		self.removeAllListeners();
		if (ctx.eventHandlersPath){
			var eventHandlers=JSON.parse(fs.readFileSync(ctx.eventHandlersPath));
			eventHandlers.map(function(handler) {
					// handler injected
					if (handler.enabled){
							var h=require(process.cwd()+'/'+handler.file)(ctx);
							self.registerHandler(h);
					}
			});
		}

	};

	// can be used to add handlers programatically
	this.registerHandler=function(handler){
			handler.getType().map(function (eventType){
				log.debug('Registrering event handler', handler.name,'listens for',eventType);
				self.addListener(eventType,function(event){
					try {
						handler.handle(event);
						//unregister handled events, not best for async handling
						if ( event.done ){
							event.done();
						}
					}
					catch(err){
						log.error('Error during event processing ',handler,err.stack);
					}
				});
			});
	};

	this.load();

	this.emitEvent=function(eventType,eventData){
		eventData.eventType=eventType;
		eventData.emitedOn = new Date().getTime();
		self.emit(eventType,eventData);
		log.verbose('event emited',eventType,eventData.id);
	};

	this.emitProcesingError=function(error,causeEvent){
		var event={error:error,causeEvent:causeEvent};
		self.emitEvent("event-processing-error",event);
	};

};

// Extend from EventEmitter 'addListener' and 'emit' methods
EventRegistry.prototype = new EventEmitter;

module.exports = {
	EventRegistry : EventRegistry,
	eventTypes:eventTypes
};
