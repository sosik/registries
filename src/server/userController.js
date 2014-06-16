'use strict';

var log = require('./logging.js').getLogger('loginController.js');
var extend = require('extend');
var universalDaoModule = require('./UniversalDao.js');

var DEFAULT_CFG = {
	userCollection : 'people',
};

var UserController = function(mongoDriver, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	var userDao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : cfg.userCollection
	});

	this.getUserList = function(req, resp) {

		userDao.list({}, function(err, data) {

			if (err) {
				resp.send(500, err);
			} else {
				resp.send(200, data);
			}
		});
	};

};

module.exports = {
	UserController : UserController
}