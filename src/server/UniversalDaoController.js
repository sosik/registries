var log = require('./logging.js').getLogger('UniversalDaoController.js');
var auditLog = require('./logging.js').getLogger('AUDIT');
var async = require('async');

var universalDaoModule = require(process.cwd() + '/build/server/UniversalDao.js');
var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');
var securityServiceModule = require(process.cwd() + '/build/server/securityService.js');
var QueryFilter = require('./QueryFilter.js');
var consts = require(process.cwd() + '/build/server/SchemaConstants.js');

var safeUrlEncoder = require('./safeUrlEncoder.js');
var UniversalDaoController = function(mongoDriver, schemaRegistry,eventRegistry) {


	var listObjectMangler = require('./ObjectMangler.js').create([
			require('./manglers/CollationUnmangler.js')(),
			require('./manglers/ObjectCleanerUnmangler.js')(),

			require('./manglers/TimestampUnmangler.js')(),
			require('./manglers/ObjectLinkUnmangler.js')(function(mongoDriver, options) {
				return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver)
	]);

	var getObjectMangler = require('./ObjectMangler.js').create([
			require('./manglers/CollationUnmangler.js')(),
			require('./manglers/TimestampUnmangler.js')(),
			require('./manglers/ObjectCleanerUnmangler.js')(),
			require('./manglers/ObjectLinkUnmangler.js')(function(mongoDriver, options) {
				return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver)
	]);

	var updateObjectMangler = require('./ObjectMangler.js').create([
			require('./manglers/ObjectCleanerMangler.js')(),
			require('./manglers/NumberMangler.js')(),
			require('./manglers/CollationMangler.js')(mongoDriver),
			require('./manglers/UniqueMangler.js')(mongoDriver),
			require('./manglers/ObjectLinkMangler.js')(function(mongoDriver, options) {
						return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver),
			require('./manglers/TimestampMangler.js')(),
			require('./manglers/GenerateVSMangler.js')(mongoDriver)
	]);

	var saveObjectMangler = require('./ObjectMangler.js').create([
			require('./manglers/ObjectLinkMangler.js')(function(mongoDriver, options) {
				return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver),
			require('./manglers/NumberMangler.js')(),
			require('./manglers/TimestampMangler.js')(mongoDriver),
			require('./manglers/ObjectCleanerMangler.js')(),
			require('./manglers/SequenceMangler.js')(mongoDriver),
			require('./manglers/UniqueMangler.js')(mongoDriver),
			require('./manglers/NextMangler.js')(mongoDriver),
			require('./manglers/GenerateVSMangler.js')(mongoDriver),
			require('./manglers/CollationMangler.js')(mongoDriver)
	]);

	var that=this;
	this.mongoDriver=mongoDriver;
	var securityService= new securityServiceModule.SecurityService();

	this.save = function(req, res,next) {
		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: req.params.table}
		);

		log.verbose("data to savvar e", req.body);

		var obj = req.body;
		_dao.save(obj, function(err, data){
			if (err) {
				log.error(err);
				next(error);
				return;
			}
			auditLogs.info('user oid', req.currentUser.id,'has saved/modified object',obj);
			res.json(data);
		});
	};


	function convertLocalErrors(locals){
		if (locals.length===0){
				return null;
		}
		var retVal={};
		locals.forEach(function(local){
			var field='default';
			if (local.f){
				field=local.f;
			}

			if (!retVal[field]){
				retVal[field]=[];
			}
			retVal[field].push({f:local.f,c:local.c,d:local.d});
		});
		return retVal;
	}

	this.saveBySchema = function(req, res,next) {

		var schemaName = safeUrlEncoder.decode(req.params.schema);

		if (!schemaRegistry) {
			log.error('missing schemaRegistry');
			throw new Error('This method requires schemaRegistry');
		}
		var schema = schemaRegistry.getSchema(schemaName);

		if (!schema) {
			log.error('schema %s not found', schemaName);
			throw new Error('Schema not found');
		}

		var compiledSchema = schema.compiled;

		if (!compiledSchema) {
			log.error('schema %s is not compiled', schemaName);
			throw new Error('Schema is not compiled');
		}

		if (compiledSchema[consts.SAVE_BY_SCHEMA]){
			schemaName=compiledSchema[consts.SAVE_BY_SCHEMA];
			compiledSchema = schemaRegistry.getSchema(schemaName).compiled;
			if (!compiledSchema) {
				log.error('saveByschema %s is not compiled', schemaName);
				throw new Error('Schema is not compiled');
			}
		}

		if (!securityService.hasRightForAction(compiledSchema,securityServiceModule.actions.MODIFY,req.perm)){
			res.send(403,securityService.missingPermissionMessage(securityService.requiredPermissions(compiledSchema,securityServiceModule.actions.MODIFY)));
			log.verbose('Not authorized to save object',schemaName);
			return;
		}

		var _dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: compiledSchema.table}
		);

		var _daoAudit = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: 'auditLogs'}
		);

		log.verbose("data to save", req.body);

		var obj = req.body;


		if (obj.id){
			//UPDATE
			setTimeout(updateObjectMangler.mangle(obj, compiledSchema, function(err, local) {

				if (err){
					next(err);
					return;
				}

				if (local && local.length>0){
					res.status(400);
					next(convertLocalErrors(local));
					return;
				}

				_dao.update(obj, function(err, data){
					if (err) {
						next(err);
						return;
					}
					res.json(data);
					if (compiledSchema[consts.FIRE_EVENTS] && compiledSchema[consts.FIRE_EVENTS][consts.FIRE_EVENTS_UPDATE] ){
						log.silly('Firing event',compiledSchema[consts.FIRE_EVENTS][consts.FIRE_EVENTS_UPDATE]);
						eventRegistry.emitEvent(compiledSchema[consts.FIRE_EVENTS][consts.FIRE_EVENTS_UPDATE],{entity:obj,user:req.currentUser});
					}

					var auditEntity={};
					auditEntity.obj = obj;
					auditEntity.user = req.currentUser.id;
					auditEntity.action = "update";
					auditEntity.timeStamp = new Date().getTime();
					auditEntity.schemaName = schemaName;

					_daoAudit.save(auditEntity, function (data){});
				});

			}
			), 0);
		}
		else {
			//CREATE
			setTimeout(saveObjectMangler.mangle(obj, compiledSchema, function(err, local) {

				if (err){
					log.error(err);
					next(err);
					return;
				}
				if (local && local.length>0){
					res.status(400);
					next(convertLocalErrors(local));
					return;
				}

				objectTools.removeNullProperties(obj);

				_dao.save(obj, function(err, data){
					if (err) {
						log.error(err);
						next(err);
						return;
					}
					res.json(data);


					if (compiledSchema[consts.FIRE_EVENTS] && compiledSchema[consts.FIRE_EVENTS][consts.FIRE_EVENTS_CREATE] ){
						log.silly('Firing event',compiledSchema[consts.FIRE_EVENTS][consts.FIRE_EVENTS_CREATE]);
						eventRegistry.emitEvent(compiledSchema[consts.FIRE_EVENTS][consts.FIRE_EVENTS_CREATE],{entity:data,user:req.currentUser});
					}

					var auditEntity={};
					auditEntity.obj = obj;
					auditEntity.user = req.currentUser.id;
					auditEntity.action = "create";
					auditEntity.timeStamp = new Date().getTime();
					auditEntity.schemaName = schemaName;

					_daoAudit.save(auditEntity, function (data){
					});
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

						cDao.update(data, function(err, data){});
					}
				});
			}
		}

	};

	this.get = function(req, res,next) {
		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: req.params.table}
		);

		log.verbose(req.params);
		_dao.get(req.params.id, function(err, data){
			if (err) {
				log.error(err);
				next(err);
				return;
			}

			res.json(data);
		});
	};

	this.getBySchema = function(req, res,next) {

		log.silly('getBySchema',req.params);
		var schemaName = safeUrlEncoder.decode(req.params.schema);

		if (!schemaRegistry) {
			log.error('missing schemaRegistry');
			throw new Error('This method requires schemaRegistry');
		}

		var schema = schemaRegistry.getSchema(schemaName);



		if (!schema) {
			log.error('schema %s not found', schemaName);
			throw new Error('Schema not found');
		}

		var compiledSchema = schema.compiled;

		if (!compiledSchema) {
			log.error('schema %s is not compiled', schemaName);
			throw new Error('Schema is not compiled');
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
			throw new Error ('Id is not defined.');
		}
		_dao.get(req.params.id, function(err, data){
			if (err) {
				log.error(err);
				next(err);
				return;
			}
			setTimeout(getObjectMangler.mangle(data, compiledSchema, function(err, cb) {
									if (err){next(err); return;}
									res.status(200).json(data);
								}), 0);

		});
	};

	this.list = function(req, res,next) {
		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: req.params.table}
		);

		_dao.list({}, function(err, data){
			if (err) {
				log.error(err);
				next(err);
				return;
			}

			res.json(data);
		});
	};

	this.listBySchema = function(req, res,next) {
		var schemaName = safeUrlEncoder.decode(req.params.schema);

		if (!schemaRegistry) {
			log.error('missing schemaRegistry');
			throw new Error('This method requires schemaRegistry');
		}

		var schema = schemaRegistry.getSchema(schemaName);


		if (!schema) {
			log.error('schema %s not found', schemaName);
			throw new Error('Schema not found');
		}

		var compiledSchema = schema.compiled;

//		log.silly(compiledSchema);

		if (!compiledSchema) {
			log.error('schema %s is not compiled', schemaName);
			throw new Error('Schema is not compiled');
		}

		if (!securityService.hasRightForAction(compiledSchema,securityServiceModule.actions.READ,req.perm)){
			res.status(403).json(securityService.missingPermissionMessage(securityService.requiredPermissions(compiledSchema,securityServiceModule.actions.READ)));
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
				log.error(err);
				next(err);
			}

			res.json(data);
		});
	};

	function enhanceQuery(qf,schema,schemaName,profile){
		securityService.applySchemaForcedCrits(schema,qf);

		if (profile){
				qf=securityService.applyProfileCrits(profile,schemaName,qf);
		}


		var sorts=qf.sorts.map(function(sortBy){
			 var newF= translateCollate(schema,sortBy.f,'c');
			if (newF!==sortBy.f){
				return {f:newF,o:sortBy.o};
			}
			return sortBy;
		});

		qf.sorts=sorts;

		var crits=qf.crits.map(function(c){
			var newF= translateCollate(schema,c.f,'v');
			if (newF!==c.f){
				return {f:newF,op:c.op,v:c.v};
			}
			return c;
		});

		qf.crits=crits;

	}

	function translateCollate(schema,field,suffix){
		var schemaPath=objectTools.objecPathToSchemaPath(field);
		if (schemaPath){
			var schemaFragment=objectTools.evalPath(schema,schemaPath);
			if (schemaFragment && schemaFragment.$collate){
				return field+"."+suffix;
			}
			else {
				return field;
			}
		}else
			return field;

	}



