'use strict';

var log = require('./logging.js').getLogger('loginController.js');
var universalDaoModule = require('./UniversalDao.js');
var crypto = require("crypto");
var extend = require('extend');

var uuid = require('node-uuid');

var nodemailer = require("nodemailer");

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
				resp.send(500, err)
			} else {

				if (data.length === 1) {
					var user = data[0];

					if (user != null) {

						t.verifyUserPassword(user, req.body.password, function(err) {

							if (err) {
								resp.send(500, 'Not authenticated.');
							} else {
								t.createToken(user.loginName, req.ip, function(token) {
									t.storeToken(token, user.loginName, req.ip, function(err, data) {
										if (err != null)
											return;
										t.setCookies(resp, token, user.loginName);
									})
								})
							}

						});
					}

					else {
						resp.send(500, 'Not authenticated.');
					}

				} else {
					resp.send(500, 'users found ' + data.length);
				}
			}

		});

	};

	this.verifyUserPassword = function(user, passwordSample, callback) {

		if (!user) {
			callback('user null');

		} else {

			this.hashPassword(user.salt, passwordSample, function(err, hashPass) {
				if (err) {
					resp.send(500, err);
					return;
				}

				if (user.passwordHash == hashPass.toString('base64')) {
					callback(null);
				} else {
					callback('password does not match');
				}
			});

		}

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

				if (err) {
					resp.send(500, err);

				} else {

					if (tokens.length > 0) {
						var token = tokens[0];
						token.valid = false;

						tokenDao.update(token, function(err, data) {
							if (err) {
								cosole.log(err);
								resp.send(500, err);

							} else {
								resp.clearCookie(cfg.securityTokenCookie);
								resp.clearCookie(cfg.loginNameCookie);
								resp.send(200);
							}

						})

					} else {
						resp.send(500, 'Token does not exist.');
					}

				}

			});
		} else {
			resp.send(500, 'SecurityToken Missings.');
		}

	};

	/**
	 * method should be used to re-generate new password for user Method should
	 * be used by authorized person ( no 'accidental' password resets)
	 */
	this.resetPassword = function(req, resp) {

		var t = this;
		userDao.list({
			crits : [ {
			    f : cfg.loginColumnName,
			    v : req.body.login,
			    op : 'eq'
			} ]
		}, function(err, data) {

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

					user.passwordHash = passwordHash.toString('base64');

					user.salt = newsalt;

					userDao.update(user, function(err, data) {
						if (err) {
							resp.send(500, err);
						}

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
		userDao.list({
			crits : [ {
			    f : cfg.loginColumnName,
			    v : req.loginName,
			    op : 'eq'
			} ]
		}, function(err, data) {

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

								user.passwordHash = passwordHash.toString('base64');

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
