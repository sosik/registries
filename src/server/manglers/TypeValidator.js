(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/TypeValidator.js');

	function TypeValidationError(path) {
		this.messsage = 'Serverside property type validation failed';
		this.transCode = 'srv.validation.type';
		this.path = path || '';
	}


	function TypeValidator() {
	}

	TypeValidator.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {
		log.silly('Type validation start for %s', objPath);
		var localErrors = [];

		if (!objFragment || !schemaFragment) {
			callback(null, null);
			return;
		}

		if (schemaFragment[consts.TYPE_KEYWORD]) {
			if (schemaFragment[consts.TYPE_KEYWORD] === 'array') {
				if (!Array.isArray(objFragment)) {
					log.debug('Type validation failed for %s, expected array but its not arrat',  objPath);
					callback(null, [new TypeValidationError(objPath)]);
					return;
				}
			} else {
				if (typeof objFragment !== schemaFragment[consts.TYPE_KEYWORD]) {
					log.debug('Type validation failed for %s, found %s, expected %s',  objPath, typeof objFragment, schemaFragment[consts.TYPE_KEYWORD]);
					callback(null, [new TypeValidationError(objPath)]);
					return;
				}
			}
		}

		log.debug('Type validation passed for %s',  objPath);
		callback(null, []);
	};

	module.exports = function() {
		return new TypeValidator();
	};
}());
