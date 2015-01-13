'use strict';

var extend = require('extend');

var log = require('./logging.js').getLogger('SecurityService.js');

var QueryFilter = require('./QueryFilter.js');

var DEFAULT_CFG = {};

var actions = {
		READ : 'read',
		MODIFY : 'modify',
		CREATE : 'create'
};

var SecurityService = function(mongoDriver, schemaRegistry, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	this.hasRightForAction = function(schema, action, avaliablePerm) {

		log.verbose('checking permision on schema:action',schema,action);

		var missingPerm=null;
		if ('security' in schema) {
			if (action in schema['security']) {
				if ('_static' in schema['security'][action]) {
					var requiredPerms = schema['security'][action]['static'];
					 requiredPerms.map(function(required) {
						if ( !(required in avaliablePerm)  ||  !(avaliablePerm[required]) ){
							missingPerm=required;
						}
					});
				}
			}else {
				log.verbose('schema does not have section for action', schema.id, action);
			}

		} else {
			log.verbose('schema has no security section', schema.id);
		}

		if (missingPerm){
			log.silly('missing perm',missingPerm);
		}
		return missingPerm===null;

	};


	this.requiredPermissions = function(schema, action) {
		return schema['security'][action]['static'].join(' ');
	};


/**
 * Method verifies if current user (req.perm) contains required permission
 */
	this.userHasPermissions = function (req,perm) {

		log.verbose('check user has perm ', perm);

		if (!req.perm || (perm && hasPermission(req.perm,perm))){
			return true;
		}
		return false;
	};

	this.missingPermissionMessage=function(perm){
		return {missingPerm:perm};
	};

	function hasPermission(coll, perm) {

		for(var per in coll){
			if (coll[per]  &&  per===perm) {
				return true;
			}
		}
		return false;
	}

	this.authenRequired= function (req,res,next){
		if (!req.authenticated ) {
			res.sendStatus(401);
		}else {
			next();
		}
	};

	/**
		method merges profile criteria to specified qf
	*/
	this.applyProfileCrits=function(profile,schemaName,qf){

		// query=QueryFilter.create().addCriterium(cfg.loginColumnName, QueryFilter.operation.EQUAL, req.loginName)
		if ( profile.security && profile.security.forcedCriteria ){
			var schemaCrit=getSchemaCrit(profile.security.forcedCriteria,schemaName);
			if (schemaCrit){
				schemaCrit.criteria.map(function(c){
				qf.addCriterium(c.f,c.op,c.v);
				});
			}
		}
		return qf;
	};

	function getSchemaCrit (forced,schema){
		var found= null;

		forced.map(function(f){
			if (f.applySchema==schema){
				found = f;
			}
		});


		return found;
	}


		/**
		method merges schema forced criteria to specified qf
	*/
	this.applySchemaForcedCrits=function(schema,qf){

		// query=QueryFilter.create().addCriterium(cfg.loginColumnName, QueryFilter.operation.EQUAL, req.loginName)
		if ('forcedCriteria' in schema ){
			schema.forcedCriteria.map(function(item){
				qf.addCriterium(item.f,item.op,item.v);
			});
		}
		return qf;
	};

	this.hasPermFilter= function (perm){
		var t=this;
		var f= function (perm){
				var xperm=perm;
				this.check=function(req,res,next){
					 log.verbose('checking for perm',xperm);
						if (!req.authenticated ) {
							res.sendStatus(401);
						}else
							if (!hasPermission(req.perm,xperm)) {
								res.status(403).send(t.missingPermissionMessage(xperm));
							}
							else {
								next();
							}

					};

				};
			log.verbose('created checker for perm',perm);
		return new f(perm);
	};

};

module.exports = {
		actions : actions,
		SecurityService : SecurityService
};
