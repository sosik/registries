'use strict';

var log = require('./logging.js').getLogger('loginController.js');
var extend = require('extend');
var safeUrlEncoder = require('./safeUrlEncoder.js');

var universalDaoModule = require('./UniversalDao.js');
var DEFAULT_CFG = {
		
};


var SearchController = function(mongoDriver,schemaRegistry, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);


	var collectPropertyPaths = function(schemaFragment, path, properties) {

		for ( var prop in sschemaFragment) {
			switch (prop) {
			case '$schema':
			case 'id':
			case 'type':
			case '$ref':
				// skip schema keywords;
				break;
			default:
				var propLocalPath = null;
				var propUrl = null;

				if (schema.def[prop].id) {
					// id is defined, lets override canonical resolution
					propUrl = URL.resolve(uri, schema.def[prop].id);
					// make id argument absolute
					schema.def[prop].id = propUrl;
					propLocalPath = URL.parse(propUrl).hash;
					propLocalPath = (propLocalPath && propLocalPath.length > 0 ? propLocalPath : "#");
				} else {
					propLocalPath = localPath + (localPath === "#" ? '' : '/') + prop;
					propUrl = URL.resolve(uri, propLocalPath);
				}

				if ('object' === typeof schema.def[prop]) {
					// dive only if it is object
					that.registerSchema(propUrl, schema.def[prop], true);
					parseInternal(propUrl, that.getSchema(propUrl), propLocalPath);
				}
			}
		}

	}

	this.getSearchDef = function(req, res) {
		
		
		var entity=req.body.entity;
		var schemaUri=DEFAULT_CFG.entityToNs[entity];
		
		console.log(entity,schemaUri);
		var schema = schemaRegistry.getSchema(schemaUri);
		var retval = {};

		function collectProperties(pathPrefix, objectDef, resultArr) {
			for ( var pr in objectDef.properties) {
				if (objectDef.properties[pr].type === 'object') {
					collectProperties(pr + '.', objectDef.properties[pr], resultArr)
				} else {
					resultArr.push({
					    path : pathPrefix + pr,
					    type : objectDef.properties[pr].type,
					    title : objectDef.properties[pr].title
					});
				}
			}

		}

		retval.schema = schemaUri;
		retval.attributes = [];
		retval.operators = [ {
		    title : '=',
		    value : 'eq'
		}, {
		    title : '>',
		    value : 'gt'
		}, {
		    title : '<',
		    value : 'lt'
		}, {
		    title : '!=',
		    value : 'neq'
		}, {
		    title : 'starts',
		    value : 'starts'
		}, {
		    title : 'exists',
		    value : 'ex'
		} ];

		collectProperties('', schema.compiled, retval.attributes);

		res.send(200, retval);

	};

	this.search = function(req, resp) {

		
		var schema = schemaRegistry.getSchema(safeUrlEncoder.decode(req.params.schema));
		var dao = new universalDaoModule.UniversalDao(mongoDriver, {
			collectionName : schema.compiled.table
		});

		log.verbose('search using criteria',schema.compiled.table, req.body.criteria );
		dao.list({
			crits : req.body.criteria,
			sorts: req.body.sortBy,
			limit: req.body.limit,
			skip: req.body.skip
		}, function(err, data) {
			if (err) {
				resp.send(500, err);
			} else {
				resp.send(200, data)
			}
		});

	}

};

module.exports = {
	SearchController : SearchController
}
