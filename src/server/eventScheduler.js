
var extend = require('extend');
var fs = require('fs');
var log = require('./logging.js').getLogger('EventScheduler.js');
var universalDaoModule = require('./UniversalDao.js');

var QueryFilter = require('./QueryFilter.js');

var DEFAULT_CFG = {
	pollingPeriod : 2000,
	batchSize : 20,
	eventCollection: 'events'
};

/**
 * Works as event sheduler and poller.
 * Polled events will be fired using event registry.
 */
var EventScheduler = function(mongoDriver,cfg) {
		var self=this;


		var prop = extend(true, {}, DEFAULT_CFG, cfg);

		this.eventRegistry = null;
		var eventDao = new universalDaoModule.UniversalDao(
					mongoDriver,
					{collectionName: prop.eventCollection}
				);

		this.setEventRegistry=function(eventRegistry){
			this.eventRegistry=eventRegistry;
		};

		this.pollForEvents=function(){
			log.debug('events polled');
			var qf=QueryFilter.create();

			//TODO configurable
			qf.setLimit(prop.batchSize);
			qf.addCriterium('fireOnTS', QueryFilter.operation.LESS_EQUAL,new Date().getTime());
			//TODO exclusive get should be used (support for multi instance mode)
			eventDao.find(qf,function (err,data){
				self.fireEvents(data);
			});

		};

		this.fireEvents=function(events){
			events.map(function(event){
				setTimeout(function(){
					eventDao.getWithTimeLock(event,3000,function (err, event){
						if (err) {log.error('getWithTimeLock',err); return;}
						if (!event){
							return;
						}
						log.verbose('firing event',event);
						//should be called when handling of atleast started.
						event.eventData.done=function(){
							eventDao.remove(event.id,function(err,data){if (err) {log.error('done',err); return;} log.verbose('event removed',data);});
						};
						self.eventRegistry.emitEvent(event.eventType,event.eventData);

					});
				},0);
			});
		};

		this.scheduleEvent=function(fireOnTS,eventType,eventData,refIds,cb){
			var currentTs=new Date().getTime();
			if (fireOnTS< currentTs){
				log.verbose('event emitted',event);
				self.eventRegistry.emitEvent(eventType,eventData);
				setTimeout(function ()  {cb();},0);
			}else {
				var event={fireOnTS:fireOnTS,eventType:eventType,eventData:eventData,refIds:refIds,scheduledOn:currentTs};
				log.verbose('event scheduled',event);
				eventDao.save(event,cb);
			}
		};

		this.unscheduleEvent=function(eventId){
			eventDao.remove(eventId,function(err,data){if (err) {log.error('unscheduleEvent',err); return;} log.verbose('event unscheduled',data);});
		};


		this.unscheduleEvents=function(refId,eventTypes,cb){
			var toRemove = {refIds:refId};

			if (eventTypes && eventTypes.length>0){
				toRemove.eventType = {$in:eventTypes};
			}
			eventDao.delete(toRemove,function(err,data){if (err) {log.error('unscheduleEvents',err);cb(err); return;} log.verbose('event unscheduled',data);cb(err,data);});
		};

		this.start=function (){
			setInterval(this.pollForEvents,prop.pollingPeriod);
		};

};

module.exports = {
	EventScheduler : EventScheduler
};
