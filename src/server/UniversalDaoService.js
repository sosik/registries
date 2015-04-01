var log = require('./logging.js').getLogger('UniversalDaoController.js');
var auditLog = require('./logging.js').getLogger('AUDIT');
var async = require('async');

var universalDaoModule = require(process.cwd() + '/build/server/UniversalDao.js');
var objectTools = require(process.cwd() + '/build/server/ObjectTools.js');
var securityServiceModule = require(process.cwd() + '/build/server/securityService.js');
var QueryFilter = require('./QueryFilter.js');
var consts = require(process.cwd() + '/build/server/SchemaConstants.js');

var safeUrlEncoder = require('./safeUrlEncoder.js');

var UniversalDaoService = function(mongoDriver, schemaRegistry, eventRegistry) {


	var listObjectMangler = require('./ObjectMangler.js').create([
			require('./manglers/CollationUnmangler.js')(),
			require('./manglers/ObjectCleanerUnmangler.js')(),

			require('./manglers/TimestampUnmangler.js')(),
			require('./manglers/ObjectLinkUnmangler.js')(function(mongoDriver, options) {
				return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver),
			require('./manglers/ObjectLink2Unmangler.js')(function(mongoDriver, options) {
				return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver, schemaRegistry)
	]);

	var getObjectMangler = require('./ObjectMangler.js').create([
			require('./manglers/CollationUnmangler.js')(),
			require('./manglers/TimestampUnmangler.js')(),
			require('./manglers/ObjectCleanerUnmangler.js')(),
			require('./manglers/ObjectLinkUnmangler.js')(function(mongoDriver, options) {
				return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver),
			require('./manglers/ObjectLink2Unmangler.js')(function(mongoDriver, options) {
				return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver, schemaRegistry)
	]);

	var updateObjectMangler = require('./ObjectMangler.js').create([
			require('./manglers/ObjectCleanerMangler.js')(),
			require('./manglers/NumberMangler.js')(),
			require('./manglers/CollationMangler.js')(mongoDriver),
			require('./manglers/UniqueMangler.js')(mongoDriver),
			require('./manglers/ObjectLinkMangler.js')(function(mongoDriver, options) {
						return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver),
			require('./manglers/ObjectLink2Mangler.js')(function(mongoDriver, options) {
						return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver),
			require('./manglers/ReadOnlyMangler.js')(),
			require('./manglers/TimestampMangler.js')(),
			require('./manglers/GenerateVSMangler.js')(mongoDriver)

	]);

	var saveObjectMangler = require('./ObjectMangler.js').create([
			require('./manglers/ObjectLinkMangler.js')(function(mongoDriver, options) {
				return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver),
			require('./manglers/ObjectLink2Mangler.js')(function(mongoDriver, options) {
				return new universalDaoModule.UniversalDao(mongoDriver, options);
			}, mongoDriver),
			require('./manglers/NumberMangler.js')(),
			require('./manglers/ObjectCleanerMangler.js')(),
			require('./manglers/ReadOnlyMangler.js')(mongoDriver),
			require('./manglers/TimestampMangler.js')(mongoDriver),
			require('./manglers/SequenceMangler.js')(mongoDriver),
			require('./manglers/UniqueMangler.js')(mongoDriver),
			require('./manglers/NextMangler.js')(mongoDriver),
			require('./manglers/GenerateVSMangler.js')(mongoDriver),
			require('./manglers/CollationMangler.js')(mongoDriver)
	]);

	var that=this;
	this.mongoDriver=mongoDriver;
	var securityService= new securityServiceModule.SecurityService();



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

	this.saveBySchema = function(schemaName,userCtx,obj, callback) {

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

		if (!securityService.hasRightForAction(compiledSchema,securityServiceModule.actions.MODIFY,userCtx.perm)){
			callback(null,securityService.missingPermissionMessage(securityService.requiredPermissions(compiledSchema,securityServiceModule.actions.MODIFY)));
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

		log.verbose(" to save", obj);

		// var obj = req.body;


		if (obj.id){
			//UPDATE
			setTimeout(updateObjectMangler.mangle(obj, compiledSchema, function(err, local) {

				if (err){
					next(err);
					return;
				}

				if (local && local.length>0){
					callback(null,convertLocalErrors(local));
					return;
				}

				_dao.update(obj, function(err, data){
					if (err) {
						next(err);
						return;
					}
					callback(null,null,data);
					if (compiledSchema[consts.FIRE_EVENTS] && compiledSchema[consts.FIRE_EVENTS][consts.FIRE_EVENTS_UPDATE] ){
						log.silly('Firing event',compiledSchema[consts.FIRE_EVENTS][consts.FIRE_EVENTS_UPDATE]);
						eventRegistry.emitEvent(compiledSchema[consts.FIRE_EVENTS][consts.FIRE_EVENTS_UPDATE],{entity:obj,user:userCtx.user});
					}

					var auditEntity={};
					auditEntity.obj = obj;
					auditEntity.user = userCtx.user.id;
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
	};

	this.getBySchema = function(schemaName,userCtx,id,callback) {

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

		if (!securityService.hasRightForAction(compiledSchema,securityServiceModule.actions.READ,userCtx.perm)){
			callback(null,securityService.missingPermissionMessage(securityService.requiredPermissions(compiledSchema,securityServiceModule.actions.READ)));
			log.verbose('Not authorized to get object ',schemaName);
			return;
		}


		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: compiledSchema.table}
		);

		if (!id){
			log.error('Id is not defined for read from schema', schemaName);
			throw new Error ('Id is not defined.');
		}
		_dao.get(id, function(err, data){
			if (err) {
				log.error(err);
				next(err);
				return;
			}
			setTimeout(getObjectMangler.mangle(data, compiledSchema, function(err, cb) {
									if (err){next(err); return;}
									callback(null,null,data);
								}), 0);

		});
	};


	function enhanceQuery(qf,schema,schemaName,profile,currentUser){
		securityService.applySchemaForcedCrits(schema,qf);

		if (profile){
				qf=securityService.applyProfileCrits(profile,schemaName,qf,currentUser);
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
			if (schemaFragment && schemaFragment[consts.COLLATE]){
				return field+"."+suffix;
			}
			else {
				return field;
			}
		}else{
			return field;
		}

	}



	this.searchBySchema = function(schemaName,userCtx,query,callback) {

		log.silly('searching in ',schemaName,' for', query);

		var schema = schemaRegistry.getSchema(schemaName);
		var dao = new universalDaoModule.UniversalDao(mongoDriver, {
			collectionName: schema.compiled.table
		});


		var compiledSchema = schema.compiled;

		if (!compiledSchema) {
			log.error('schema %s is not compiled', schemaName);
			throw new Error('Schema is not compiled');
		}


		if (!securityService.hasRightForAction(compiledSchema,securityServiceModule.actions.READ,userCtx.perm)){
			log.warn('user has not rights to search in schema',schemaName);
			callback(null,securityService.missingPermissionMessage(securityService.requiredPermissions(compiledSchema,securityServiceModule.actions.READ)));
			return;
		}

		//remap to QueryFiter
		var qf=QueryFilter.create();
		if('sortBy' in query && query.sortBy){
			qf.addSort(query.sortBy[0].f,query.sortBy[0].o);
		}
		if ('limit' in query){
			qf.setLimit(query.limit);
		}
		if ('skip' in query){
			qf.setSkip(query.skip);
		}
		for(var c in query.criteria){
			qf.addCriterium(query.criteria[c].f,query.criteria[c].op,query.criteria[c].v);
		}

		enhanceQuery(qf,compiledSchema,schemaName,userCtx.profile,userCtx.user);

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
							callback(err);
							return;
						}
						callback(null,null,data);
					});
				} else {
					callback(null,null,data);
				}
			}
		});

	};


	this.searchBySchemaCount = function(schemaName,query,callback) {

		log.silly('searching for', req.params);
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

			callback(securityService.missingPermissionMessage(securityService.requiredPermissions(compiledSchema,securityServiceModule.actions.READ)));
			return;
		}


		//remap to QueryFiter
		var qf=QueryFilter.create();

		for(var c in query.criteria){
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

						callback(null,null,data);
					});
				} else {
						callback(null,null,data);
				}
			}
		});

	};


	this.getArticleTagsDistinct = function( callback) {

		log.silly('searching tags distinct', req.params);
		var dao = new universalDaoModule.UniversalDao(mongoDriver, {
			collectionName: 'portalArticles'
		});

		//db.portalArticles.distinct("meta.tags")
		var qf=QueryFilter.create();

		dao.distinct('meta.tags',qf, function(err, data) {
			if (err) {
				callback(err);
			} else {
				callback(null,null,data);
			}
		});

	};

};

module.exports = {
	UniversalDaoService: UniversalDaoService
};
