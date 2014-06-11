'use strict';

var log = require('./logging.js').getLogger('loginController.js');
var extend = require('extend');

var universalDaoModule = require('./UniversalDao.js');

var DEFAULT_CFG = {};

var schemaRegistryModule = require('./schemaRegistry.js');

var SearchController = function(mongoDriver, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	var schemaRegistryCtrl = new schemaRegistryModule.SchemaRegistry();

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

		var schema = schemaRegistryCtrl.getSchema('uri://registries/person');
		var retval = {};

		retval.prop = [];
		retval.schema = schema;
		for ( var prop in schema) {
			retval.prop.push(prop);
		}

		res.send(200, retval);

	};

	this.search = function(crit) {

	}

};

module.exports = {
	SearchController : SearchController
}