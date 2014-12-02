/* jshint node:true */
'use strict';

var log = require('../logging.js').getLogger('api-controller.js');
var config = require('../config.js');
var universalDaoModule = require('../UniversalDao.js');
var path = require('path');
var QueryFilter = require('../QueryFilter.js');

var collectionName = 'portalArticles';

function ApiController(mongoDriver) {
	this.mongoDriver = mongoDriver;
	this._dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: 'portalArticles'}
		);
}

ApiController.prototype.saveArticle = function(req, res, next) {
	log.silly("Api saveArticle");

	var obj = req.body;

	this._dao.save(obj, function(err, data){
		if (err) {
			throw err;
		}
		res.json(data);
	});
};

ApiController.prototype.getByTags = function(req, res) {
	log.silly("Api getByTags");
	
	var tags = req.body.tags;

	console.log(req.body);
	
	var qf = QueryFilter.create();

	if (tags && tags.length && tags.length > 0)	{
		qf.addCriterium('meta.tags', QueryFilter.operation.ALL, tags);
	}

	console.log(qf);
	this._dao.list(qf, function(err, data) {
		if (err) {
			log.error(err);
			throw err;
		}
		res.json(data);
	});
};



module.exports = ApiController;
