var universalDaoModule = require('./UniversalDao.js');
var crypto = require("crypto");
var extend = require('extend');
var uuid = require('node-uuid');

var collectionName = 'user';

var DEFAULT_USER = {
    "loginName" : "johndoe",
    "passwordHash" : "johndoe",
    "salt" : "johndoe",
    "groups" : {},
    "permissions" : {
        "Registry - read" : true,
        "System User" : true,
        "Registry - write" : true
    }
};

var DEFAULT_CFG = {
    userCollection : 'user',
    loginColumnName : 'loginName',
    tokenCollection : 'token',
    tokenIdColumnName : 'tokenId',
    securityTokenCookie : 'securityToken',
    loginNameCookie : 'loginName',
    tokenExpiration : 900000

};

var LoginController = function(mongoDriver, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	var userDao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : cfg.userCollection
	});

	var tokenDao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : cfg.tokenCollection
	});

	this.login = function(req, resp) {

		if (req.authenticated == true) {
			resp.send(500, 'User authenticated');
			return;
		}

		var t = this;

		userDao.list({
			crits : [ {
			    f : cfg.loginColumnName,
			    v : req.body.login,
			    op : 'eq'
			} ]
		}, function(err, data) {

			if (err) {
				throw err;
			}

			if (data.length > 0) {
				var user = data[0];

				if (user != null) {

					t.hashPassword(user.salt, req.body.password, function(err, hashPass) {
						if (err) {
							resp.send(500, err);
							return;
						}

						if (user.passwordHash.toString() == hashPass.toString()) {

							t.createToken(user.loginName, req.ip, function(token) {
								t.storeToken(token, user.loginName, req.ip, function(err, data) {
									if (err != null)
										return;
									t.setCookies(resp, token, user.loginName);
								})
							})
						} else {
							resp.send(500, 'Not authenticated');
						}

					});
				}

				else {
					resp.send(500, 'Not authenticated');
				}

			}

		});

	};

	this.createToken = function(user, ip, callback) {

		callback(uuid.v4());
	};

	this.storeToken = function(tokenId, user, ip, callback) {

		var now = new Date().getTime()
		var token = {
		    tokenId : tokenId,
		    user : user,
		    ip : ip,
		    created : now,
		    touched : now
		};

		tokenDao.save(token, callback);

	};

	this.setCookies = function(resp, token, loginName) {

		resp.cookie(cfg.securityTokenCookie, token, {
			httpOnly : true
		});
		resp.cookie(cfg.loginNameCookie, loginName, {
			httpOnly : true
		});
		resp.send(200);
	};

	this.logout = function(req, resp) {

		var tokenId = req.cookies.securityToken;

		if (tokenId != null) {

			tokenDao.list({
				crits : [ {
				    op : 'eq',
				    v : tokenId,
				    f : cfg.tokenIdColumnName
				} ]
			}, function(err, tokens) {
				if (err)
					resp.send(500, err);

				if (tokens.length > 0) {
					var token = tokens[0];
					tokenDao.remove(token.id, function(err, data) {

						if (err) {
							resp.send(500, err);
							return;
						}

						resp.clearCookie(cfg.securityTokenCookie);
						resp.clearCookie(cfg.loginNameCookie);
						resp.send(200);
					});
				} else {
					resp.send(500, 'Token does not exist.');
				}

			});
		} else {
			resp.send(500, 'Security Token Missings.');
		}

	};

	this.hashPassword = function(salt, password, callback) {
		crypto.pbkdf2(password, salt.toString('base64'), 1000, 256, callback);
	};

	this.authFilter = function(req, res, next) {

		req.authenticated = false;
		req.loginName = 'Anonymous';

		var tokenId = req.cookies.securityToken;

		if (tokenId != null) {
			tokenDao.list({
				crits : [ {
				    op : 'eq',
				    v : tokenId,
				    f : cfg.tokenIdColumnName
				} ]
			}, function(err, tokens) {
				if (err)
					resp.send(500, err);
				if (tokens.length == 1) {
					var token = tokens[0];
					// TODO validate IP
					var now = new Date().getTime();
					if (req.ip == token.ip && token.touched > (now - cfg.tokenExpiration)) {
						token.touched = now;
						// TODO maybe some filtering for updates
						tokenDao.update(token, function(err, data) {
						})
						req.authenticated = true;
						req.loginName = token.user;
					} else {

						res.clearCookie(cfg.securityTokenCookie);
						res.clearCookie(cfg.loginNameCookie);
					}

				}
				next();

			});

		} else {
			next();
		}

	};

}

module.exports = {
	LoginController : LoginController
}
