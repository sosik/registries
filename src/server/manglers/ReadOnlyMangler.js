(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/ReadOnlyMangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');

	/**
	* ObjectCleaner does:
	*	- cleans object parts that  re not present in  schmema
	*	- for empty stirings sets value to  null
	*/
	function ReadOnlyMangler() {
	}

	ReadOnlyMangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {
		log.silly('ReadOnlyMangler mangler start for %s', objPath);

		if (!schemaFragment || !schemaFragment[consts.READ_ONLY]) {
			callback(null, null);
			return;
		}

		log.debug('ReadOnlyMangler removing  %s',  objPath);
		objectTools.remove(ctx.o,objPath);
		callback();
		log.debug('ReadOnlyMangler mangling finished for %s',  objPath);

	};


	module.exports = function( ) {
		return new ReadOnlyMangler();
	};
}());
