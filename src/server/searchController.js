'use strict';

var extend = require('extend');
var log = require('./logging.js').getLogger('SearchController.js');
var safeUrlEncoder = require('./safeUrlEncoder.js');

var securityServiceModule = require('./securityService.js');
var securityService= new securityServiceModule.SecurityService();

var universalDaoModule = require('./UniversalDao.js');
var DEFAULT_CFG = {
		
};


var SearchController = function(mongoDriver,schemaRegistry, options) {

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

		
		var schema = schemaRegistry.getSchema(safeUrlEncoder.decode(req.params.schema));
		var dao = new universalDaoModule.UniversalDao(mongoDriver, {
			collectionName: schema.compiled.table
		});
		
		
		var compiledSchema = schema.compiled;

		if (!compiledSchema) {
			log.error('schema %s is not compiled', schema);
			throw 'Schema is not compiled';
		}
		

		if (!securityService.hasRightForAction(compiledSchema,securityServiceModule.actions.READ,req.perm)){
		
			log.warn('user has not rights to search in schema',schema);
		
			resp.send(403,securityService.missingPermissionMessage(securityService.requiredPermissions(compiledSchema,securityServiceModule.actions.READ)));
			return;
		} 

		dao.list({
			crits : req.body.criteria,
			sorts: req.body.sortBy,
			limit: req.body.limit,
			skip: req.body.skip
		}, function(err, data) {
			if (err) {
				resp.send(500, err);
			} else {
				log.verbose('search',data);
				resp.send(200, data);
			}
		});

	};

};

module.exports = {
	SearchController : SearchController
};
