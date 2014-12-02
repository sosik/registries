/* jshint node:true */
'use strict';

var log = require('../logging.js').getLogger('page-controller.js');
var config = require('../config.js');
var universalDaoModule = require('../UniversalDao.js');
var swig = require('swig');
var path = require('path');

var collectionName = 'portalArticles';

function PageController(mongoDriver) {
	this.mongoDriver = mongoDriver;
}

PageController.prototype.renderIndex = function(req, res, next) {
	var locals = {};
	locals.ctx = req.portalCtx;	

	swig.renderFile(path.join(config.portalTemplatesPath, 'index.html'), locals, function(err, output) {
		if (err) {
			log.error('Failed to render %s', 'index.html', err);
			next(err);
		}
		res.send(output);
	});
};


PageController.prototype.renderNotFound = function(req, res, next) {
	swig.renderFile(path.join(config.portalTemplatesPath, '404.html'), {}, function (err, output) {
		if (err) {
			log.error('Failed to render %s', 'NotFound', err);
			next(err);
		}

		res.send(output);
		res.status(404);
	});
};


module.exports = PageController;
