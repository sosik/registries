// Configuration for the protractor
var config = require('./protractor.conf');

config.suites = [
	'../smoke/**/*.spec.js'
];

if (process.env.TRAVIS) {
	config.capabilities.name = "[" + process.env.TRAVIS_REPO_SLUG + "#" + process.env.TRAVIS_BRANCH + "] [smoke] Build " + process.env.TRAVIS_BUILD_NUMBER
}

module.exports = config;
