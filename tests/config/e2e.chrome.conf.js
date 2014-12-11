// Configuration for the protractor
var config = require('./e2e.conf');

config.capabilities.browserName = 'chrome';
config.capabilities.name += " - chrome";

exports.config = config;
