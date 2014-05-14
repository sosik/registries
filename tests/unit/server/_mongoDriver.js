var expect = require('chai').expect;
var path = require('path');
var realMongoClient = require('mongodb').MongoClient;
var realObjectID = require('mongodb').ObjectID;
var QueryFilter = require(path.join(process.cwd(), 'build/server/QueryFilter.js'));

describe('_mongoDriver', function() {
	it('should unmangle mongo ObjectID into string representation', function(done) {
		var _mongoDriver = require(process.cwd() + '/build/server/_mongoDriver.js')(realMongoClient, realObjectID, QueryFilter);
		var _id = new realObjectID();
		var obj = {
			_id: _id,
			name: 'fero',
			age: '15'
		};

		var mangledObj = _mongoDriver._id2id(obj);
		expect(mangledObj).to.be.equal(obj);
		expect(mangledObj).to.include.key('id');
		expect(mangledObj).to.not.include.key('_id');
		expect(mangledObj.id).to.equal(_id.toHexString());

		done();
	});
	it('should mangling text representation of id into mongo ObjectID', function(done) {
		var _mongoDriver = require(process.cwd() + '/build/server/_mongoDriver.js')(realMongoClient, realObjectID, QueryFilter);
		var id = '533fddbabdb11f0215c03316';
		var obj = {
			id: id,
			name: 'fero',
			age: '15'
		};

		var mangledObj = _mongoDriver.id2_id(obj);
		expect(mangledObj).to.be.equal(obj);
		expect(mangledObj).to.include.key('_id');
		expect(mangledObj).to.not.include.key('id');
		expect(mangledObj._id).to.be.an.instanceof(realObjectID);

		done();
	});
	it('create mongo update object', function(done){
		var _mongoDriver = require(process.cwd() + '/build/server/_mongoDriver.js')(realMongoClient, realObjectID, QueryFilter);

		var obj = {
			id: '533fddbabdb11f0215c03316',
			name: {
				firstName: "Joe",
				middleName: null,
				lastName: "Doe"
			},
			address: {
				street: "First st",
				city: "New York",
				country: "USA"
			}
		};

		var updateObject = _mongoDriver.constructUpdateObject(obj);
		expect(updateObject.$set['name.firstName']).to.be.equal(obj.name.firstName);
		expect(updateObject.$set['name.lastName']).to.be.equal(obj.name.lastName);
		expect(updateObject.$unset['name.middleName']).to.be.equal(1);
		expect(updateObject.$set['address.street']).to.be.equal(obj.address.street);
		expect(updateObject.$set['address.city']).to.be.equal(obj.address.city);
		expect(updateObject.$set['address.country']).to.be.equal(obj.address.country);
		expect(updateObject).to.not.include.key('id');
		done();
	});

	
	it('should construct mongo search criteria based on provided QueryFilter', function(done){
		var _mongoDriver = require(process.cwd() + '/build/server/_mongoDriver.js')(realMongoClient, realObjectID, QueryFilter);

		var qf = QueryFilter.create();

		qf.addCriterium('name', QueryFilter.operation.EQUAL, 'fero')
		.addCriterium('age').addSort('age').addField('name');

		var mongoSearch = _mongoDriver.constructSearchQuery(qf);

		expect(mongoSearch).to.include.key('selector');
		expect(mongoSearch.selector).to.include.key('name');
		expect(mongoSearch.selector).to.include.key('age');
		expect(mongoSearch).to.include.key('fields');
		expect(mongoSearch.fields).to.include.key('name');
		expect(mongoSearch).to.include.key('sort');
		expect(mongoSearch.sort).to.include.key('age');
		done();
	});
});
