(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/NextMangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');

	/**
	 * sets nexthigher value for/from specified entity path
	*/
	function NextMangler(mongoDriver) {
		this.mongoDriver=mongoDriver;
	}

	NextMangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {

		if (!schemaFragment || !schemaFragment[consts.SEQUENCE_NEXT]) {
			callback(null, null);
			return;
		}

		log.silly('NextMangler mangler start for %s', objPath);

		this.mongoDriver.max(ctx.s.table,objPath,function(err,entity){
			if (err) {
				callback(err);
				return;
			}

			var nextVal=objectTools.evalPath(entity,objPath);
			if (!nextVal){
				nextVal=0;
			}
			nextVal++;
			objectTools.setValue(ctx.o,objPath,nextVal);
			
			callback();
		});
		
		log.debug('SequenceMangler mangling finished for %s',  objPath);		
	};

	module.exports = function( mongoDriver) {
		return new NextMangler( mongoDriver);
	};
}());


