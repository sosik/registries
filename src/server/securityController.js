'use strict';

var log = require('./logging.js').getLogger('securityController.js');
var extend = require('extend');

var universalDaoModule = require('./UniversalDao.js');

var DEFAULT_CFG = {
    userCollection : 'people',
    schemas : [  '/shared/schemas/permissions.json', '/shared/schemas/login.json', '/shared/schemas/systemCredentials.json' ]
};

var SchemaToolsModule = require('./SchemaTools.js');

var fs = require('fs');

var SecurityController = function(mongoDriver, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	var schemaTools = new SchemaToolsModule.SchemaTools();

	cfg.schemas.map(function(item) {
		var content = fs.readFileSync(process.cwd() + "/build" + item);

		schemaTools.registerSchema(null, content.toString());
	})

	schemaTools.parse();
	schemaTools.compile();

	var userDao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : cfg.userCollection
	});

	this.getPermissions = function(req, resp) {
		var defaultObj = schemaTools.createDefaultObject('uri://registries/security#permissions');

		var result = [];

		for ( var pro in defaultObj) {
			result.push(pro);
		}

		resp.send(200, result);
	};

	this.getUserPermissions = function(req, resp) {

		var userId = req.url.substring(18, req.url.lenght);

		userDao.get(userId, function(err, user) {

			if (err) {
				resp.send(500, err);
			} else {
				var userRes = {};
				userRes.loginName = user.systemCredentials.loginName;
				var perrmissions = [];

				for ( var per in user.systemCredentials.permissions) {
					if (user.systemCredentials.permissions[per]) {
						perrmissions.push(per);
					}
				}
				userRes.permissions = perrmissions;
				resp.send(200, userRes);
			}

		});

	};

	this.getUserGroups = function(req, resp) {

		var userId = req.url.substring(18, req.url.lenght);

		userDao.get(userId, function(err, user) {

			if (err) {
				resp.send(500, err);
			} else {
				var userRes = {};
				userRes.loginName = user.systemCredentials.loginName;
				var groups = [];

				for ( var gr in user.systemCredentials.groups) {
					groups.push(gr);
				}
				userRes.groups = perrmissions;
				resp.send(200, userRes);
			}

		});

	};
	
	this.updateUserGroups = function(req, resp) {

		var userId = req.url.substring(18, req.url.lenght);

		userDao.get(userId, function(err, user) {

			if (err) {
				resp.send(500, err);
			} else {
				var userRes = {};
				userRes.loginName = user.systemCredentials.loginName;
				var groups = [];

				for ( var gr in user.systemCredentials.groups) {
					groups.push(gr);
				}
				userRes.groups = perrmissions;
				resp.send(200, userRes);
			}

		});

	};
	

	var hasPermission = function(coll, perm) {

		for (var i = coll.length; i--;) {
			if (coll[i] === perm) {
				return true;
			}
		}
		return false;
	}

	this.updateUserPermissions = function(req, resp) {

		var userId = req.body.userId;
		userDao.get(userId, function(err, user) {

			if (err) {
				resp.send(500, err);
			} else {

				var defaultObj = schemaTools.createDefaultObject('uri://registries/security#permissions');

				var result = [];

				if (!user.systemCredentials) {
					user.systemCredentials = {};
				}
				if (!user.systemCredentials.permissions) {
					user.systemCredentials.permissions = {};
				}
				for ( var per in defaultObj) {
					result.push(per);
					user.systemCredentials.permissions[per] = hasPermission(req.body.permissions, per);
				}
				userDao.update(user, function(err) {
					if (err) {
						resp.send(500, err);
					} else {
						resp.send(200, result);
					}

				});

			}

		});

	};
	
	
	
	this.updateUserSecurity = function(req, resp) {

		var userId = req.body.userId;
		userDao.get(userId, function(err, user) {

			if (err) {
				resp.send(500, err);
			} else {

				var defaultObj = schemaTools.createDefaultObject('uri://registries/security#permissions');

				log.silly(req.body);

				if (!user.systemCredentials) {
					user.systemCredentials = {};
				}
				if (!user.systemCredentials.permissions) {
					user.systemCredentials.permissions = {};
				}
				
				delete user.systemCredentials.groups;
				
				if (!user.systemCredentials.groups) {
					user.systemCredentials.groups = [];
				}
				
				for ( var per in defaultObj) {
					user.systemCredentials.permissions[per] = hasPermission(req.body.permissions, per);
				}
				
				req.body.groups.map(function(group){
					console.log('pushing group',group);
					user.systemCredentials.groups.push({id:group.id});
				
				});
				
				if (user.systemCredentials.groups.length===0){
					user.systemCredentials.groups=null;
				}
				log.info('updating users security of', user.systemCredentials.login.loginName);
				log.silly(user.systemCredentials);
				userDao.update(user, function(err) {
					if (err) {
						resp.send(500, err);
					} else {
						resp.send(200);
					}

				});

			}

		});

	};
	

};

module.exports = {
	SecurityController : SecurityController
}