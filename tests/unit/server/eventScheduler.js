	var extend = require('extend');
	var async = require('async');
	var expect = require('chai').expect;

	var log = require(process.cwd() + '/build/server/logging.js').getLogger('ValidationsTest.js');
	var eventSchedulerModule=require(process.cwd() + '/build/server/eventScheduler.js');

	describe('EventScheduler', function() {


		var mongoMock=new function () {

				var self=this;
				this.savedObj = null;
				this.findCalled=0;

				this.clear=function () {
					this.saveObj=null;
				};

				this.getSaved=function (){
						return this.savedObj;
				} ;
				this.constructSearchQuery=function (a) {
					// console.log('constructSearchQuery',a,b,c);
				};
				this.getDb=function (){

						return {
							collection:function(){
							return {
								save: function(obj,cb){
									// console.log('save ',obj);
									expect(obj).is.not.null;
									self.savedObj=obj;
									setTimeout(cb,0);
								},
								find: function(q,s,d){
									// console.log('find');
									findCalled++;
								}
							};
						}
					};
				};
			this.id2_id= function(){

			};
			this._id2id= function(){

			};

		}();




		var eventRegistryMock = new function() {
			this.eventType;
			this.eventData;
			this.emitEvent=function(eventType,eventData){
				this.eventType=eventType;
				this.eventData=eventData;
			};
			this.getEventData=function(){
				return this.eventData;
			};
			this.getEventType=function(){
				return this.eventType;
			};
			this.clear=function(){
				this.eventData=null;
				this.eventType=null;
			};
		}();


		var eventScheduler=new eventSchedulerModule.EventScheduler(mongoMock,{pollingPeriod:3});
		eventScheduler.setEventRegistry(eventRegistryMock);

		beforeEach(function(){
			mongoMock.clear();
			eventRegistryMock.clear();
		});


		it ('future event should be stored',function(done){

			var fireOnTS= new Date().getTime()+10;
			var eventType='test-event';
			var eventData= {data:'data',number:7};
			var refIds= ['1','2'];

			eventScheduler.scheduleEvent(fireOnTS,eventType,eventData,refIds,function(){
				expect(mongoMock.getSaved()).to.be.not.null;

				expect(mongoMock.getSaved().eventData).equals(eventData);
				expect(mongoMock.getSaved().eventType).equals(eventType);
				done();
			});
		});

		it ('should dispatch historical events immidiately',function(done){

				var fireOnTS= new Date().getTime()-10;
				var eventType='test-event';
				var eventData= {data:'data',number:7};
				var refIds= ['1','2'];

				eventScheduler.scheduleEvent(fireOnTS,eventType,eventData,refIds,function(){

					setTimeout(function(){
						expect(eventData).equals(eventRegistryMock.getEventData());
						expect(eventType).equals(eventRegistryMock.getEventType());

						done();
					},2);
				});
		});


		it ('should dispatch future events in schedule',function(done){

				var fireOnTS= new Date().getTime()+12;
				var eventType='test-event';
				var eventData= {data:'data',number:8};
				var refIds= ['1','2'];

				eventScheduler.scheduleEvent(fireOnTS,eventType,eventData,refIds,function(){

					setTimeout(function(){
						expect(eventRegistryMock.getEventData()).to.be.null;
						expect(eventRegistryMock.getEventType()).to.be.null;
						expect(mongoMock.getSaved()).to.be.not.null;
					},2);

					setTimeout(function(){
						expect(eventRegistryMock.getEventData()).to.be.null;
						expect(eventRegistryMock.getEventType()).to.be.null;
					},6);

					setTimeout(function(){
						// console.log(mongoMock.getSaved());
						expect(eventData).equals(mongoMock.getSaved().eventData);
						expect(eventType).equals(mongoMock.getSaved().eventType);
						done();
					},11);

				});
		});

	});
