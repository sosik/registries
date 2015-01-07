(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/CollationUnmangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');

	function CollationUnmangler() {
	}

	CollationUnmangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {

		if (!schemaFragment || !schemaFragment[consts.COLLATE]) {
			callback(null, null);
			return;
		}

		log.silly('ObjectCleanerMangler mangler start for %s', objPath);

		var value=objectTools.getValue(ctx.o,objPath);

		if (value){
			if (value.v) {
				objectTools.setValue(ctx.o,objPath,value.v);
			}
		}

		//objectTools.remove(ctx.o,objPath+"X");

		callback();
		log.debug('CollationUnmangler mangling finished for %s',  objPath);

	};


	module.exports = function( ) {
		return new CollationUnmangler();
	};
}());