this.searchBySchema = function(req, resp,next) {


		log.silly('searching for', req.params);
		var schemaName=safeUrlEncoder.decode(req.params.schema);
		var schema = schemaRegistry.getSchema(schemaName);
		var dao = new universalDaoModule.UniversalDao(mongoDriver, {
			collectionName: schema.compiled.table
		});


		var compiledSchema = schema.compiled;

		if (!compiledSchema) {
			log.error('schema %s is not compiled', schemaName);
			throw new Error('Schema is not compiled');
		}


		if (!securityService.hasRightForAction(compiledSchema,securityServiceModule.actions.READ,req.perm)){

			log.warn('user has not rights to search in schema',schemaName);

			resp.status(403).json(securityService.missingPermissionMessage(securityService.requiredPermissions(compiledSchema,securityServiceModule.actions.READ)));
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
			qf.setSkip(crits.skip);
		}
		for(var c in crits.criteria){
			qf.addCriterium(crits.criteria[c].f,crits.criteria[c].op,crits.criteria[c].v);
		}

		enhanceQuery(qf,compiledSchema,schemaName,req.profile);

		log.silly('used crits', qf);
		dao.list(qf, function(err, data) {
			if (err) {
				next(err);
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
							next(err);
							return;
						}
						resp.json(data);
					});
				} else {
					resp.json(data);
				}
			}
		});

	};


