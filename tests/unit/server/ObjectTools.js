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
});
