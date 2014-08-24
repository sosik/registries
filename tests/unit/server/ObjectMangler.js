var extend = require('extend');

var log = require(process.cwd() + '/build/server/logging.js').getLogger('ObjectManglerTest.js');
var ObjectManglerModule = require(process.cwd() + '/build/server/ObjectMangler.js');

describe('ObjectMangler', function() {
	var testObject01 = {
		baseData: {
			name: 'TestName',
			surName: 'TestSurName'
		}
	};

	var testSchema01 = {
		properties: {
			baseData: {
				properties: {
					name: {
						type: 'string'
					},
					surName: {
						type: 'string'
					}
				}
			}
		}
	};

	it('Base object traversal', function(done) {
		var resultPaths = [];

		var om = ObjectManglerModule.create();

		var to = extend(true, {}, testObject01);
		var ts = extend(true, {}, testSchema01);

		om.mangle(to, ts, function() {
			done();
		});
	});
});
