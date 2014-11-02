(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/GenerateVsMangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');
	var dateUtils = require(process.cwd()+'/build/server/DateUtils.js').DateUtils;

	function GenerateVsMangler(mongoDriver) {
		this.mongoDriver=mongoDriver;
	}


	function createVS(createdOnReverse, index){
		var i=''+index;
		while (i.length<6){
			i='0'+i;
		}

		return createdOnReverse.substring(2,6)+i;
	}
	GenerateVsMangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {

		if (!schemaFragment || !schemaFragment[consts.VARIABLE_SYMBOL]) {
			log.silly('Nothing to mangle');
			callback(null, null);
			return;
		}

		log.silly('GenerateVsMangler mangler start for %s', objPath);

		if (!objectTools.evalPath(ctx.o,objPath)){

			this.mongoDriver.nextSequence('feeIndex',function(err,data){
				if (err) {
					callback(err);
					return;
				}
				var reversNow=dateUtils.nowToReverse();
				objectTools.setValue(ctx.o,objPath,createVS(reversNow,data.seq));
				callback();
			});
		}else {
			setTimeout(function(){callback();},0);
		}

		log.debug('GenerateVsMangler mangling finished for %s',  objPath);
	};

	module.exports = function() {
		return new GenerateVsMangler();
	};

	module.exports = function(mongoDriver) {
		return new GenerateVsMangler(mongoDriver);
	};
}());
