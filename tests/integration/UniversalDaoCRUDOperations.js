var expect = require('chai').expect;
var async = require('async');
var config = require(process.cwd() + '/build/server/config.js');
var mongoDriver = require(process.cwd() + '/build/server/mongoDriver.js');
var ObjectID = require('mongodb').ObjectID;
var universalDaoModule = require(process.cwd() + '/build/server/UniversalDao.js');

var user1 = {
		name: {
			firstName: "John",
			lastName: "Doe"
		},
		address: {
			street: "First Lane",
			houseNo: 25,
			city: "New York",
			zipCode: "12366"
		}
	};


describe('universalDaoCRUDOperations', function() {
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
	it('Create - dao should create object', function(done) {
		// this is first test, there should be no user
		var cn = 'testCol';
		var d = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: cn}
		);
		d.save(user1, function(err, data) {
			if (err) {
				throw new Error(err);
			}

			mongoDriver.getDb().collection(cn).find(function(err, cursor) {
				if (err) {
					throw new Error(err);
				}

				cursor.toArray(function(err, mongoData) {
					if (err) {
						throw new Error(err);
					}
					// we inserted single record into empty collection
					expect(mongoData.length).to.be.equal(1);
					expect(mongoData[0].name.firstName).to.be.equal(user1.name.firstName);
					expect(mongoData[0]._id).to.not.be.undefined;
					expect(mongoData[0]._id.toHexString()).to.be.equal(data.id);

					savedId = user1.id;
					done();
				});
			});
		});
	});
	it('Read - dao should return saved object', function(done) {
		var cn = 'testCol';
		var d = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: cn}
		);

		d.get(user1.id, function(err, data) {
			if (err) {
				throw new Error(err);
			}

			mongoDriver.getDb().collection(cn).findOne({"_id": new ObjectID.createFromHexString(user1.id)}, function(err, mongoData) {
				if (err) {
					throw new Error(err);
				}

				expect(mongoData._id.toHexString()).to.be.equal(data.id);
				expect(data.id).to.be.equal(user1.id);
				expect(data).to.be.eql(user1);

				done();
			});
		});
	});
	it('Update - dao should update saved object', function(done) {
		var cn = 'testCol';
		var d = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: cn}
		);

		var updatedUser = {
			id: user1.id,
			name: {
				firstName: 'Jim'
			},
			address: {
				city: null
			}
		};

		d.update(updatedUser, function(err, count){
			if (err) {
				throw new Error(err);
			}
			
			expect(count).to.be.equal(1);
			
			mongoDriver.getDb().collection(cn).findOne({"_id": new ObjectID.createFromHexString(user1.id)}, function(err, mongoData) {
				if (err) {
					throw new Error(err);
				}
				expect(mongoData._id.toHexString()).to.be.equal(updatedUser.id);
				expect(mongoData.name.firstName).to.be.equal(updatedUser.name.firstName);
				expect(mongoData.name.lastName).to.be.equal(user1.name.lastName);
				expect(mongoData.address).to.not.include.key('city');

				done();
			});
		});
	});
	
	it('Update - dao should update saved object empty unset', function(done) {
		var cn = 'testCol';
		var d = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: cn}
		);

		var updatedUser = {
			id: user1.id,
			name: {
				firstName: 'Jim'
			},
			address: {
				city: 'notnullcity'
			}
		};

		d.update(updatedUser, function(err, count){
			if (err) {
				throw new Error(err);
			}
			
			expect(count).to.be.equal(1);
			
			mongoDriver.getDb().collection(cn).findOne({"_id": new ObjectID.createFromHexString(user1.id)}, function(err, mongoData) {
				if (err) {
					throw new Error(err);
				}
				expect(mongoData._id.toHexString()).to.be.equal(updatedUser.id);
				expect(mongoData.name.firstName).to.be.equal(updatedUser.name.firstName);
				expect(mongoData.name.lastName).to.be.equal(user1.name.lastName);
				expect(mongoData.address).to.include.key('city');

				done();
			});
		});
	});
	
	it('Delete - dao should remove saved object', function(done) {
		var cn = 'testCol';
		var d = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: cn}
		);
		d.remove(user1.id, function(err, count) {
			if (err) {
				throw new Error(err);
			}

			expect(count).to.be.equal(1);
			done();
		});
	});
	it('Distinct - should return distinct values for a path', function(done) {
		// this is first test, there should be no user
		var cn = 'testCol';
		var d = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: cn}
		);
		var a1 = {
			meta: {
				tags: ['orange', 'blue']
			}
		};
		var a2 = {
			meta: {
				tags: ['red']
			}
		};
		var a3 = {
			meta: {
				tags: ['orange']
			}
		};
		d.save(a1, function(err, data) {
			if (err) {
				throw new Error(err);
			}

			d.save(a2, function(err, data) {
				if (err) {
					throw new Error(err);
				}

				d.save(a2, function(err, data) {
					if (err) {
						throw new Error(err);
					}

					d.distinct('meta.tags', {}, function(err, data) {
						if (err) {
							throw new Error(err);
						}

						expect(data.length).to.be.equal(3);
						expect(data).to.include('red');
						expect(data).to.include('orange');
						expect(data).to.include('blue');

						done();
					});
				});

			});
		});
	});

	it('List with criteria - dao should find object by criteria', function(done) {
		var cn = 'testCol2';
		var d = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: cn}
		);
		
		// prepare several objects
		async.parallel([function (callback) {
			mongoDriver.getDb().collection(cn).save({
				name: 'fero',
				age: 15
			},
			callback);
		},
		function(callback) {
			mongoDriver.getDb().collection(cn).save({
				name: 'jozo',
				age: 17
			},
			callback);
		}],
		function(err) {
			// async final callback
			if (err) {
				done(new Error('Failed to prepare test data'));
			}

			var opts = {
				crits: [{f: 'name', op: 'eq', v: 'fero'}]
			}
			d.list(opts, function(err, result) {
				if (err) {
					done(err);
				}

				done();
			});
		});
	});
});
