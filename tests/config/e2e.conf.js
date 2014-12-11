// Configuration for the protractor
var config = require('./protractor.conf');

config.suites = [
	'../e2e/**/*.spec.js'
];

if (process.env.TRAVIS) {
	config.capabilities.name = "[sosik/registries] [e2e] Registries build " + process.env.TRAVIS_BUILD_NUMBER
}

module.exports = config;
