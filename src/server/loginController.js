'use strict';

var log = require('./logging.js').getLogger('loginController.js');
var universalDaoModule = require('./UniversalDao.js');
var crypto = require("crypto");
var extend = require('extend');
var QueryFilter = require('./QueryFilter.js');

var uuid = require('node-uuid');

var nodemailer = require("nodemailer");

var collectionName = 'user';

var DEFAULT_USER = {
	"systemCredentials": {
		"login": {
			"loginName" : "johndoe",
			"passwordHash" : "johndoe",
			"salt" : "johndoe",
		},
		"groups" : {},
		"permissions" : {
			"Registry - read" : true,
			"System User" : true,
			"Registry - write" : true
		}
	}
};

var DEFAULT_CFG = {
    userCollection : 'people',
    loginColumnName : 'systemCredentials.login.loginName',
    tokenCollection : 'token',
    tokenIdColumnName : 'tokenId',
    securityTokenCookie : 'securityToken',
    loginNameCookie : 'loginName',
    tokenExpiration : 900000,
    generatedPasswordLen : 8

};

var transport = nodemailer.createTransport("Sendmail");

var LoginController = function(mongoDriver, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	var userDao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : cfg.userCollection
	});

	var tokenDao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : cfg.tokenCollection
	});

	/**
	 * Does login based on provided password and login name. It queries DB
	 * and if verification of crediatials successed it stores new security token into DB
	 * and sets that token as cookies.
	 */
	this.login = function(req, resp) {
		log.silly('login atempt', req.body.login);
		// more problems than benefits
		// if (req.authenticated) {
		//	log.verbose('User is already authenticated');
		//	resp.send(500, 'User already authenticated');
		//	return;
		//}

		var t = this;

		userDao.list(QueryFilter.create()
				.addCriterium(cfg.loginColumnName, QueryFilter.operation.EQUAL, req.body.login)
		, function(err, data) {
			if (err) {
				log.error('Failed to list users from DB', err);
				resp.send(500, err);
				return;
			}

			if (data.length !== 1) {
				log.verbose('Found more or less then 1 user with provided credentials', data.length);
				resp.send(500, 'users found ' + data.length);
				return;
			}

			// we are sure there is exactly one user
			var user = data[0];

			t.verifyUserPassword(user, req.body.password, function(err) {
				if (err) {
					log.verbose('Password verification failed', err);
					resp.send(500, 'Not authenticated.');
					return;
				}
				t.createToken(user.loginName, req.ip, function(token) {
					t.storeToken(token, user.loginName, req.ip, function(err, data) {
						if (err) {
							log.error('Failed to store login token', err);
							resp.send(500, 'Internal Error');
							return;
						}
						t.setCookies(resp, token, user.systemCredentials.login.loginName);

						resp.send(200, user);
						return;
					});
				});
			});
		});
	};

	this.verifyUserPassword = function(user, passwordSample, callback) {
		if (!user) {
			log.error('user parameter cannot be null!');
			callback(new Error('User parameter cannot be null'));
		} 

		this.hashPassword(user.systemCredentials.login.salt, passwordSample, function(err, hashPass) {
			if (err) {
				log.error('Failed to hash password');
				callback(new Error('Failed to hash password'));
				return;
			}

			if (user.systemCredentials.login.passwordHash === hashPass.toString('base64')) {
				callback(null);
			} else {
				log.verbose('Password does not match stored password');
				callback(new Error('Password does not match'));
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
		    valid : true,
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

				if (err) {
					resp.send(500, err);

				} else {

					if (tokens.length > 0) {
						var token = tokens[0];
						token.valid = false;

						tokenDao.update(token, function(err, data) {
							if (err) {
								log.error('Failed to update security token', err);
								resp.send(500, err);
								return;
							}

							resp.clearCookie(cfg.securityTokenCookie);
							resp.clearCookie(cfg.loginNameCookie);
							resp.send(200);
						});

					} else {
						resp.send(500, 'Token does not exist.');
						return;
					}

				}

			});
		} else {
			resp.send(500, 'SecurityToken Missings.');
			return;
		}

	};

	/**
	 * method should be used to re-generate new password for user Method should
	 * be used by authorized person ( no 'accidental' password resets)
	 */
	this.resetPassword = function(req, resp) {
		//FIXME construct criteria bt QueryFilter
		var t = this;
		userDao.list(QueryFilter.create()
				.addCriterium(cfg.loginColumnName, QueryFilter.operation.EQUAL, req.body.login)
		, function(err, data) {

			if (err) {
				res.send(500, err);
				throw err;
			}

			if (data.lenght > 1) {
				res.send(500, 'multiple matching users');
				throw 'multiple matching users';
			}

			var randomPass = t.generatePassword();
			var newsalt = t.generatePassword();

			user = data[0];
			if (user.email) {

				t.hashPassword(newsalt, randomPass, function(err, passwordHash) {

					user.systemCredentials.login.passwordHash = passwordHash.toString('base64');

					user.systemCredentials.login.salt = newsalt;

					userDao.update(user, function(err, data) {
						if (err) {
							resp.send(500, err);
						}

						//FIXME make mail address field as configurable parameter
						t.sendResetPasswordMail(user.email, randomPass);

						resp.send(200);
					});

				})

			} else {
				resp.send(500, 'User mail not specified');

			}

		})

	};

	this.sendResetPasswordMail = function(email, newPass, callback) {
		var mailOptions = {
		    from : "petugez@gmail.com",
		    to : email,
		    subject : "[Registry] Your new password ",
		    text : "Your new password is: " + newPass,
		    html : "<h3>New Password</h3><h4> Your new password is: <b>" + newPass + " </b> </h4>"
		}

		log.verbose('Sending mail ', mailOptions);

		transport.sendMail(mailOptions, callback);

	}

	/**
	 * method should be used to re-generate new password for user Method should
	 * be used by authorized person ( no 'accidental' password resets)
	 */
	this.changePassword = function(req, resp) {

		if (!req.loginName) {
			resp.send(500, 'User must be logged in for password change');
			throw 'User must be logged in for password change';
		}

		var t = this;
		userDao.list(QueryFilter.create()
				.addCriterium(cfg.loginColumnName, QueryFilter.operation.EQUAL, req.body.login)
		, function(err, data) {

			if (err) {
				res.send(500, err);
			} else {

				if (data.length != 1) {
					resp.send(500, 'user not found');
				} else {
					var user = data[0];
					t.verifyUserPassword(user, req.body.currentPassword, function(err) {
						if (err) {
							resp.send(500, err);
						} else {

							var newPass = req.body.newPassword;
							var newsalt = t.generatePassword();

							t.hashPassword(newsalt, newPass, function(err, passwordHash) {

								user.systemCredentials.login.passwordHash = passwordHash.toString('base64');

								user.salt = newsalt;
								userDao.update(user, function(err, data) {
									if (err) {
										resp.send(500, err);
									} else {
										resp.send(200);
									}
								});
							})
						}
					})
				}

			}

		})

	};

	this.generatePassword = function generatePassword() {
		var length = cfg.generatedPasswordLen, charset = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", retVal = "";

		for (var i = 0, n = charset.length; i < length; ++i) {
			retVal += charset.charAt(Math.floor(Math.random() * n));
		}

		return retVal;
	}

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
					if (token.valid && req.ip == token.ip && token.touched > (now - cfg.tokenExpiration)) {
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
