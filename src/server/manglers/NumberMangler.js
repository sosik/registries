(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/NumberMangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');

	function NumberMangler() {
	}

	NumberMangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {


		if (!objFragment || !schemaFragment || !schemaFragment[consts.TYPE_KEYWORD] || schemaFragment[consts.TYPE_KEYWORD]!=consts.TYPE_NUMBER ) {
			callback(null, null);
			log.silly('Nothing to mangle', objFragment,schemaFragment );
			return;
		}

		log.silly('NumberMangler mangler start for %s', objPath);

		objFragment=''+objFragment;
		objFragment=objFragment.replace(' ','');
		objFragment=objFragment.replace(',','.');

		if (isNaN(objFragment)) {
			log.error(objFragment,'This is not number');
			callback(null,{f:objPath,c:'validation.field.not.number',d:objFragment});
			return;
		}
		callback();
		objectTools.setValue(ctx.o,objPath,Number(objFragment));
		log.debug('NumberMangler mangling finished for %s',  objPath);

	};


	module.exports = function( ) {
		return new NumberMangler();
	};
}());
