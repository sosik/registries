'use strict';

var async = require('async');
var extend = require('extend');
var log = require('./logging.js').getLogger('SearchController.js');
var safeUrlEncoder = require('./safeUrlEncoder.js');

var securityServiceModule = require('./securityService.js');
var securityService= new securityServiceModule.SecurityService();
var QueryFilter = require('./QueryFilter.js');

var universalDaoModule = require('./UniversalDao.js');
var DEFAULT_CFG = {
		
};


var SearchController = function(mongoDriver,schemaRegistry, options) {

	var listObjectMangler = require('./ObjectMangler.js').create([
			require('./manglers/ObjectLinkUnmangler.js')(function(mongoDriver, options) {
				return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver)
	]);

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	this.getSearchDef = function(req, res) {
		
		
		var entity=req.body.entity;
		var schemaUri=DEFAULT_CFG.entityToNs[entity];
		
		log.verbose('getSearchDef',entity,schemaUri);
		var schema = schemaRegistry.getSchema(schemaUri);
		var retval = {};

		function collectProperties(pathPrefix, objectDef, resultArr) {
			for ( var pr in objectDef.properties) {
				if (objectDef.properties[pr].type === 'object') {
					collectProperties(pr + '.', objectDef.properties[pr], resultArr);
				} else {
					resultArr.push({
						path: pathPrefix + pr,
						type: objectDef.properties[pr].type,
						title: objectDef.properties[pr].title
					});
				}
			}

		}

		retval.schema = schemaUri;
		retval.attributes = [];
		retval.operators = [ {
		    title: '=',
		    value: 'eq'
		}, {
		    title: '>',
		    value: 'gt'
		}, {
			title: '<',
			value: 'lt'
		}, {
			title: '!=',
			value: 'neq'
		}, {
			title: 'starts',
			value: 'starts'
		}, {
			title: 'exists',
			value: 'ex'
		} ];

		collectProperties('', schema.compiled, retval.attributes);
		log.verbose('getSearchDef',retval);
		res.send(200, retval);

	};

	this.search = function(req, resp) {

		
		log.silly('searching for', req.params);
		var schemaName=safeUrlEncoder.decode(req.params.schema)
		var schema = schemaRegistry.getSchema(schemaName);
		var dao = new universalDaoModule.UniversalDao(mongoDriver, {
			collectionName: schema.compiled.table
		});
		
		
		var compiledSchema = schema.compiled;

		if (!compiledSchema) {
			log.error('schema %s is not compiled', schemaName);
			throw 'Schema is not compiled';
		}
		

		if (!securityService.hasRightForAction(compiledSchema,securityServiceModule.actions.READ,req.perm)){
		
			log.warn('user has not rights to search in schema',schemaName);
		
			resp.send(403,securityService.missingPermissionMessage(securityService.requiredPermissions(compiledSchema,securityServiceModule.actions.READ)));
			return;
		} 

		var crits=req.body;
		console.log(crits);
		//remap to QueryFiter
		var qf=QueryFilter.create();
		if('sortBy' in crits && crits.sortBy){
			qf.addSort(crits.sortBy[0].f,crits.sortBy[0].o);
		} 
		if ('limit' in crits){ 
			qf.setLimit(crits.limit);
		}
		if ('skip' in crits){
			qf.setSkip(crits.skip)
		}
		for(var c in crits.criteria){
			console.log(c);
			qf.addCriterium(crits.criteria[c].f,crits.criteria[c].op,crits.criteria[c].v);
		}


		if (req.profile){
				qf=securityService.applyProfileCrits(req.profile,schemaName,qf);
		}

		console.log('used crits', crits);
		dao.list(qf, function(err, data) {
			if (err) {
				resp.send(500, err);
			} else {
				if (data) {
					var mangFuncs = [];
					for (var i = 0; i < data.length; i++) {
						mangFuncs.push((function(j) {
							return function(callback) {
								listObjectMangler.mangle(data[j], compiledSchema, function(err, cb) {
									callback(err, cb);
								});
							};
						}(i)));
					}

					async.parallel(mangFuncs, function(err, cb) {
						if (err) {
							resp.send(500, err);
						}
					
						resp.send(200, data);
					});
				} else {
					resp.send(200, data);
				}
			}
		});

	};

};

module.exports = {
	SearchController : SearchController
};
