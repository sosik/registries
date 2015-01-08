var chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

var expect = chai.expect;

var crypto = require('crypto'),
	async = require('async'),
	ObjectID = require('mongodb').ObjectID;

var universalDaoModule = require('./../../build/server/UniversalDao.js'),
	mongoDriver = require('./../../build/server/mongoDriver.js'),
	config = require('./../../build/server/config.js'),
	securityController = require('./../../build/server/securityController.js');

var mixins = {
	/** TODO: Add some randomization (faker.js?) */
	generateProfile: function(id) {
		return {
			"id": id || (new ObjectID()).toHexString(),
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
	},

	/** TODO: Add some randomization (faker.js?) */
	generatePerson: function(id, profiles, loginName, password) {
		var salt = crypto.randomBytes(8).toString('base64');
		var passwordHash = crypto.pbkdf2Sync(password || 'johndoe', salt, 1000, 256).toString('base64');
		return {
			"id": id || (new ObjectID()).toHexString(),
			"systemCredentials": {
				"login": {
					"loginName": loginName || "Administrator",
					"passwordHash": passwordHash,
					"email": "websupport@unionsoft.sk",
					"salt": salt
				},
				"profiles": profiles
			},
			"baseData": {
				"name": "Administrator",
				"bornNumber": "771010/1010",
				"surName": "UnionSoft s.r.o.",
				"birthDate": "19771010",
				"nationality": "SVK",
				"gender": "M"
			},
			"contactInfo": {
				"email": "websupport@unionsoft.sk",
				"street": "Galvaniho",
				"houseNumber": "17/B",
				"city": "Bratislava",
				"phoneNumber": "+421 2 50267 117",
				"zipCode": "821 04",
				"country": "SVK"
			}
		}
	},

	createLogin: function(person, profile, callback) {
		var peopleDao, profilesDao;

		async.series([
			function initMongo(cb) {
				return mongoDriver.init(config.mongoDbURI, cb);
			},
			function getDaos(cb) {
				peopleDao = new universalDaoModule.UniversalDao(mongoDriver, {
					collectionName: 'people'
				});

				profilesDao = new universalDaoModule.UniversalDao(mongoDriver, {
					collectionName: "securityProfiles"
				});

				return cb();
			},
			function index(cb) {
				mongoDriver.getDb().collection("people").ensureIndex({
					"systemCredentials.login.loginName": 1
				}, {
					unique: true,
					sparse: true
				}, cb);
			},
			function createProfile(cb) {
				profilesDao.save(profile, cb);
				// DAO modifies original object :(
				return mongoDriver._id2id(profile);
			},
			function createPerson(cb) {
				peopleDao.save(person, cb);
				// DAO modifies original object :(
				return mongoDriver._id2id(person);
			},
			function closeConnection(cb) {
				mongoDriver.close();
				return cb();
			}
		], callback);

	},

	cleanupLogin: function(callback) {
		// Cleanup
		async.series([
			function initMongo(cb) {
				return mongoDriver.init(config.mongoDbURI, cb);
			},
			function dropTokens(cb) {
				mongoDriver.getDb().collection('token').drop(cb);
			},
			function dropPeople(cb) {
				mongoDriver.getDb().collection('people').drop(cb);
			},
			function closeConnection(cb) {
				mongoDriver.close();
				return cb();
			}
		], callback);
	},

	logIn: function(username, password, callback) {
		browser.get('/#/login');

		element(by.model('user')).sendKeys(username).then(callback);
		expect(element(by.model('user')).getAttribute('value')).to.eventually.equal(username);
		element(by.model('password')).sendKeys(password);
		element(by.css('[ng-click="login()"]')).click().then(function() {
			var loginName = element(by.binding('security.currentUser.systemCredentials.login.loginName'));
			expect(loginName.isDisplayed()).to.eventually.equal(true).notify(callback);
		});
	}
};

module.exports = mixins;
