(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/ObjectCleanerUnmangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');

	function ObjectCleaner() {
	}

	ObjectCleaner.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {
		log.silly('ObjectCleanerUnmangler mangler start for %s', objPath);

		if (!objFragment|| 'id'===objPath || objFragment && schemaFragment) {
			callback(null, null);
			return;
		}

		objectTools.remove(ctx.o,objPath);
		callback();
		log.debug('ObjectCleanerUnmangler mangling finished for %s',  objPath);

	};


	module.exports = function( ) {
		return new ObjectCleaner();
	};
}());
