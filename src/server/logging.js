'use strict';

var config = require('./config.js');

var winston = require('winston');
var extend = require('extend');

var defaultCfg = config.logging.cfg;

var enrichCfg = function(cfg, label) {
	var result = extend(true, {}, cfg.cfg);

	if (cfg.addLabel) {
		for (var transport in result) {
			result[transport] = extend(true, result[transport], {label:label})
		}
	}

	return result;
}
winston.loggers.add('DEFAULT', enrichCfg(config.logging, 'DEFAULT'));

module.exports = {
	getLogger: function(loggerName) {
		var _loggerName = loggerName || 'DEFAULT';

		if (winston.loggers.has(_loggerName)) {
			return winston.loggers.get(_loggerName);
		}

		winston.loggers.add(_loggerName, enrichCfg(config.logging, _loggerName));
		return winston.loggers.get(_loggerName);
	}
};
