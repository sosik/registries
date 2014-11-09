(function() {
	'use strict';

	var consts = require('./../SchemaConstants.js');
	var log = require('./../logging.js').getLogger('manglers/TimestampUnmangler.js');
	var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');

	function TimestampUnmangler() {
	}

	TimestampUnmangler.prototype.mangle = function(ctx,objFragment, schemaFragment, objPath, callback) {

		if (!objFragment||!schemaFragment || !schemaFragment[consts.TIMESTAMP]) {
			callback(null, null);
			return;
		}

			log.silly('TimestampUnmangler mangler start for %s', objPath);
			var d= new Date(objFragment);
			var strDate=''.concat(d.getDate(), '.', d.getMonth() + 1, '.' + d.getFullYear(), ' ', d.getHours(), ':',
				(''.concat(d.getMinutes()).length === 1 ? '0'+d.getMinutes():d.getMinutes()), ':',
				(''.concat(d.getSeconds()).length === 1 ? '0'+d.getSeconds() : d.getSeconds()));

		objectTools.setValue(ctx.o,objPath,strDate);
		callback();

		log.debug('TimestampUnmangler mangling finished for %s',  objPath);
	};


	module.exports = function() {
		return new TimestampUnmangler();
	};
}());
