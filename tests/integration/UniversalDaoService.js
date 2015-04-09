/*jslint node: true */
var expect = require('chai').expect;
var async = require('async');
var config = require(process.cwd() + '/build/server/config.js');
var mongoDriver = require(process.cwd() + '/build/server/mongoDriver.js');
var ObjectID = require('mongodb').ObjectID;
var udcServiceModule = require(process.cwd() + '/build/server/UniversalDaoService.js');


describe('universalDaoService', function() {
	var userDao;
	var savedId;

	before(function(done) {
		mongoDriver.init(config.mongoDbURI_test, function(err) {
			if (err) {
				console.error('Failed to init database:' + config.mongoDbURI_test);
				throw new Error('Failed to init database');
			}

			done();
		});
	});
	after(function (done){
		mongoDriver.getDb().dropDatabase(function(err) {
			if (err) {
				console.error('Failed to drop database:' + config.mongoDbURI_test);
				throw new Error('Failed to remove database');
			}

			done();
		});
	});




	it('Data should be filtered by profile criteria', function(done) {



		var schemaRegistryMock={

			getSchema:function () {
				return { compiled:{table:"test"}};
			}

		};

		var eventRegistryMock = {};
		var service= new udcServiceModule.UniversalDaoService(mongoDriver, schemaRegistryMock, eventRegistryMock);
		var userCtx= {
			user:{
					filter2:1
				},
			profile:{
				security:{
					forcedCriteria:[{
						applySchema:"uri://unitTest/schema",
						criteria : [
							{
								"f" : "filter",
								"op" : "eq",
								"v" : null,
								"expr" : "filter2"
							}
						]

					}]
				}
		}};
		var query={};

		// prepare several objects
		async.parallel([function (callback) {
			mongoDriver.getDb().collection("test").save({
				name: 'fero',
				age: 15,
				filter:1
			},
			callback);
		},
		function(callback) {
			mongoDriver.getDb().collection("test").save({
				name: 'jozo',
				age: 17,
				filter:2
			},
			callback);
		}],
		function(err) {
			// async final callback
			if (err) {
				done(new Error('Failed to prepare test data'));
			}

			service.searchBySchema("uri://unitTest/schema",userCtx,query,function(err,userErr,data){
				expect(err).to.be.null();
				expect(userErr).to.be.null();
				expect(data.length).equals(1);
				expect(data[0].name).equals("fero");
				done();

			});

		});





	});
	it('Data should fail if not able to resolve filter', function(done) {

		var schemaRegistryMock={

			getSchema:function () {
				return { compiled:{table:"test"}};
			}

		};

		var eventRegistryMock = {};
		var service= new udcServiceModule.UniversalDaoService(mongoDriver, schemaRegistryMock, eventRegistryMock);
		var userCtx= {
			user:{
					filter2:1
				},
			profile:{
				security:{
					forcedCriteria:[{
						applySchema:"uri://unitTest/schema",
						criteria : [
							{
								"f" : "filter",
								"op" : "eq",
								"v" : null,
								"expr" : "filterUnresolvable"
							}
						]

					}]
				}
		}};
		var query={};

		// prepare several objects
		async.parallel([function (callback) {
			mongoDriver.getDb().collection("test").save({
				name: 'fero',
				age: 15,
				filter:1
			},
			callback);
		},
		function(callback) {
			mongoDriver.getDb().collection("test").save({
				name: 'jozo',
				age: 17,
				filter:2
			},
			callback);
		}],
		function(err) {
			// async final callback
			if (err) {
				done(new Error('Failed to prepare test data'));
			}

			try {
				service.searchBySchema("uri://unitTest/schema",userCtx,query,function(err,userErr,data){
				});
			}
			catch ( ex){
				done();
				return;
			}
			done('should fail');
		});

	});


});
