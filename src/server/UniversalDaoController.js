var log = require('./logging.js').getLogger('UniversalDaoController.js');
var auditLog = require('./logging.js').getLogger('AUDIT');
var async = require('async');

var universalDaoModule = require(process.cwd() + '/build/server/UniversalDao.js');
var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');
var securityServiceModule = require(process.cwd() + '/build/server/securityService.js');
var QueryFilter = require('./QueryFilter.js');

var safeUrlEncoder = require('./safeUrlEncoder.js');
var UniversalDaoController = function(mongoDriver, schemaRegistry) {

	var listObjectMangler = require('./ObjectMangler.js').create([
			require('./manglers/ObjectLinkUnmangler.js')(function(mongoDriver, options) {
				return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver)
	]);

	var that=this;
	this.mongoDriver=mongoDriver;
	var securityService= new securityServiceModule.SecurityService();
	
	
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
			auditLog.info('user oid', req.currentUser.id,'has saved/modified object',obj);
			res.json(data);
		});
	};

	this.saveBySchema = function(req, res) {
		
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

		if (!compiledSchema) {
			log.error('schema %s is not compiled', schemaName);
			throw 'Schema is not compiled';
		}
		
		if (!securityService.hasRightForAction(compiledSchema,securityServiceModule.actions.MODIFY,req.perm)){
			res.send(403,securityService.missingPermissionMessage(securityService.requiredPermissions(compiledSchema,securityServiceModule.actions.MODIFY)));
			log.verbose('Not authorized to save object',schemaName);
			return;
		} 

		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: compiledSchema.table}
		);

		log.verbose("data to save", req.body);

		var obj = req.body;
		if (obj.id){
			_dao.update(obj, function(err, data){
				if (err) {
					throw err;
				}
				auditLog.info('user oid', req.currentUser.id,'has modified object',obj);
				res.json(data);
			});

		}
		else {
			var sequences=objectTools.findSeqeunceFields(compiledSchema);
			
			console.log('found sequences' , sequences);

			var sequencesToAssign= [];
			
			sequences.map(function(path){
				console.log('sequences to assign',path);
				var sequenceDef=objectTools.evalPath(compiledSchema,path);
				sequencesToAssign.push( function (callback){
						mongoDriver.nextSequence(sequenceDef.$sequence, function(err,data){console.log(err,data); objectTools.setValue(obj,objectTools.schemaPathToObjectPath(path),data.seq);callback(err);});
						}
				);
				
				console.log(obj);
			});

			if (sequencesToAssign.length>0){
				async.parallel(sequencesToAssign,function(err){if (err) {log.err(err); return;} _dao.save(obj, function(err, data){
					if (err) {
						throw err;
					}
					auditLog.info('user oid', req.currentUser.id,'has saved object',obj);
					res.json(data);
				});  })
			}else {
				_dao.save(obj, function(err, data){
					if (err) {
						throw err;
					}
					auditLog.info('user oid', req.currentUser.id,'has saved object',obj);
					res.json(data);
				});	
			}
			
		}
		
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

		log.silly('getBySchema',req.params);
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

		if (!compiledSchema) {
			log.error('schema %s is not compiled', schemaName);
			throw 'Schema is not compiled';
		}
		
		if (!securityService.hasRightForAction(compiledSchema,securityServiceModule.actions.READ,req.perm)){
			res.send(403,securityService.missingPermissionMessage(securityService.requiredPermissions(compiledSchema,securityServiceModule.actions.READ)));
			log.verbose('Not authorized to get object ',schemaName);
			return;
		} 

		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: compiledSchema.table}
		);

		if (!req.params.id){
			log.error('Id is not defined for read from schema', schemaName);
			throw 'Id is not defined.';
		}
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
	
	this.listBySchema = function(req, res) {
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

//		log.silly(compiledSchema);

		if (!compiledSchema) {
			log.error('schema %s is not compiled', schemaName);
			throw 'Schema is not compiled';
		}
		
		if (!securityService.hasRightForAction(compiledSchema,securityServiceModule.actions.READ,req.perm)){
			res.send(403,securityService.missingPermissionMessage(securityService.requiredPermissions(compiledSchema,securityServiceModule.actions.READ)));
			return;
		} 

		var qf=QueryFilter.create();

		if (req.profile){
				qf=securityService.applyProfileCrits(req.profile,schemaName,qf);
		}

		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: compiledSchema.table}
		);
		
		if (req.profile){
				securityService.applyProfileCrits(req.profile,schemaName,qf);
		}
		_dao.list(qf, function(err, data){
			if (err) {
				throw err;
			}

			res.json(data);
		});
	};

this.searchBySchema = function(req, resp) {

		
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
			qf.addCriterium(crits.criteria[c].f,crits.criteria[c].op,crits.criteria[c].v);
		}

		securityService.applySchemaForcedCrits(compiledSchema,qf);


		if (req.profile){
				qf=securityService.applyProfileCrits(req.profile,schemaName,qf);
		}

		log.silly('used crits', crits);
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


	this.search = function(req, res) {
		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: req.params.table}
		);
		
		log.silly('Search params ', req.body);
		_dao.list({
			crits : req.body.criteria,
			limit : req.body.limit || 20
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
