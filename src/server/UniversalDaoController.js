var log = require('./logging.js').getLogger('UniversalDaoController.js');
var universalDaoModule = require(process.cwd() + '/build/server/UniversalDao.js');
var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');
var safeUrlEncoder = require('./safeUrlEncoder.js');

var UniversalDaoController = function(mongoDriver, schemaRegistry) {

	this.save = function(req, res) {
		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: req.params.table}
		);

		log.verbose("data to save", req.body);

		var obj = req.body;
		_dao.save(obj, function(err, data){
			if (err) {
				throw err;
			}

			res.json(data);
		});
	};

	this.get = function(req, res) {
		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: req.params.table}
		);

		log.verbose(req.params);
		_dao.get(req.params.id, function(err, data){
			if (err) {
				throw err;
			}

			res.json(data);
		});
	};

	this.getBySchema = function(req, res) {
		log.verbose(req.params);

		var schemaName = safeUrlEncoder.decode(req.params.schema);
		
		if (!schemaRegistry) {
			log.error('missing schemaRegistry');
			throw 'This method requires schemaRegistry';
		}

		var schema = schemaRegistry.getSchema(schemaName);

		if (!schema) {
			log.error('schema %s not found', schemaName);
			throw 'Schema not found';
		}

		var compiledSchema = schema.compiled;

		log.silly(compiledSchema);

		if (!compiledSchema) {
			log.error('schema %s is not compiled', schemaName);
			throw 'Schema is not compiled';
		}
		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: compiledSchema.table}
		);

		_dao.get(req.params.id, function(err, data){
			if (err) {
				throw err;
			}

			var iterator = function(registry, oid, fields, callback) {
				log.silly('Resolving objectlink %s, %s', registry, oid, fields);
				var localDao = new universalDaoModule.UniversalDao(
					mongoDriver,
					{collectionName: registry}
				);

				localDao.get(oid, function(err, r) {
					if (err) {
						callback(err);
					}

					var result = {};
					for (var i in fields) {
						result[fields[i]] = objectTools.evalPath(r, fields[i]);
					}

					callback(null, result);
				});
			}

			objectTools.resolveObjectLinks(compiledSchema, data, iterator, function(err, resolvedData) {
				if (err) {
					throw err;
				}

				log.silly("ObjectLink resolved as", resolvedData);
				res.json(resolvedData);
			});
		});
	};

	this.list = function(req, res) {
		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: req.params.table}
		);

		_dao.list({}, function(err, data){
			if (err) {
				throw err;
			}

			res.json(data);
		});
	};

	this.search = function(req, res) {
		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: req.params.table}
		);
		
		log.silly('Search params ', req.body);
		_dao.list({
			crits : req.body.criteria
		}, function(err, data){
			if (err) {
				throw err;
			}

			res.json(data);
		});
	};
}

module.exports = {
	UniversalDaoController: UniversalDaoController
}
