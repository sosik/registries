'use strict';

var extend = require('extend');
var crypto = require("crypto");
var uuid = require('node-uuid');
var nodemailer = require("nodemailer");

var log = require('./logging.js').getLogger('securityController.js');
var QueryFilter = require('./QueryFilter.js');
var universalDaoModule = require('./UniversalDao.js');

var DEFAULT_CFG = {
    userCollection : 'people',
    loginColumnName : 'systemCredentials.login.loginName',
    groupCollection : 'groups',
    tokenCollection : 'token',
    tokenIdColumnName : 'tokenId',
    securityTokenCookie : 'securityToken',
    loginNameCookie : 'loginName',
    tokenExpiration : 3600000,
    generatedPasswordLen : 8
};

//

var transport = nodemailer.createTransport("Sendmail");

var SchemaToolsModule = require('./SchemaTools.js');

var fs = require('fs');

var SecurityController = function(mongoDriver, schemaRegistry, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	var userDao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : cfg.userCollection
	});

	var tokenDao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : cfg.tokenCollection
	});

	var groupDao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : cfg.groupCollection
	});

	this.getPermissions = function(req, resp) {
		var defaultObj = schemaRegistry.createDefaultObject('uri://registries/security#permissions');

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


	var hasPermission = function(coll, perm) {

		for (var i = coll.length; i--;) {
			if (coll[i] === perm) {
				return true;
			}
		}
		return false;
	}

	

	this.updateUserSecurity = function(req, resp) {

		log.silly(req.body);
		
		var userId = req.body.userId;
		userDao.get(userId, function(err, user) {

			if (err) {
				resp.send(500, err);
			} else {

				var defaultObj = schemaRegistry.createDefaultObject('uri://registries/security#permissions');

				log.silly(req.body);

				if (!user.systemCredentials) {
					user.systemCredentials = {};
				}
				if (!user.systemCredentials.permissions) {
					user.systemCredentials.permissions = {};
				}

				if (!user.systemCredentials.login) {
					user.systemCredentials.login = {};
				}
				
				delete user.systemCredentials.groups;

				if (!user.systemCredentials.groups) {
					user.systemCredentials.groups = [];
				}

				for ( var per in defaultObj) {
					user.systemCredentials.permissions[per] = (hasPermission(req.body.permissions, per)?true:null);
				}

				req.body.groups.map(function(group) {
					user.systemCredentials.groups.push({
						id : group.id
					});

				});

				if (user.systemCredentials.groups.length === 0) {
					user.systemCredentials.groups = null;
				}
				log.info('updating users security of', user.systemCredentials.login.loginName);
				log.silly(user.systemCredentials);
				
				user.systemCredentials.login.loginName=req.body.loginName;
				user.systemCredentials.login.email=req.body.email;

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

	this.updateGroupSecurity = function(req, resp) {

		var groupId = req.body.oid;
		groupDao.get(groupId, function(err, group) {

			if (err) {
				resp.send(500, err);
			} else {

				var defaultObj = schemaRegistry.createDefaultObject('uri://registries/security#permissions');

				log.silly(req.body);

				if (!group.security) {
					group.security = {};
				}
				if (!group.security.permissions) {
					group.security.permissions = {};
				}

				for ( var per in defaultObj) {
					group.security.permissions[per] = hasPermission(req.body.permissions, per);
				}

				group.baseData.name = req.body.groupName;
				group.baseData.id = req.body.groupId;
				if (req.body.parent) {
					group.baseData.parent = req.body.parent;
				} else {
					group.baseData.parent = null;
				}

				log.info('updating groups security of', group);
				log.silly(group);
				groupDao.update(group, function(err) {
					if (err) {
						resp.send(500, err);
					} else {
						resp.send(200);
					}

				});

			}

		});

	};

	/**
	 * Does login based on provided password and login name. It queries DB and
	 * if verification of crediatials successed it stores new security token
	 * into DB and sets that token as cookies.
	 */
	this.login = function(req, resp) {
		log.silly('login atempt', req.body.login);
		// more problems than benefits
		// if (req.authenticated) {
		// log.verbose('User is already authenticated');
		// resp.send(500, 'User already authenticated');
		// return;
		// }

		var t = this;

		userDao.list(QueryFilter.create().addCriterium(cfg.loginColumnName, QueryFilter.operation.EQUAL, req.body.login), function(err, data) {
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
				
				t.resolvePermissions(user,function (err,permissions){
					
					if (err) {
						log.error('Failed to resolvePermissions permissions', err);
						resp.send(500, 'Internal Error');
						return;
					}
					console.log(permissions);
					if ('System User' in  permissions&&permissions['System User'] ){
						t.createToken(user.systemCredentials.login.loginName, req.ip, function(token) {
							t.storeToken(token, user.id,user.systemCredentials.login.loginName, req.ip, function(err, data) {
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
						
					}
					else {
						log.verbose('Not authorized', err);
						resp.send(401, 'Not authorized.');
					}
				}); 
				
			});
		});
	};

	//Traverses groups and collects permission ,  finally user permissions added.
	this.resolvePermissions = function(user, callback) {
		if (!user){
			callback(null,[]);
			return;
		}
		var t = this;
		if (!'systemCredentials' in user ) {
			callback('user without systemCredentials');
			return;
		}
		var permissions = {};
		
		// if has no groups 
		if (!user.systemCredentials.groups || user.systemCredentials.groups.length === 0) {
			if (user.systemCredentials.permissions) {
				for ( var per in user.systemCredentials.permissions) {
					if (user.systemCredentials.permissions[per] === true) {
						permissions[per] = true;
					}
				}
			}
			log.verbose('user permissions resolved',permissions);
			callback(null, permissions);
			return;
		}

		groupDao.list({}, function(err, groups) {
			if (err) {
				calback(err);
				return;
			}
			//resolve groups
			for ( var gr in user.systemCredentials.groups) {
				t.resolveGroupPermissions(user.systemCredentials.groups[gr].id, groups, permissions);
			}

			//merge user rights
			if (user.systemCredentials.permissions) {
				for ( var per in user.systemCredentials.permissions) {
					if (user.systemCredentials.permissions[per] === true) {
						permissions[per] = true;
					}
				}
			}
			log.verbose('user permissions resolved',permissions);
			callback(null, permissions);
		});

	};

	function findGroup(groupId, groups) {
		for ( var grIt in groups) {
			if (groups[grIt].id === groupId) {
				return groups[grIt];
			}
		}
	}
	this.resolveGroupPermissions = function(groupId, allgroups, permissions) {
		var gr = findGroup(groupId, allgroups);
		if (!gr) {
			return;
		}
		if (gr.baseData.parent.oid) {
			this.resolveGroupPermissions(gr.baseData.parent.oid, allgroups, permissions)
		}

		if (gr.security && gr.security.permissions) {
			for ( var per in gr.security.permissions) {
				if (gr.security.permissions[per] === true) {
					permissions[per] = true;
				}
			}
		}
	};

	/**
	 * Returns current user for valid securityToken cookie see this.authFilter
	 */
	this.getCurrentUser = function(req, resp) {
		var t = this;
		if (!req.authenticated) {
			resp.send(500, 'User is not authenticated');
			return;
		}

		userDao.list(QueryFilter.create().addCriterium(cfg.loginColumnName, QueryFilter.operation.EQUAL, req.loginName), function(err, data) {
			if (err) {
				resp.send(500, err);
				return;
			}

			if (data.length !== 1) {
				log.verbose('Found more or less then 1 user with provided credentials', data.length);
				resp.send(500, 'users found ' + data.length);
				return;
			}
			var user = data[0];
			t.resolvePermissions(user, function(err, permissions) {
				if (err) {
					resp.send(500, err);
					return;
				}
				delete user.systemCredentials.permissions;
				user.systemCredentials.permissions = permissions;
				delete user.systemCredentials.login.passwordHash;
				delete user.systemCredentials.login.salt;
				delete user.systemCredentials.groups;
				resp.send(200, user);
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

	this.storeToken = function(tokenId, userId, user, ip, callback) {

		var now = new Date().getTime()
		var token = {
		    tokenId : tokenId,
		    userId : userId,
		    user : user,
		    ip : ip,
		    created : now,
		    valid : true,
		    touched : now
		};

		log.silly('Storing security token', token);
		tokenDao.save(token, callback);

	};

	this.setCookies = function(resp, token, loginName) {

		resp.cookie(cfg.securityTokenCookie, token, {
		    httpOnly : true,
		    secure : true
		});
		resp.cookie(cfg.loginNameCookie, loginName, {
			httpOnly : false
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
		// FIXME construct criteria bt QueryFilter
		var t = this;
		userDao.get(req.body.userId, function(err, data) {

			if (err) {
				res.send(500, err);
				throw err;
			}


			var randomPass = t.generatePassword();
			var newsalt = t.generatePassword();

			var user = data;
			log.silly(user);
			log.silly(user.systemCredentials.login.email);
			if (user.systemCredentials.login.email) {
				
				t.hashPassword(newsalt, randomPass, function(err, passwordHash) {

					user.systemCredentials.login.passwordHash = passwordHash.toString('base64');

					user.systemCredentials.login.salt = newsalt;

					userDao.update(user, function(err, data) {
						if (err) {
							resp.send(500, err);
						}

						log.info('User password reset', user);
						// FIXME make mail address field as configurable
						// parameter
						t.sendResetPasswordMail(user.systemCredentials.login.email, randomPass);

						resp.send(200,{email:user.systemCredentials.login.email});
					});
				})

			} else {
				resp.send(500, 'User mail not specified');
			}

		})

	};

	this.sendResetPasswordMail = function(email, newPass, callback) {
		var mailOptions = {
		    from : "websupport@unionsoft.sk",
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
		log.silly('Changing password for user', req.loginName);
		if (!req.loginName) {
			resp.send(500, 'User must be logged in for password change');
			throw 'User must be logged in for password change';
		}

		var t = this;
		userDao.list(QueryFilter.create().addCriterium(cfg.loginColumnName, QueryFilter.operation.EQUAL, req.loginName), function(err, data) {

			if (err) {
				res.send(500, err);
			} else {

				if (data.length != 1) {
					resp.send(500, 'user not found');
					return;
				} else {
					var user = data[0];
					t.verifyUserPassword(user, req.body.currentPassword, function(err) {
						if (err) {
							log.verbose('Old passwrod does not match!');
							resp.send(500, 'Old password does not match!');
							return;
						} else {

							var newPass = req.body.newPassword;
							var newsalt = t.generatePassword();

							t.hashPassword(newsalt, newPass, function(err, passwordHash) {

								user.systemCredentials.login.passwordHash = passwordHash.toString('base64');

								user.systemCredentials.login.salt = newsalt;
								userDao.update(user, function(err, data) {
									if (err) {
										resp.send(500, err);
										return;
									} else {
										log.silly('Password successfully changed');
										resp.send(200);
										return;
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

	var t = this;
	this.authFilter = function(req, res, next) {

		req.authenticated = false;
		req.loginName = 'Anonymous';
		req.perm={};
		var tokenId = req.cookies.securityToken;
		
		if (tokenId != null) {
			log.silly('security token found', tokenId);
			tokenDao.list({
				crits : [ {
				    op : 'eq',
				    v : tokenId,
				    f : cfg.tokenIdColumnName
				} ]
			}, function(err, tokens) {
				if (err) {
					log.error('Failed to get data from DB', err);
					next(err);
					return;
				}
				if (tokens.length == 1) {
					var token = tokens[0];
					// TODO validate IP
					var now = new Date().getTime();
					if (token.valid && req.ip == token.ip && token.touched > (now - cfg.tokenExpiration)) {
						token.touched = now;
						// TODO maybe some filtering for updates
						tokenDao.update(token, function(err, data) {
							if (err) {
								log.verbose('Failed to update security token in DB, sillently dropping', err);
							}
						})

						log.silly('Setting auth info to', token);
						req.authenticated = true;
						req.loginName = token.user;
						userDao.get(token.userId, function(err, user) {
							if (err) {
								log.error(err);
								next(err);
								return;
							}
							t.resolvePermissions(user, function(err, perm) {
								if (err) {
									log.error(err);
									next(err);
									return;
								}
								req.perm = perm;
								next();
							});
						});
						
						
					} else {
						log.verbose('Found token %s is not valid, removing cookies', tokenId, {});
						res.clearCookie(cfg.securityTokenCookie);
						res.clearCookie(cfg.loginNameCookie);
						next();
					}

				}else {
					next();
				}

			});
		} else {
			log.verbose('no security token found');
			next();
		}

	};

};

module.exports = {
	SecurityController : SecurityController
}