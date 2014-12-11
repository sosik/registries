// Configuration for the protractor
var config = require('./smoke.conf');

config.capabilities.browserName = 'chrome';
config.capabilities.name += " - chrome";

exports.config = config;
