var log = require('./logging.js').getLogger('UniversalDaoController.js');
var auditLog = require('./logging.js').getLogger('AUDIT');

var universalDaoModule = require(process.cwd() + '/build/server/UniversalDao.js');
var udcServiceModule = require('./UniversalDaoService.js');


var safeUrlEncoder = require('./safeUrlEncoder.js');

/**

 Class provides data manipulation operations
 @module server
 @submodule controllers
 @class UniversalDaoController


*/
var UniversalDaoController = function(mongoDriver, schemaRegistry, eventRegistry) {

	var self=this;

	this.service= new udcServiceModule.UniversalDaoService(mongoDriver, schemaRegistry, eventRegistry);


	function responeMapper(resp,next){
		var self=this;
		this.resp=resp;
		this.next=next;

		return  function (err,userError,data) {
			if (err){
				log.error(err);
				self.next(err);
				return;
			}
			if (userError){
				log.warn(userError);
				if (userError.security){
					self.resp.status(403);
				}
				else {
					self.resp.status(400);
				}
				self.resp.json(userError);
				return;
			}
			resp.json(data);
		};
	}

	function getRequestSchema(req,next){

		if ( !req.params || !req.params.schema){
			next('Schema not specified.');
		}

		return safeUrlEncoder.decode(req.params.schema);
	}

	function getUserContext(req,next){
		return {user:req.currentUser,perm:req.perm,profile:req.profile};
	}
	/**
		Method to fetch data from specified schema.
		@method getBySchema
		@param  id [uri] should be parsed from uri (binding)
		@param  schema [uri] enoded schema uri should be parsed from uri (binding)

	*/
	this.getBySchema = function(req, res,next) {
		var schemaUri=getRequestSchema(req,next);
		if (!req.params.id) {
			next('Entity id not specified');
		}
		self.service.getBySchema(schemaUri,getUserContext(req),req.params.id,new responeMapper(res,next));
	};


	/**
		Method to store data to specified schema.
		@method saveBySchema
		@param  id [uri] should be parsed from uri (binding)
		@param  entity [body] entity to store

	*/
	this.saveBySchema = function(req, res,next) {
		var schemaUri=getRequestSchema(req,next);
		if (!req.body) {
			next('Entity to store not specified');
		}
		self.service.saveBySchema(schemaUri,getUserContext(req),req.body,new responeMapper(res,next));
	};

	/**
		Method searches for data in specified schema using query.
		@method searchBySchema
		@param  id [uri] should be parsed from uri (binding)
		@param  query [body] json containing query. see QueryFilter.

	*/
	this.searchBySchema = function(req, res,next) {
		var schemaUri=getRequestSchema(req,next);
		self.service.searchBySchema(schemaUri,getUserContext(req),req.body,new responeMapper(res,next));
	};

	/**
		Same as searchBySchema , but the reasult is count of enitities. Method searches for data in specified schema using query.
		@method searchBySchemaCount
		@param  id [uri] should be parsed from uri (binding)
		@param  query [body] json containing query. see QueryFilter.

	*/
	this.searchBySchemaCount = function(req, resp,next) {
		var schemaUri=getRequestSchema(req,next);
		self.service.searchBySchemaCount(schemaUri,getUserContext(req),req.body, new responeMapper(res,next));
	};



	/**
		Returns  distinct tags as enum.
		@method getArticleTagsDistinct
	*/
	this.getArticleTagsDistinct = function(req, resp,next) {
		var schemaUri=getRequestSchema(req,next);
		selservice.getArticleTagsDistinct(new responeMapper(res,next));
	};

	this.listPortalMenu = function(req, resp, next) {
		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: 'portalMenu'}
		);

		_dao.list({}, function(err, data) {
			if (err) {
				log.error(err);
				next(err);
				return;
			}

			resp.json(data);
		});
	};

	this.savePortalMenu = function(req, res,next) {
		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{ collectionName: 'portalMenu' }
		);

		log.verbose("data to savvar e", req.body);

		var obj = req.body;
		_dao.save(obj, function(err, data){
			if (err) {
				log.error(err);
				next(error);
				return;
			}

			//FIXME: Old fashion audit log is obsolete. pure save method is not audited. It should be used
			//only as save by schema. Don't forget to remove declaration also.
			//auditLogs.info('user oid', req.currentUser.id,'has saved/modified object',obj);

			res.json(data);
		});
	};

};

module.exports = {
	UniversalDaoController: UniversalDaoController
};
