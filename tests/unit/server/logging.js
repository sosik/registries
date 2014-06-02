var expect = require('chai').expect;

describe('Base looging', function() {
	it('should instantiate default logger', function(done) {
		var logging = require(process.cwd() + '/build/server/logging.js');
		var log = logging.getLogger();

		expect(log).to.have.property('log');

		var log2 = logging.getLogger('DEFAULT');

		expect(log2).to.have.property('log');
		expect(log).to.be.eql(log2);

		done();
	});
	it('should instantiate new logger', function(done) {
		var logging = require(process.cwd() + '/build/server/logging.js');
		var log = logging.getLogger('TESTTTTTTTTT');

		expect(log).to.have.property('log');

		done();
	});
});
