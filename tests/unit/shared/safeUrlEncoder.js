var expect = require('chai').expect;
var safeUrlEncoder = require(process.cwd() + '/build/server/safeUrlEncoder.js');

describe('safeUrlEncoder', function() {
	it('should correctly encode', function(done) {
		var encoded = safeUrlEncoder.encode('uri://~xxx/gggg');
		expect(encoded).to.be.equal('uri~3A~2F~2F~7Exxx~2Fgggg');
		done();
	});

	it('should correctly decode', function(done) {
		var encoded = safeUrlEncoder.decode('uri~3A~2F~2F~7Exxx~2Fgggg');
		expect(encoded).to.be.equal('uri://~xxx/gggg');
		done();
	});

	it('should decode what encoded', function(done) {
		var txt = 'uri:/gsafa/dfffadsf?dsfaadfsd';

		expect(safeUrlEncoder.decode(safeUrlEncoder.encode(txt))).to.be.equal(txt);
		done();
	});

	it('encoded text should not be decoded by standard urlDecode but correctly decoded by safe decoder', function(done) {
		var txt = 'uri:/gsafa/dfffadsf?dsfaadfsd';

		var encoded = safeUrlEncoder.encode(txt);
		var urlDecoded = decodeURIComponent(encoded);

		expect(urlDecoded).to.be.equal(encoded);

		var decoded = safeUrlEncoder.decode(encoded);

		expect(decoded).to.be.equal(txt);
		done();
	});
});
