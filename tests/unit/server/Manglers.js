var extend = require('extend');
var async = require('async');
var expect = require('chai').expect;

var log = require(process.cwd() + '/build/server/logging.js').getLogger('ValidationsTest.js');
var ObjectManglerModule = require(process.cwd() + '/build/server/ObjectMangler.js');
var typeValidator = require(process.cwd() + '/build/server/manglers/TypeValidator.js')();
var requiredValidator = require(process.cwd() + '/build/server/manglers/RequiredValidator.js')();
var objectLinkMangler = require(process.cwd() + '/build/server/manglers/ObjectLinkMangler.js')();
var collationMangler = require(process.cwd() + '/build/server/manglers/CollationMangler.js')();
var collationUnmangler = require(process.cwd() + '/build/server/manglers/CollationUnmangler.js')();


var objectLinkUnmangler = require(process.cwd() + '/build/server/manglers/ObjectLinkUnmangler.js')(function() {
	return {
		get: function(oid, callback) {
			callback(null, {
				baseData: {
					name: 'name_' + oid,
					surName: 'surName_' + oid
				}
			});
		}
	};
});

describe('Manglers', function() {
	var testObject01 = {
		baseData: {
			name: 'TestName',
			surName: 'TestSurName',
			age: 10,
			gender: "M",
			address: {
				city: {
					registry: 'cities',
					oid: '1111',
					refData: {
						name: 'ddd'
					}
				}
			}
		},
		tags: [
			{
				registry: 'tags',
				oid: 'tag01'
			},
			{
				registry: 'tags',
				oid: 'tag02'
			}
		]
	};

	var testSchema01 = {
		properties: {
			baseData: {
				properties: {
					name: {
						type: 'string',
						required: true
					},
					surName: {
						type: 'string'
					},
					age: {
						type: 'number'
					},
					gender: {
						required: true
					},
					address: {
						type: 'object',
						properties: {
							city: {
								objectLink: {
									registry: 'cities',
									name: 'baseData.name',
									surName: 'baseData.surName'
								}
							}
						}
					}
				}
			},
			tags: {
				type: 'array',
				items: {
					objectLink: {
						registry: 'tags',
						name: 'baseData.name'
					}
				}
			}
		}
	};


	var testSchema03 = {
		properties: {
			baseData: {
				properties: {
					name: {
						type: 'string',
						required: true,
						collate:true
					}
				}
			}
		}
	};


	it('Type validation positive', function(done) {
		var resultPaths = [];

		var om = ObjectManglerModule.create([typeValidator]);

		var to = extend(true, {}, testObject01);
		var ts = extend(true, {}, testSchema01);

		om.mangle(to, ts, function(err, localErrors) {
			expect(err).to.not.exist;
			expect(localErrors).to.be.empty;
			done();
		});
	});

	it('Type validation negative', function(done) {
		var om = ObjectManglerModule.create([typeValidator]);

		var to = extend(true, {}, testObject01);
		var ts = extend(true, {}, testSchema01);

		to.baseData.age = "xxx";
		to.baseData.name = 1;

		om.mangle(to, ts, function(err, localErrors) {
			expect(err).to.not.exist();
			expect(localErrors).to.have.length(2);
			done();
		});
	});

	it('Required validation', function(done) {
		var om = ObjectManglerModule.create([requiredValidator]);

		var to = extend(true, {}, testObject01);
		var ts = extend(true, {}, testSchema01);

		delete to.baseData.gender;

		om.mangle(to, ts, function(err, localErrors) {
			expect(err).to.not.exist();
			expect(localErrors).to.have.length(1);
			done();
		});
	});

	it('ObjectLink mangler', function(done) {
		var om = ObjectManglerModule.create([objectLinkMangler]);

		var to = extend(true, {}, testObject01);
		var ts = extend(true, {}, testSchema01);

		om.mangle(to, ts, function(err, localErrors) {
			expect(err).to.not.exist;
			expect(localErrors).to.have.length(0);
			expect(to.baseData.address.city).to.have.keys('registry', 'oid');
			done();
		});
	});

	it('ObjectLink unmangler', function(done) {
		var om = ObjectManglerModule.create([objectLinkUnmangler]);

		var to = extend(true, {}, testObject01);
		var ts = extend(true, {}, testSchema01);

		to.baseData.address.city.refData = {
			name: 'xxx'
		};

		om.mangle(to, ts, function(err, localErrors) {
			expect(err).to.not.exist;
			expect(localErrors).to.have.length(0);
			expect(to.baseData.address.city).to.have.keys('registry', 'oid', 'refData');
			done();
		});
	});

	it('Collate mangler should enhace object', function(done) {
		var om = ObjectManglerModule.create([collationMangler]);

		var to = extend(true, {}, testObject01);
		var ts = extend(true, {}, testSchema03);

		to.baseData.address.city.refData = {
			name: 'xxx'
		};

		om.mangle(to, ts, function(err, localErrors) {
			expect(err).to.not.exist();
			expect(localErrors).to.have.length(0);
			expect(to.baseData.name).to.have.keys('v', 'c');
			expect(to.baseData.name.v).to.be.equal('TestName');
			expect(to.baseData.name.c).to.be.not.empty();
			done();
		});
	});


	it('Collate unmangler should narrow object', function(done) {
		var om = ObjectManglerModule.create([collationUnmangler]);

		var to = extend(true, {}, testObject01);
		var ts = extend(true, {}, testSchema03);

		to.baseData.name = {
			v:"testValue",c:"collation"
		};

		om.mangle(to, ts, function(err, localErrors) {
			expect(err).to.not.exist();
			expect(localErrors).to.have.length(0);
			expect(to.baseData.name).to.be.equal('testValue');
			expect(to.baseData.name.v).to.not.exist();
			expect(to.baseData.name.c).to.not.exist();
			done();
		});
	});

});
