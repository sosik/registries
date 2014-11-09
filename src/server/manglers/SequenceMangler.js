(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/SequenceMangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');

	function SequenceMangler(mongoDriver) {
		this.mongoDriver=mongoDriver;
	}

	SequenceMangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {

		if (!schemaFragment || !schemaFragment[consts.SEQUENCE]) {
			callback(null, null);
			return;
		}

		log.silly('SequenceMangler mangler start for %s', objPath);

		var seqName=schemaFragment[consts.SEQUENCE];

		this.mongoDriver.nextSequence(seqName,function(err,data){
			if (err) {
				callback(err);
				return;
			}
			objectTools.setValue(ctx.o,objPath,data.seq);
			callback();
		});

		log.debug('SequenceMangler mangling finished for %s',  objPath);
	};

	module.exports = function() {
		return new SequenceMangler();
	};

	module.exports = function(daoFactory, mongoDriver) {
		return new SequenceMangler(daoFactory, mongoDriver);
	};
}());
