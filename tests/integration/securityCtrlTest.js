var expect = require('chai').expect;
var util = require('util');
var securityModule = require(process.cwd() + '/build/server/securityController.js');


describe('SecurityCtrl', function() {
	beforeEach(function(done) {
		done();
	});

	afterEach(function(done) {
		done();
	});

	var securityCtrl = new securityModule.SecurityController(null, {});

	it('getRoles should return non empty list of roles', function(done) {
		
		var reqMock = {};
		
		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.send = function(code, data) {
				console.log(data);
				expect(data.length).to.be.above(1);
				done();
			};
		};
		util.inherits(resMock, require('stream').Writable);
		
		securityCtrl.getRoles(reqMock,res= new resMock());
		
	});

	
	
});
