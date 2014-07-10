'use strict';

var extend = require('extend');
var crypto = require("crypto");
var uuid = require('node-uuid');
var nodemailer = require("nodemailer");

var log = require('./logging.js').getLogger('SecurityService.js');
var QueryFilter = require('./QueryFilter.js');
var universalDaoModule = require('./UniversalDao.js');

var DEFAULT_CFG = {};

var transport = nodemailer.createTransport("Sendmail");

var SchemaToolsModule = require('./SchemaTools.js');

var fs = require('fs');

var actions = {
    READ : '_read',
    MODIFY : '_modify',
    CREATE : '_create'
};

var SecurityService = function(mongoDriver, schemaRegistry, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	this.hasRightForAction = function(schema, action, avaliablePerm) {

		var missingPerm=null
		if ('_security' in schema) {
			if (action in schema['_security']) {
				if ('_static' in schema['_security'][action]) {
					var requiredPerms = schema['_security'][action]['_static'];
					 requiredPerms.map(function(required) {
						if ( !(required in avaliablePerm)  ||  !(avaliablePerm[required]) ){
							missingPerm=required;
						}	
					});
				}
			}

		} else {
			log.silly('schema has no security section', schema.id);
		}

		log.silly('missing perm',missingPerm);
		return missingPerm===null;

	}
/**
 * Method verifies if current user (req.perm) contains required permission
 */
	this.userHasPermissions = function (req,perm) { 
		if (!req.perm || (perm && hasPermission(req.perm,perm))){
			return true;
		}
		return false;
	}
	
	this.missingPermissionMessage=function(perm){
		return {translationCode:'security.user.missing.permissions',translationData:perm, time:3000};
	}

	function hasPermission(coll, perm) {
		
		for(var per in coll){
			if (coll[per]  &&  per===perm) {
				return true;
			}
		}
		return false;
	}
};




module.exports = {
    actions : actions,
    SecurityService : SecurityService
}