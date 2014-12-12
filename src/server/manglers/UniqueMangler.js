(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/UniqueMangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');
	var universalDaoModule = require(process.cwd() + '/build/server/UniversalDao.js');
	var QueryFilter = require(process.cwd() + '/build/server/QueryFilter.js');

	function UniqueMangler(mongoDriver) {
		this.mongoDriver=mongoDriver;
	}

	UniqueMangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {

		if (!schemaFragment || !schemaFragment[consts.UNIQUE]) {
			callback(null, null);
			return;
		}

		log.silly('SequenceMangler mangler start for %s', objPath);

		var seqName=schemaFragment[consts.UNIQUE];

		var _dao = new universalDaoModule.UniversalDao(
			this.mongoDriver,
			{collectionName: ctx.s.table}
		);

		var qf=QueryFilter.create();

		var id=objectTools.getValue(ctx.o,"id");
		qf.addCriterium(objPath+(schemaFragment[consts.COLLATE]?'.v':''),QueryFilter.operation.EQUAL,objFragment);
		qf.addCriterium('_id',QueryFilter.operation.NOT_EQUAL,id);

		_dao.list(qf, function(err, data){
			if (err) {
				throw err;
			}

			if (data.length>0){
				callback(null,{f:objPath,c:'validation.field.not.unique',d:objFragment});
			} else {
				callback(null,null);
			}
		});



		log.debug('SequenceMangler mangling finished for %s',  objPath);
	};

	module.exports = function(mongoDriver) {
		return new UniqueMangler( mongoDriver);
	};
}());
