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
			require('./manglers/ObjectCleanerUnmangler.js')(),
			require('./manglers/TimestampUnmangler.js')(),
			require('./manglers/ObjectLinkUnmangler.js')(function(mongoDriver, options) {
				return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver)
	]);

	var getObjectMangler = require('./ObjectMangler.js').create([
			require('./manglers/TimestampUnmangler.js')(),
			require('./manglers/ObjectCleanerUnmangler.js')(),
			require('./manglers/ObjectLinkUnmangler.js')(function(mongoDriver, options) {
				return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver)
	]);

	var updateObjectMangler = require('./ObjectMangler.js').create([
			require('./manglers/ObjectCleanerMangler.js')(),
			require('./manglers/ObjectLinkMangler.js')(function(mongoDriver, options) {
						return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver),
			require('./manglers/TimestampMangler.js')()
	]);

	var saveObjectMangler = require('./ObjectMangler.js').create([
			require('./manglers/ObjectLinkMangler.js')(function(mongoDriver, options) {
				return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver),
			 require('./manglers/TimestampMangler.js')(mongoDriver),
			 require('./manglers/ObjectCleanerMangler.js')(),
			require('./manglers/SequenceMangler.js')(mongoDriver)
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
			//UPDATE
			setTimeout(updateObjectMangler.mangle(obj, compiledSchema, function(err, cb) {
				if (err){res.send(500);return;}

				_dao.update(obj, function(err, data){
					if (err) {
						res.send(500);
						throw err;

					}
					res.status(200).json(data);
					auditLog.info('user oid', req.currentUser.id,'has modified object',obj);
				});

			}
			), 0);
		}
		else {
			//CREATE
			setTimeout(saveObjectMangler.mangle(obj, compiledSchema, function(err, cb) {
				if (err){res.send(500);log.err(err);return;}
				
				_dao.save(obj, function(err, data){
					if (err) {
						res.send(500);
						throw err;
					}
					res.json(data);
					auditLog.info('user oid', req.currentUser.id,'has created object',obj);
				});

			}
			), 0);

			
		}

		// SVF dirty hack
		if (obj.baseData
				&& obj.baseData.typeOfTransfer
				&& (obj.baseData.typeOfTransfer === 'hosťovanie' || obj.baseData.typeOfTransfer === 'prestup' || obj.baseData.typeOfTransfer === 'zahr. transfér') 
				&& obj.baseData.dateFrom
				&& obj.baseData.clubTo
				&& obj.baseData.clubTo.oid
				&& obj.baseData.player
				&& obj.baseData.player.oid
				&& obj.baseData.stateOfTransfer === 'schválený') {

			var cdate = new Date();
			var cyear = cdate.getFullYear().toString();
			var cmonth = (cdate.getMonth() + 1).toString();
			var cday = cdate.getDate().toString();
			var cmpstr = ''.concat(cyear, (cmonth.length > 1?cmonth:'0'.concat(cmonth)), (cday.length > 1 ? cday: '0'.concat(cday)));

			if (cmpstr >= obj.baseData.dateFrom) {
				var cDao = new universalDaoModule.UniversalDao(
					mongoDriver,
					{collectionName: 'people'}
				);

				cDao.get(obj.baseData.player.oid, function(err, data){
					if (err) {
						log.error('Failed to get player for club update');
						return;
					}

					if (data) {
						if (!data.player) {
							data.player = {};
						}

						if (obj.baseData.typeOfTransfer === 'hosťovanie' || obj.baseData.typeOfTransfer === 'zahr. transfér') {
							data.player.club = obj.baseData.clubTo;
						}
						if (obj.baseData.typeOfTransfer === 'prestup') {
							data.player.clubOfFirstRegistration = obj.baseData.clubTo;
							data.player.club = obj.baseData.clubTo;
						}

						cDao.update(data, function(err, data){});
					}
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
			setTimeout(getObjectMangler.mangle(data, compiledSchema, function(err, cb) {
									if (err){res.send(500);}
									res.status(200).json(data); 
								}), 0);

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
								setTimeout(listObjectMangler.mangle(data[j], compiledSchema, function(err, cb) {
									callback(err, cb);
								}), 0);
							};
						}(i)));
					}

					async.parallelLimit(mangFuncs, 3, function(err, cb) {
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
