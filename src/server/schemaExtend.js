'use strict';

var log = require('./logging.js').getLogger('schemaExtend.js');
var extend = require('extend');

/**
	Schema object extends function
	@class SchemaExtend
	@module server
	@submodule utils


*/
function SchemaExtend () {
	var self=this;

	this.extend = function (toExtend,extendBy){
		var retval={};
		Object.getOwnPropertyNames(toExtend).map(function(prop){
			retval[prop]= toExtend[prop];
		});

		Object.getOwnPropertyNames(extendBy).map(function(prop){
				var value=extendBy[prop];
				switch(typeof value){

					case 'object':
						var v1=toExtend[prop];
						if (value && typeof v1 == 'object' && !Array.isArray(value)){
							retval[prop]= self.extend( v1 , value);
						}else{
							retval[prop]=value;
						}
					break;
					default:
						retval[prop]=value;
						break;

				}
		});
		return retval;
	};
}

module.exports = {
	SchemaExtend : new SchemaExtend()
	// ,test: new SchemaExtend().extend({a:"a",b:"change",c:{c:"change",e:"e"},array:['change'],nullable:{}},{b:"new",c:{a:"new",c:"new",d:"new"},array:[''],nullable:null})

};
