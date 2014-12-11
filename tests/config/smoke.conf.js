// Configuration for the protractor
var config = require('./protractor.conf');

config.suites = [
	'../smoke/**/*.spec.js'
];

if (process.env.TRAVIS) {
	config.capabilities.name = "[sosik/registries] [smoke] Registries build " + process.env.TRAVIS_BUILD_NUMBER
}

module.exports = config;
