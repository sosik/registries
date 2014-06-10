var ObjectTools = require(process.cwd() + '/build/server/ObjectTools.js');
var expect = require('chai').expect;

describe('ObjectTools', function() {
	var obj = {
		name: 'Fero',
		lastName: 'Jahoda',
		address: {
			street: 'Zahradna',
			number: 24,
			zipCode: '010 01',
			city: 'Bratislava',
			nullProp: null,
			testArray: [
				{key: 'k1', val: 1},
				{key: 'k2', val: 2},
				{key: 'k3', val: 3}
			]
		}
	};

	it('Base object visiting', function(done) {
		var result = {};
		ObjectTools.propertyVisitor(obj, /./, function(val, path) {
			result[path] = val;
		});

		expect(result).to.have.property('name');
		expect(result).to.have.property('address.street', 'Zahradna');
		expect(result).to.have.property('address.nullProp', null);
		expect(result).to.have.property('address.testArray.1.key', 'k2');

		done();
	});

	it('Base path evaluation', function(done) {
		expect(ObjectTools.evalPath(obj, 'name')).to.be.eql(obj.name);
		expect(ObjectTools.evalPath(obj, 'address.zipCode')).to.be.eql(obj.address.zipCode);
		expect(ObjectTools.evalPath(obj, 'address.nullProp')).to.be.eql(obj.address.nullProp);
		expect(ObjectTools.evalPath(obj, 'address.testArray.1.key')).to.be.eql(obj.address.testArray[1].key);

		done();
	});

	it('Object path evaluation', function(done) {
		expect(ObjectTools.evalPath(obj, 'name')).to.be.eql(obj.name);
		expect(ObjectTools.evalPath(obj, 'address.city')).to.be.eql(obj.address.city);

		done();
	});

	it('Object path stripping', function(done) {
		var tPath = 'object.property.subproperty.subsubproperty';

		expect(ObjectTools.stripFromPath(tPath, 1)).to.be.equal('object.property.subproperty');
		expect(ObjectTools.stripFromPath(tPath, 2)).to.be.equal('object.property');
		expect(ObjectTools.stripFromPath(tPath, 3)).to.be.equal('object');
		expect(function() {ObjectTools.stripFromPath(tPath, 4);}).to.throw();

		done();
	});

	it('Schema path to object path conversion', function() {

		expect(ObjectTools.schemaPathToObjectPath('properties.address.properties.city')).to.be.equal('address.city');
	});
});
