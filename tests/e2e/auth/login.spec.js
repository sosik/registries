var chai = require('chai'),
	chaiAsPromised = require('chai-as-promised'),
	mixins = require('../mixins');

var safeUrlEncoder = require('./../../../build/server/safeUrlEncoder');

chai.use(chaiAsPromised);

var expect = chai.expect;

describe("[AUTH] Login page", function () {
	this.timeout(30000);
	this.slow(10000);

	it('should display a login form', function () {
		browser.get('/');

		var form = element(by.id('login-form'));

		expect(form.isPresent()).to.eventually.equal(true);
	});

	describe('form', function () {
		var password = 'johndoe',
			login = 'Administrator';

		var profile = mixins.generateProfile(),
			person = mixins.generatePerson(null, [ profile.id ], login, password);

		before(function(done) {
			mixins.createLogin(person, profile, done);
		});

		after(function(done) {
			mixins.cleanupLogin(done);
		});

		it('should log user in', function(done) {
			element(by.model('user')).sendKeys(login);
			element(by.model('password')).sendKeys(password);
			element(by.css('[ng-click="login()"]')).click().then(function() {
				var loginName = element(by.binding('security.currentUser.systemCredentials.login.loginName'));
				expect(loginName.isDisplayed()).to.eventually.equal(true);
				expect(loginName.getText()).to.eventually.equal(login).notify(done);
			});
		});

		it('should display user profile after login', function(done) {
			expect(browser.getLocationAbsUrl()).to.eventually.equal(browser.baseUrl + '/#/registry/view/' + safeUrlEncoder.encode('uri://registries/people#views/fullperson') + "/" + person.id);
		});

	});
});
