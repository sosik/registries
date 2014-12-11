// Configuration for the protractor
var config = require('./smoke.conf');

config.capabilities.browserName = 'firefox';
config.capabilities.name += " - firefox";

exports.config = config;
