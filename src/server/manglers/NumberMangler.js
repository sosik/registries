(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/NumberMangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');

	function NumberMangler() {
	}

	NumberMangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {
		log.silly('NumberMangler mangler start for %s', objPath);

		
		if (!objFragment || !schemaFragment || !schemaFragment[consts.TYPE_KEYWORD] || schemaFragment[consts.TYPE_KEYWORD]!=consts.TYPE_NUMBER ) {
			callback(null, null);
			return;
		}

			log.silly('Nothing to mangle', objFragment,schemaFragment );

			objFragment=''+objFragment;
			objFragment=objFragment.replace(' ','');
			objFragment=objFragment.replace(',','.');

			if (isNaN(objFragment)) {
				log.error(objFragment,'This is not number');
				callback(null, 'This is not number');
				objectTools.remove(ctx.o,objPath);
				return;
			}
			callback();
			objectTools.setValue(ctx.o,objPath,Number(objFragment));
			log.debug('ObjectCleanerMangler mangling finished for %s',  objPath);

	};


	module.exports = function( ) {
		return new NumberMangler();
	};
}());


