var expect = require('chai').expect;

describe('mongoDriver wrapper', function() {
	it('should be instanciated correctly by require()', function() {
		var mongoDriverWrapper = require(process.cwd() + '/build/server/mongoDriver.js');
		expect(mongoDriverWrapper).to.include.key('init');
		expect(mongoDriverWrapper).to.include.key('getDb');
	});
});
