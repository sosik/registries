(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/TimestampMangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');

	function TimestampMangler() {
	}

	TimestampMangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {

		if (!schemaFragment || !schemaFragment[consts.TIMESTAMP]) {
			callback(null, null);
			return;
		}

		log.silly('TimestampMangler mangler start for %s', objPath);

		objectTools.setValue(ctx.o,objPath,new Date().getTime());
		callback();

		log.debug('TimestampMangler mangling finished for %s',  objPath);
	};


	module.exports = function( ) {
		return new TimestampMangler();
	};
}());
