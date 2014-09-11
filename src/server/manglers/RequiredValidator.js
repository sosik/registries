(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/RequiredValidator.js');

	function RequiredValidationError(path) {
		this.messsage = 'Serverside property required validation failed';
		this.transCode = 'srv.validation.required';
		this.path = path || '';
	}


	function RequiredValidator() {
	}

	RequiredValidator.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {
		log.silly('Required validation start for %s', objPath);
		var localErrors = [];

		if (!schemaFragment) {
			log.silly('Nothing to validate');
			callback(null, null);
			return;
		}

		if (!schemaFragment[consts.REQUIRED_KEYWORD]) {
			log.silly('Nothing to validate');
			callback(null, null);
			return;
		}

		if (!objFragment) {
			log.debug('Required validation failed for %s',  objPath);
			callback(null, [new RequiredValidationError(objPath)]);
			return;
		}

		log.debug('Required validation passed for %s',  objPath);
		callback(null, []);
	};

	module.exports = function() {
		return new RequiredValidator();
	};
}());