this.searchBySchemaCount = function(req, resp,next) {

		log.silly('searching for', req.params);
		var schemaName=safeUrlEncoder.decode(req.params.schema);
		var schema = schemaRegistry.getSchema(schemaName);
		var dao = new universalDaoModule.UniversalDao(mongoDriver, {
			collectionName: schema.compiled.table
		});

		var compiledSchema = schema.compiled;

		if (!compiledSchema) {
			log.error('schema %s is not compiled', schemaName);
			throw new Error('Schema is not compiled');
		}

		if (!securityService.hasRightForAction(compiledSchema,securityServiceModule.actions.READ,req.perm)){
			log.warn('user has not rights to search in schema',schemaName);

			resp.status(403).json(securityService.missingPermissionMessage(securityService.requiredPermissions(compiledSchema,securityServiceModule.actions.READ)));
			return;
		}

		var crits=req.body;
		//remap to QueryFiter
		var qf=QueryFilter.create();

		for(var c in crits.criteria){
			qf.addCriterium(crits.criteria[c].f,crits.criteria[c].op,crits.criteria[c].v);
		}

		securityService.applySchemaForcedCrits(compiledSchema,qf);

		if (req.profile){
				qf=securityService.applyProfileCrits(req.profile,schemaName,qf);
		}

		log.silly('used crits', crits);
		dao.count(qf, function(err, data) {
			if (err) {
				log.error(err);
				next(err);
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

							next(err);
						}

						resp.json(data);
					});
				} else {
					resp.json(data);
				}
			}
		});

	};


this.getArticleTagsDistinct = function(req, resp) {

		log.silly('searching tags distinct', req.params);
		var dao = new universalDaoModule.UniversalDao(mongoDriver, {
			collectionName: 'portalArticles'
		});

		//db.portalArticles.distinct("meta.tags")
		var qf=QueryFilter.create();

		dao.distinct('meta.tags',qf, function(err, data) {
			if (err) {
				resp.status(500).send(err);
			} else {
				resp.status(200).send(data);
			}
		});

	};


	this.search = function(req, res ,next) {
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
				log.error(err);
			 	next (err);
				return;
			}

			res.json(data);
		});
	};
};

module.exports = {
	UniversalDaoController: UniversalDaoController
};
