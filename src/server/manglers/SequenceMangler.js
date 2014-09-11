(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/SequenceMangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');

	function SequenceMangler(mongoDriver) {
		this.mongoDriver=mongoDriver;
	}

	SequenceMangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {
		log.silly('ObjectLink mangler start for %s', objPath);
		var prop;

		

		if (!schemaFragment || !schemaFragment[consts.SEQUENCE]) {
			log.silly('Nothing to mangle');
			callback(null, null);
			return;
		}

		var seqName=schemaFragment[consts.SEQUENCE];

		this.mongoDriver.nextSequence(seqName,function(err,data){
			if (err) {
				callback(err);
				return;
			}
			objectTools.setValue(ctx.o,objPath.substring(1+consts.ROOT_KEYWORD.lenth),data.seq);
			callback();
		});
		
		log.debug('ObjectLink mangling finished for %s',  objPath);		
	};

	module.exports = function() {
		return new ObjectLinkMangler();
	};

	module.exports = function(daoFactory, mongoDriver) {
		return new SequenceMangler(daoFactory, mongoDriver);
	};
}());


