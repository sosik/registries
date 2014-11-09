(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/ObjectCleaner.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');

	function ObjectCleaner() {
	}

	ObjectCleaner.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {
		log.silly('ObjectCleanerMangler mangler start for %s', objPath);

		if (!objFragment|| 'id'===objPath || objFragment && schemaFragment) {
			callback(null, null);
			return;
		}

		objectTools.remove(ctx.o,objPath);
		callback();
		log.debug('ObjectCleanerMangler mangling finished for %s',  objPath);

	};


	module.exports = function( ) {
		return new ObjectCleaner();
	};
}());
