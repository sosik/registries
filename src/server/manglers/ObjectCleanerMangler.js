(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/ObjectCleanerMangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');

	/**
	* ObjectCleaner does:
	*	- cleans object parts that  re not present in  schmema
	*	- for empty stirings sets value to  null
	*/
	function ObjectCleanerMangler() {
	}

	ObjectCleanerMangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {
		log.silly('ObjectCleanerMangler mangler start for %s', objPath);

		if (objPath){
			 var value=objectTools.evalPath(ctx.o,objPath);
			if (value!==null){
				if ('' ===value || (typeof value =='object' && (!Object.keys(value).length || value.oid ==='')) ) {
					objectTools.setValue(ctx.o,objPath,null);
				}
			}
		}

		if (!objFragment|| 'id'===objPath || objFragment && schemaFragment && !schemaFragment[consts.SEQUENCE]) {
			callback(null, null);
			return;
		}

		log.debug('ObjectCleanerMangler removing  %s',  objPath);
		objectTools.remove(ctx.o,objPath);
		callback();
		log.debug('ObjectCleanerMangler mangling finished for %s',  objPath);

	};


	module.exports = function( ) {
		return new ObjectCleanerMangler();
	};
}());
