// Configuration for the protractor
var config = require('./e2e.conf');

config.capabilities.browserName = 'firefox';
config.capabilities.name += " - firefox";

exports.config = config;
