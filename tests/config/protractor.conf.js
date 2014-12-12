var q = require('q'),
	async = require('async');

var mongoDriver = require('./../../build/server/mongoDriver.js'),
	serverConfig = require('./../../build/server/config.js');

// Configuration for the protractor
var config = {

	baseUrl: 'http://localhost:3000',

	capabilities: {},

	framework: 'mocha',

	/** Drop test database so we can run tests on clean DB */
	beforeLaunch: function() {
		var deferred = q.defer();
		async.series([
			function initMongo(cb) {
				mongoDriver.init(serverConfig.mongoDbURI, cb);
			},
			function dropDatabase(cb) {
				mongoDriver.getDb().dropDatabase(cb);
			},
			function closeConnection(cb) {
				mongoDriver.close();
				return cb();
			}
		], function(err) {
			return err ? deferred.reject(err) : deferred.resolve();
		});
		return deferred.promise;
	}

};

if (process.env.TRAVIS) {
	config.sauceUser = process.env.SAUCE_USERNAME;
	config.sauceKey = process.env.SAUCE_ACCESS_KEY;
	config.capabilities['tunnel-identifier'] = process.env.TRAVIS_JOB_NUMBER;
	config.capabilities.build = process.env.TRAVIS_BUILD_NUMBER;
}

module.exports = config;
