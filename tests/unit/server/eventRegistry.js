	var extend = require('extend');
	var async = require('async');
	var expect = require('chai').expect;

	var log = require(process.cwd() + '/build/server/logging.js').getLogger('ValidationsTest.js');
	var eventRegistryModule=require(process.cwd() + '/build/server/eventRegistry.js');

	var eventRegistry=new eventRegistryModule.EventRegistry({});

	describe('EventRegistry', function() {

		// beforEach(function(){});


			var handler1= new function (){

				this.handled=null;

				this.getType=function(){
					return ['event-type1'];
				};

				this.getName=function() {

					return 'handler1';
					};

				this.handle=function(event){
					this.handled=event;
				};

				this.getHandled=function(){
					return this.handled;
				};
			} ( );

			var handler2= new function (){

				this.handled=null;

				this.getType=function(){
					return ['event-type2'];
				};

				this.getName=function() {

					return 'handler2';
					};

				this.handle=function(event){
					this.handled=event;
				};

				this.getHandled=function(){
					return this.handled;
				};
			} ( );

			it('should dispatch event to right handler', function (done){
				eventRegistry.registerHandler(handler1);
				eventRegistry.registerHandler(handler2);

				expect(handler1.getHandled()).to.be.null;

				eventRegistry.emitEvent('event-type1',{test:'test'});

				setTimeout(function(){
					expect(handler1.getHandled()).to.be.not.null;
					expect(handler1.getHandled().test).equals('test');
					expect(handler2.getHandled()).to.be.null;
					done();
				},4);

			});
			it('event.done should be called', function (done){
				eventRegistry.registerHandler(handler1);
				eventRegistry.registerHandler(handler2);

				var event = {test:'test'};
				var doneCalled =false;
				event.done=function(){
					doneCalled=true;
				};

				expect(doneCalled).to.be.false;
				eventRegistry.emitEvent('event-type1',event);

				setTimeout(function(){
					expect(doneCalled).to.be.true;
					done();
				},4);

			});
	});
