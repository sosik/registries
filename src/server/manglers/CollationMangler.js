(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/CollationMangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');
	var collate = require(process.cwd() + '/build/server/sortingValuesMaker.js');

	var bson = require('mongodb').BSONPure;
	// var bson = require('mongodb');

	function CollationMangler(mongoDriver) {
		this.mongoDriver=mongoDriver;
	}

	CollationMangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {

		if (!schemaFragment || !schemaFragment[consts.COLLATE]) {
			callback(null, null);
			return;
		}

		// var collationName=schemaFragment[consts.COLLATE];

		log.silly('CollationMangler mangler start for %s', objPath);

		var value=objectTools.getValue(ctx.o,objPath);

		if (value){
			var collated=collate.getCollationKey(value);
			// log.error(value,collated);
			var buff=new Buffer(64);
			buff.fill(0);
			var off=0;
			collated.map(function(pos){
				buff.writeUInt16BE(pos,off);
				off+=2;
			});
			objectTools.setValue(ctx.o,objPath,{v:value,c:new bson.Binary( buff,'Binary')});
		}

		callback();

	};

	module.exports = function() {
		return new CollationMangler();
	};

	module.exports = function(daoFactory, mongoDriver) {
		return new CollationMangler(daoFactory, mongoDriver);
	};
}());
