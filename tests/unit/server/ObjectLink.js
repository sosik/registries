var expect = require('chai').expect;
var fs = require('fs');
var async = require('async');
var SchemaToolsModule = require(process.cwd() + '/build/server/SchemaTools.js');
var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');
var log = require(process.cwd() + '/build/server/logging.js').getLogger('ObjectLinkTest.js');

describe('ObjectLink', function() {
	var schemaTools;

	before(function(done) {
		schemaTools = new SchemaToolsModule.SchemaTools();

		schemaTools.registerSchema(null,
			JSON.parse(fs.readFileSync(process.cwd() + '/build/shared/schemas/objectLink.json'))
		);
		schemaTools.registerSchema(null,
			JSON.parse(fs.readFileSync(process.cwd() + '/build/shared/schemas/user.json'))
		);


		schemaTools.parse();
		schemaTools.compile();

		done();
	});

	it('Identify $objectLinks', function(done) {
		var schema = schemaTools.getSchema('uri://registries/user#');

		var objectLinksBySchema = [];
		objectTools.propertyVisitor(schema.compiled, /\objectLink$/, function(val, path, obj) {
			objectLinksBySchema.push(objectTools.stripFromPath(path, 1));

		});

		expect(objectLinksBySchema.length).to.be.equal(4);
		expect(objectLinksBySchema[0]).to.be.equal('properties.club');
		expect(objectLinksBySchema[1]).to.be.equal('properties.employer');
		done();
	});

	it('$objectLink resolution', function(done) {
		var schema = schemaTools.getSchema('uri://registries/user#');
		var obj = {
			firstName: "Fero",
			club: {
				registry: "clubs",
				oid: "112233"
			},
			employer: {
				registry: "emploers",
				oid: "1324654"
			},
			school: {
				registry: "school",
				oid: "1111"
			}
		}

		var iterator = function(registry, oid, fields, callback) {
			var result = {};
			for (var i in fields) {
				result[fields[i]] = fields[i] + '-RESOLVED';
			}
			callback(null, result);
		}

		objectTools.resolveObjectLinks(schema.compiled, obj, iterator, function(err, data) {
			expect(data).to.have.deep.property('club.registry');
			expect(data).to.have.deep.property('club.oid');
			expect(data).to.have.deep.property('club.refData.name', 'name-RESOLVED');
			expect(data).to.have.deep.property('employer.registry');
			expect(data).to.have.deep.property('employer.oid');
			expect(data).to.have.deep.property('employer.refData.name', 'employer.name-RESOLVED');
			expect(data).to.have.deep.property('employer.refData.type', 'employer.type-RESOLVED');
			done();
		});
	});
});
