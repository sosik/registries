// Configuration for the protractor
var config = {

	baseUrl: 'http://localhost:3000',

	capabilities: {},

	framework: 'mocha'

};

if (process.env.TRAVIS) {
	config.sauceUser = process.env.SAUCE_USERNAME;
	config.sauceKey = process.env.SAUCE_ACCESS_KEY;
	config.capabilities['tunnel-identifier'] = process.env.TRAVIS_JOB_NUMBER;
	config.capabilities.build = process.env.TRAVIS_BUILD_NUMBER;
}

module.exports = config;
