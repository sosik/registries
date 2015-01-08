'use strict';

var extend = require('extend');
var crypto = require('crypto');
var uuid = require('node-uuid');
var nodemailer = require('nodemailer');


var log = require('./logging.js').getLogger('securityController.js');
var QueryFilter = require('./QueryFilter.js');
var renderModule = require('./renderService.js');
var universalDaoModule = require('./UniversalDao.js');

var DEFAULT_CFG = {
	userCollection : 'people',
	profileCollection: 'securityProfiles',
	loginColumnName : 'systemCredentials.login.loginName',
	groupCollection : 'groups',
	tokenCollection : 'token',
	tokenIdColumnName : 'tokenId',
	securityTokenCookie : 'securityToken',
	loginNameCookie : 'loginName',
	profileCookie : 'profile',
	tokenExpiration : 3600000,
	generatedPasswordLen : 8
};

//

var transport = nodemailer.createTransport('Sendmail');

var SecurityController = function(mongoDriver, schemaRegistry, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	var userDao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : cfg.userCollection
	});

	var profileDao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : cfg.profileCollection
	});

	var renderService = new renderModule.RenderService();


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

		resp.status(200).json(result);
	};


	this.getProfiles = function(req, resp) {

		profileDao.list({},function(err,data){
			if (err){
				resp.status(500).send(err);
				return;
			}
			resp.status(200).json(data);
		});
	};

	this.getUserPermissions = function(req, resp) {

		var userId = req.url.substring(18);

		userDao.get(userId, function(err, user) {

			if (err) {
				resp.status(500).send(err);
				log.warn('getUserPermissions',userId,err);
			} else {
				var userRes = {};
				userRes.loginName = user.systemCredentials.loginName;
				var permissions = [];

				for ( var per in user.systemCredentials.permissions) {
					if (user.systemCredentials.permissions[per]) {
						permissions.push(per);
					}
				}
				userRes.permissions = permissions;
				log.verbose('getUserPermissions result',userId,permissions);
				resp.status(200).json(userRes);
			}

		});

	};

	this.getUserGroups = function(req, resp) {

		var userId = req.url.substring(18, req.url.lenght);

		userDao.get(userId, function(err, user) {

			if (err) {
				resp.send(500, err);
				log.warn('getUserGroups',userId,err);
			} else {
				var userRes = {};
				userRes.loginName = user.systemCredentials.loginName;
				var groups = [];

				for ( var gr in user.systemCredentials.groups) {
					groups.push(gr);
				}
				userRes.groups = groups;
				resp.status(200).json(userRes);
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
	};

	this.updateUserSecurity = function(req, resp) {

		var userId = req.body.userId;
		userDao.get(userId, function(err, user) {

			if (err) {
				resp.status(500).send(err);
				log.warn('updateUserSecurity',userId,err);
			} else {

				if (!user.systemCredentials) {
					user.systemCredentials = {};
				}


				if (!user.systemCredentials.login) {
					user.systemCredentials.login = {};
				}

				if (!('profiles' in user.systemCredentials)) {
					user.systemCredentials.profiles = {};
				}


				if ('profiles' in req.body){
					user.systemCredentials.profiles=req.body.profiles;
				}

				log.verbose('updating users security of', user.systemCredentials.login.loginName);

				user.systemCredentials.login.loginName=req.body.loginName;
				user.systemCredentials.login.email=req.body.email;

				userDao.update(user, function(err) {
					if (err) {
						resp.status(500).send(err);
						log.warn('updateUserSecurity',userId,err);
					} else {
						log.info('updateUserSecurity updated',userId);
						resp.send(200);
					}

				});

			}

		});

	};

this.updateSecurityProfile = function(req, resp) {

		var profileId = req.body.profileId;
		profileDao.get(profileId, function(err, profile) {

			if (err) {
				resp.status(500).send(err);
				log.warn('updateProfileSecurity',profileId,err);
			} else {

				var defaultObj = schemaRegistry.createDefaultObject('uri://registries/security#permissions');

				if (!('security' in profile)) {
					profile.security = {};
				}

				if (!('permissions' in profile.security)) {
					profile.security.permissions = {};
				}

				delete profile.security.groups;

				if (!profile.security.groups) {
					profile.security.groups = [];
				}

				for ( var per in defaultObj) {
					profile.security.permissions[per] = (hasPermission(req.body.permissions, per)?true:null);
				}

				req.body.groups.map(function(group) {
					profile.security.groups.push({
						id : group.id
					});
				});

				if (profile.security.groups.length === 0) {
					profile.security.groups = null;
				}

				log.verbose('updating profiles security of', profile.baseData.name);

				profile.baseData={};
				profile.baseData.name=req.body.profileName;


				profile.security.forcedCriteria=[];

				if ('criteria' in req.body){
					req.body.criteria.map(function(cc){
						var schemaCrit= getSchemaCrit(profile.security.forcedCriteria,cc.schema);
						schemaCrit.criteria.push({f:cc.f,op:cc.op,v:cc.v,obj:cc.obj});
					});
				}

				log.verbose('updating profile',profile);
				profileDao.update(profile, function(err) {
					if (err) {
						resp.status(500).send(err);
						log.warn('updateprofileSecurity',profileId,err);
					} else {
						log.info('updateprofileSecurity updated',profileId);
						resp.send(200);
					}
				});

			}

		});

	};
	function getSchemaCrit (forced,schema){
		var found= null;

		forced.map(function(f){
			if (f.applySchema==schema){
				found = f;
			}
		});

		if (!found){
			found={applySchema:schema, criteria:[]};
			forced.push(found);
		}
		return found;
	}
	function checkPresentSchemaCrits(criteria,schema){
		for(var crit in criteria){
			if (criteria[crit].schema===schema){
				return true;
			}
		}
		return false;
	}

	this.getSearchSchemas=function(req,resp){
		resp.status(200).json(schemaRegistry.getSchemaNamesBySuffix('search'));
	};

	this.updateGroupSecurity = function(req, resp) {

		var groupId = req.body.oid;
		groupDao.get(groupId, function(err, group) {

			if (err) {
				resp.status(500).send(err);
				log.warn('updateGroupSecurity',groupId,err);
			} else {

				var defaultObj = schemaRegistry.createDefaultObject('uri://registries/security#permissions');

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
				groupDao.update(group, function(err) {
					if (err) {
						resp.status(500).send(err);
						log.warn('Group update failed',groupId,err);
					} else {
						resp.send(200);
						log.info('Security group updated',groupId);
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
		log.debug('login atempt', req.body.login);

		var t = this;

		userDao.list(QueryFilter.create().addCriterium(cfg.loginColumnName, QueryFilter.operation.EQUAL, req.body.login), function(err, data) {
			if (err) {
				log.warn('Failed to list users from DB', err);
				resp.send(500, err);
				return;
			}


			if (data.length !== 1) {
				log.warn('Found more or less then 1 user with provided credentials', data.length);
				resp.status(500).send( 'users found ' + data.length);
				return;
			}

			// we are sure there is exactly one user
			var user = data[0];

			t.verifyUserPassword(user, req.body.password, function(err) {
				if (err) {
					log.debug('Password verification failed', err);
					resp.status(500).send('Not authenticated.');
					return;
				}

				t.resolvePermissions(user,req.selectedProfileId,function (err,permissions){

					if (err) {
						log.warn('Failed to resolvePermissions permissions', err);
						resp.status(500).send('Internal Error');
						return;
					}
					// if ('System User' in  permissions&&permissions['System User'] ){
						t.createToken(user.systemCredentials.login.loginName, req.ip, function(token) {
							t.storeToken(token, user.id,user.systemCredentials.login.loginName, req.ip, function(err) {
								if (err) {
									log.error('Failed to store login token', err);
									resp.status(500).send('Internal Error');
									return;
								}
								t.setCookies(resp, token, user.systemCredentials.login.loginName);
								log.info('user logged in',user.id);

								t.resolveProfiles(user,function(err,u){
									if (err) {
										resp.send(500,err);
										return;
									}

									resp.status(200).json(deflateUser(u,permissions));
								});

								return;
							});
						});

					// }
					// else {
					// 	log.warn('Not system user ',user.systemCredentials.login.loginName);
					// 	resp.send(403, securityService.missingPermissionMessage('System User'));
					// }
				});

			});
		});
	};

	this.selectProfile=function(req,resp){

		log.silly('Selecting profile or user', req.loginName,req.body.profileId);
		if (!req.loginName) {
			resp.status(500).send('User must be logged in for password change');
			throw 'User must be logged in for password change';
		}

		var t = this;
		userDao.list(QueryFilter.create().addCriterium(cfg.loginColumnName, QueryFilter.operation.EQUAL, req.loginName), function(err, users) {

			if (err) {
				resp.status(500).send(err);
				log.debug('selectProfile',err);
				return;
			}

			if (users.length != 1) {
				resp.status(500).send('user not found');
				log.debug('selectProfile', 'user not found');
				return;
			}

			var user= users[0];
			if (!('profiles' in user.systemCredentials)){
				resp.status(500).send( 'user has no profiles');
				return;
			}

			if (user.systemCredentials.profiles.indexOf(req.body.profileId)<0){
				resp.status(500).send( 'user has no profiles');
				return;
			}

			t.setProfileCookie(resp,req.body.profileId);
			resp.sendStatus(200);

		});

	};

	this.resolveProfiles=function (user,callback){

		profileDao.list({},function(err,data){

			if (err){
				callback(err);
				return;
			}

			var profiles=[];


			user.systemCredentials.profiles.map(function(profileId){
				data.map(function(pr){
					if (pr.id===profileId){
						profiles.push({id:profileId,name:pr.baseData.name});
					}
				});
			});

			user.systemCredentials.profiles=profiles;
			callback(null,user);

		});

	};

	//Traverses groups and collects permission, finally user permissions added.
	this.resolvePermissions = function(user,selectedProfileId, callback) {

		if (!user){
			callback(null,[]);
			return;
		}
		var t = this;
		if (!selectedProfileId){
			callback(null,[]);
			return;
		}

		profileDao.get(selectedProfileId,function(err,profile){
			if (err){
				callback(err);
				log.error('resolvePermissions',err);
					return;
			}
			if (!profile){
				callback(null,{});
				return;
			}
			log.silly('profile to resolve security',profile);

			if (!('security' in profile)) {
					callback(null,{});
				return;
			}
			var permissions = {};

				// if has no groups
			if (!profile.security.groups || profile.security.groups.length === 0) {
				if (profile.security.permissions) {
					for ( var per in profile.security.permissions) {
						if (profile.security.permissions[per] === true) {
							permissions[per] = true;
						}
					}
				}
				log.verbose('user permissions resolved',permissions);
				callback(null, permissions,profile);
				return;
			}

				groupDao.list({}, function(err, groups) {
					if (err) {
						callback(err);
						return;
					}
					//resolve groups
					for ( var gr in profile.security.groups) {
						t.resolveGroupPermissions(profile.security.groups[gr].id, groups, permissions);
					}

					//merge user rights
					if (profile.security.permissions) {
						for ( var per in profile.security.permissions) {
							if (profile.security.permissions[per] === true) {
								permissions[per] = true;
							}
						}
					}
					log.verbose('profile permissions resolved',permissions);
					callback(null, permissions,profile);
				});

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
			this.resolveGroupPermissions(gr.baseData.parent.oid, allgroups, permissions);
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
		//FIXME use userId
		userDao.list(QueryFilter.create().addCriterium(cfg.loginColumnName, QueryFilter.operation.EQUAL, req.loginName), function(err, data) {
			if (err) {
				resp.status(500).send(err);
				log.warn('getCurrentUser', err);
				return;
			}

			if (data.length !== 1) {
				log.verbose('Found more or less then 1 user with provided credentials', data.length);
				resp.status(500).send('users found ' + data.length);
				return;
			}
			var user = data[0];
			t.resolvePermissions(user,req.selectedProfileId, function(err, permissions) {
				if (err) {
					resp.status(500).send(err);
					return;
				}
				log.verbose('getCurrentUser result',deflateUser(user,permissions));
				resp.status(200).send(deflateUser(user,permissions));
			});
		});
	};
	/**
	* Minimalistic version of user return
	*/
	function deflateUser(user,permissions){
		log.silly(permissions);
		return {id:user.id,systemCredentials:{login:{loginName:user.systemCredentials.login.loginName},permissions:permissions,profiles:user.systemCredentials.profiles||[]}};
	}

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

			if(!hashPass){
				log.error('Failed to hash password for',user, passwordSample);
				callback(new Error('Failed to hash password'));
				return;
			}

			if (user.systemCredentials.login.passwordHash === hashPass.toString('base64')) {
				callback(null);
			} else {
				log.debug('Password does not match stored password',user.systemCredentials.login.loginName);
				callback(new Error('Password does not match'));
			}
		});
	};

	this.createToken = function(user, ip, callback) {
		callback(uuid.v4());
	};

	this.storeToken = function(tokenId, userId, user, ip, callback) {

		var now = new Date().getTime();
		var token = {
				tokenId : tokenId,
				userId : userId,
				user : user,
				ip : ip,
				created : now,
				valid : true,
				touched : now
		};

		log.verbose('Storing security token', token);
		tokenDao.save(token, callback);

	};

	this.setCookies = function(resp, token, loginName) {

		resp.cookie(cfg.securityTokenCookie, token, {
				httpOnly : true,
				secure : process.env.NODE_ENV != 'test'
		});
		resp.cookie(cfg.loginNameCookie, loginName, {
			httpOnly : false
		});
		log.verbose('setCookies',loginName );
	};

	this.setProfileCookie = function(resp, profile) {

		resp.cookie(cfg.profileCookie, profile, {
				httpOnly : true,
				secure : process.env.NODE_ENV != 'test'
		});

		log.verbose('setProfileCookie',profile );
	};


	this.logout = function(req, resp) {

		var tokenId = req.cookies.securityToken;

		if (tokenId !== null) {

			tokenDao.list({
				crits : [ {
						op : 'eq',
						v : tokenId,
						f : cfg.tokenIdColumnName
				} ]
			}, function(err, tokens) {

				if (err) {
					resp.status(500).send(err);

				} else {

					if (tokens.length > 0) {
						var token = tokens[0];
						token.valid = false;

						tokenDao.update(token, function(err) {
							if (err) {
								log.error('Failed to update security token', err);
								resp.status(500).send( err);
								return;
							}

							resp.clearCookie(cfg.securityTokenCookie);
							resp.clearCookie(cfg.loginNameCookie);
							log.info('user log out ',token.user);
							resp.send(200);
						});

					} else {
						resp.status(500).send('Token does not exist.');
						log.debug('logout','Token does not exist.',tokenId);
						return;
					}

				}

			});
		} else {
			resp.status(500).send('SecurityToken missings.');
			log.debug('logout','SecurityToken missings.',tokenId);
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
				resp.status(500).send(err);
				log.error('resetPassword',err);
				throw err;
			}

			var randomPass = t.generatePassword();
			var newsalt = t.generatePassword();

			var user = data;
			if (user.systemCredentials.login.email) {

				t.hashPassword(newsalt, randomPass, function(err, passwordHash) {

					user.systemCredentials.login.passwordHash = passwordHash.toString('base64');

					user.systemCredentials.login.salt = newsalt;

					userDao.update(user, function(err) {
						if (err) {
							resp.status(500).send(err);
						}

						log.info('User password reset',user.systemCredentials.login);
						// FIXME make mail address field as configurable
						// parameter
						t.sendResetPasswordMail(user.systemCredentials.login.email,randomPass,user,cfg.webserverPublicUrl);

						resp.status(200).json({email:user.systemCredentials.login.email});
					});
				});

			} else {
				log.debug('resetPassword',  'User mail not specified',user.systemCredentials.login );
				resp.status(500).send('User mail not specified.');
			}

		});

	};

	this.sendResetPasswordMail = function(email, newPass,user,serviceUrl) {

		var userName=user.systemCredentials.login.loginName;

		var mailOptions = {
			from : 'websupport@unionsoft.sk',
			to : email,
			subject : '[Registry] Your new password ',
			text : renderService.render(renderModule.templates.MAIL_USER_PASSWORD_RESET,{'userName':userName,'userPassword':newPass,'serviceUrl':serviceUrl})
		};
//		html : '<h3>New Password</h3><h4> Your new password is: <b>' + newPass + ' </b> </h4>'

		log.verbose('Sending mail ', mailOptions);

		transport.sendMail(mailOptions);

	};

	/**
	 * method should be used to re-generate new password for user Method should
	 * be used by authorized person ( no 'accidental' password resets)
	 */
	this.changePassword = function(req, resp) {
		log.silly('Changing password for user', req.loginName);
		if (!req.loginName) {
			resp.status(500).send('User must be logged in for password change');
			throw 'User must be logged in for password change';
		}

		var t = this;
		userDao.list(QueryFilter.create().addCriterium(cfg.loginColumnName, QueryFilter.operation.EQUAL, req.loginName), function(err, data) {

			if (err) {
				resp.status(500).send(err);
			} else {

				if (data.length != 1) {
					resp.status(500).send('user not found');
					return;
				} else {
					var user = data[0];
					t.verifyUserPassword(user, req.body.currentPassword, function(err) {
						if (err) {
							log.debug('Old passwrod does not match!');
							resp.status(500).send('Old password does not match!');
							return;
						} else {

							var newPass = req.body.newPassword;
							var newsalt = t.generatePassword();

							t.hashPassword(newsalt, newPass, function(err, passwordHash) {
								user.systemCredentials.login.passwordHash = passwordHash.toString('base64');
								user.systemCredentials.login.salt = newsalt;
								userDao.update(user, function(err) {
									if (err) {
										resp.status(500).send(err);
										return;
									} else {
										log.info('Password successfully changed',user.systemCredentials.login.loginName);
										resp.send(200);
										return;
									}
								});
							});
						}
					});
				}
			}
		});

	};

	this.generatePassword = function () {
		var length = cfg.generatedPasswordLen, charset = 'abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', retVal = '';

		for (var i = 0, n = charset.length; i < length; ++i) {
			retVal += charset.charAt(Math.floor(Math.random() * n));
		}

		return retVal;
	};

	this.hashPassword = function(salt, password, callback) {
		crypto.pbkdf2(password, salt.toString('base64'), 1000, 256, callback);
	};

	var t = this;
	this.authFilter = function(req, res, next) {

		req.authenticated = false;
		req.loginName = 'Anonymous';
		req.perm={};
		var tokenId = req.cookies[cfg.securityTokenCookie];

		log.silly('Cookies received', req.cookies);

		if (tokenId !== null) {
			log.debug('security token found', tokenId);
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
				if (tokens.length === 1) {
					var token = tokens[0];
					// TODO validate IP
					var now = new Date().getTime();
					if (token.valid && req.ip === token.ip && token.touched > (now - cfg.tokenExpiration)) {
						token.touched = now;
						// TODO maybe some filtering for updates
						tokenDao.update(token, function(err) {
							if (err) {
								log.debug('Failed to update security token in DB, sillently dropping', err);
							}
						});

						log.silly('Setting auth info to', token);
						req.authenticated = true;
						req.loginName = token.user;

						userDao.get(token.userId, function(err, user) {
							if (err||user===null) {
								log.error(err);
								next(err);
								return;
							}
							req.currentUser=user;

							user.systemCredentials.profiles.map(function(profileId){
								if (profileId==req.cookies[cfg.profileCookie]) {
									req.selectedProfileId = profileId;
								}
								log.debug('profile set to' , profileId);
							});




							t.resolvePermissions(user,req.selectedProfileId, function(err, perm,profile) {
								if (err) {
									log.error(err);
									next(err);
									return;
								}
								req.perm = perm;
								req.profile = profile;
								next();
							});
						});

					} else {
						log.debug('authFilter','Found token %s is not valid, removing cookies', tokenId, {});
						res.clearCookie(cfg.securityTokenCookie);
						res.clearCookie(cfg.loginNameCookie);
						next();
					}

				}else {
					next();
				}

			});
		} else {
			log.debug('authFilter','no security token found');
			next();
		}

	};

};

module.exports = {
	SecurityController : SecurityController
};
