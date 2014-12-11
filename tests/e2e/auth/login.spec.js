var chai = require('chai'),
	chaiAsPromised = require('chai-as-promised'),
	async = require('async');

chai.use(chaiAsPromised);

var expect = chai.expect;

var universalDaoModule = require('./../../../build/server/UniversalDao.js');
var mongoDriver = require('./../../../build/server/mongoDriver.js');
var config = require('./../../../build/server/config.js');

var profile = {
	"id": "53cd19d5502cd4915bd08724",
	"baseData": {
		"name": "masterProfile"
	},
	"forcedCriteria": {
	},
	"security": {
		"permissions": {
			"System User": true,
			"Registry - read": true,
			"Registry - write": true,
			"Security - read": true,
			"Security - write": true,
			"System Admin": true
		},
		"groups": {

		}
	}
};

var johndoe={
	"id": "53cf5c54118025ff1b88e368",
	"systemCredentials": {
		"login": {
			"loginName": "Administrator",
			"passwordHash": "mcHWq0FyMluy3U3nGQJeYuR6ffSDxgtG1SaejicXJvdxyM/1NUP7X5Kx3LpvsAQ+XOq8Hs+maYLiEXDQYr3OCh2o+gtTxvhEz9Z4Bem0J09v7GyxdkD2S2zED7Obr6XzPzpaxaYfmFBHRR5iy2JDRx/lAcBM1L0qFfBnoXoGYm6jcUn6Klht9xoPnYGvDVdxtjWG9GqBrLfIJb1Aot3WCPOAG0BzlidfjdG0exJhkC0eOTwgFG4D8vP/AOblI2N+skZ3ztDb6NIxRIyd70bDooUhB7HcRnJgsrqBGg68UfBReHXYFnQYYa7Fv4/mR+4y+N+SpFXokYcKUI0e6sCPcQ==",
			"email": "websupport@unionsoft.sk",
			"salt": "johndoe"
		},
		"profiles": ["53cd19d5502cd4915bd08724"]
	},
	"baseData": {
		"name": "Administrator",
		"bornNumber": "771010/1010",
		"surName": "UnionSoft s.r.o.",
		"birthDate": "10.10.1977",
		"nationality": "SVK",
		"gender": "M"
	},
	"contactInfo": {
		"email": "websupport@unionsoft.sk",
		"street": "Galvaniho",
		"houseNumber": "17/B",
		"city": "Bratislava ",
		"phoneNumber": "+421 2 50267 117",
		"zipCode": "821 04",
		"country": "SVK"
	}
};

describe("[AUTH] Login page", function () {
	this.timeout(30000);
	this.slow(30000);

	it('should display a login form', function () {
		browser.get('/');

		var form = element(by.id('login-form'));

		expect(form.isPresent()).to.eventually.equal(true);
	});

	describe('form', function () {
		var peopleDao, tokenDao, profilesDao;

		beforeEach(function (done) {
			async.series([
				function initMongo(cb) {
					return mongoDriver.init(config.mongoDbURI, cb);
				},
				function getDaos(cb) {
					peopleDao = new universalDaoModule.UniversalDao(mongoDriver, {
						collectionName: 'people'
					});

					tokenDao = new universalDaoModule.UniversalDao(mongoDriver, {
						collectionName: 'token'
					});

					profilesDao = new universalDaoModule.UniversalDao(mongoDriver, {
						collectionName : "securityProfiles"
					});

					return cb();
				},
				function index(cb) {
					mongoDriver.getDb().collection("people").ensureIndex({
						"systemCredentials.login.loginName" : 1
					}, {
						unique: true,
						sparse: true
					}, cb);
				},
				function createProfile(cb) {
					return profilesDao.save(profile, cb);
				},
				function createUser(cb) {
					return peopleDao.save(johndoe, cb);
				}
			], done);
		});

		afterEach(function(done) {
			async.series([
				function dropTokens(cb) {
					mongoDriver.getDb().collection('token').drop(cb);
				},
				function dropPeople(cb) {
					mongoDriver.getDb().collection('people').drop(cb);
				}
			], done);
		});

		it('should log user in', function(done) {
			var login = johndoe.systemCredentials.login.loginName;
			element(by.model('user')).sendKeys(login);
			element(by.model('password')).sendKeys('johndoe');
			element(by.css('[ng-click="login()"]')).click().then(function() {
				var loginName = element(by.binding('security.currentUser.systemCredentials.login.loginName'));
				expect(loginName.isDisplayed()).to.eventually.equal(true);
				expect(loginName.getText()).to.eventually.equal(login).notify(done);
			});
		});

	});
});
