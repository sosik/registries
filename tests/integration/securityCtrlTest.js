/*jslint node: true */
var expect = require('chai').expect;
var fs = require('fs.extra');

var util = require('util');
var stream = require('stream');

var universalDaoModule = require('./../../build/server/UniversalDao.js');
var mongoDriver = require('./../../build/server/mongoDriver.js');
var config = require(  './../../build/server/config.js');

var loginControllerModule = require('./../../build/server/securityController.js');

var loginCtrl=null;
var _tokenDao=null;


describe('SecurityCtrl', function() {

	beforeEach(function(done) {

		mongoDriver.init(config.mongoDbURI_test, function(err) {

			expect(err).to.be.null();

			loginCtrl = new loginControllerModule.SecurityController(mongoDriver, {
				userCollection : 'people',
				tokenCollection : 'token'
			});

			var _dao = new universalDaoModule.UniversalDao(mongoDriver, {
				collectionName : 'people'
			});

			_tokenDao = new universalDaoModule.UniversalDao(mongoDriver, {
				collectionName : 'token'
			});

			var _collection = mongoDriver.getDb().collection('token');
			_collection.drop(function(err,data){

				_collection = mongoDriver.getDb().collection('people');
				_collection.drop(function(err,data){

					var johndoe = {
						systemCredentials:{
							login:{
								'loginName' : 'johndoe',
								'passwordHash' : 'mcHWq0FyMluy3U3nGQJeYuR6ffSDxgtG1SaejicXJvdxyM/1NUP7X5Kx3LpvsAQ+XOq8Hs+maYLiEXDQYr3OCh2o+gtTxvhEz9Z4Bem0J09v7GyxdkD2S2zED7Obr6XzPzpaxaYfmFBHRR5iy2JDRx/lAcBM1L0qFfBnoXoGYm6jcUn6Klht9xoPnYGvDVdxtjWG9GqBrLfIJb1Aot3WCPOAG0BzlidfjdG0exJhkC0eOTwgFG4D8vP/AOblI2N+skZ3ztDb6NIxRIyd70bDooUhB7HcRnJgsrqBGg68UfBReHXYFnQYYa7Fv4/mR+4y+N+SpFXokYcKUI0e6sCPcQ==',
								'salt' : 'johndoe',
								'groups' : {},
								'email':'nobody@anybody.sk'

							},
							permissions : {
									'Registry - read' : true,
									'Registry - write' : true,
									'System User':true
							},
							profiles:[]

						}

						};

						_dao.save(johndoe, function(err, data) {
							done(err);

						});

					});


			});
		});

	});


	afterEach(function(done) {
		mongoDriver.getDb().dropDatabase(function(err) {
			if (err) {
				console.error('Failed to drop database:' + config.mongoDbURI_test);
				throw new Error('Failed to remove database');
			}

			done();
		});
	});

	it('should apply provided configuration', function(done) {

		var reqMock = {};
		reqMock.body = {};
		reqMock.body.login = 'johndoe';
		reqMock.body.password = 'johndoe';

		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.cookie=function(name,value,options){

			};
			this.json = function(data) {
				console.log(data);
				_tokenDao.list({},function(err,data) {

					expect(data.length).to.be.equal(1);

					done();
				});
			};
		};
		util.inherits(resMock, require('stream').Writable);

		var res=null;
		loginCtrl.login(reqMock,  res=new resMock(),function(err){expect(err).to.be.null();});
	});

	it('should create cookies for authUser', function(done) {
		var reqMock = {};
		reqMock.body = {};
		reqMock.body.login = 'johndoe';
		reqMock.body.password = 'johndoe';

		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.cookiesCount=0;
			this.cookie=function(name,value,options){
				this.cookiesCount++;
			};
			this.json = function( data) {
				expect(this.cookiesCount).to.be.equal(2);
				done();
			};
		};
		util.inherits(resMock, require('stream').Writable);

		var res=null;
		loginCtrl.login(reqMock,  res=new resMock());

	});

	it('logout should remove cookies', function(done) {
		var reqMock = {};
		reqMock.body = {};
		reqMock.body.login = 'johndoe';
		reqMock.body.password = 'johndoe';

		var logOutReqMock = {};
		logOutReqMock.cookies={};
		logOutReqMock.cookies.securityToken='';


		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.cookiesCount=0;
			this.cookie=function(name,value,options){
				if (name=='securityToken') {
					logOutReqMock.cookies={};
					logOutReqMock.cookies.securityToken=value;
				}

			};
			this.json = function( data) {

				loginCtrl.logout(logOutReqMock,  res=new logoutResMock(),function(err){expect(err).to.be.null();});
			};
		};


		var logoutResMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.removedCookieCount=0;

			this.clearCookie=function(cookieName){
				this.removedCookieCount++;

			};

			this.json = function( data) {
				expect(this.removedCookieCount).to.be.equal(2);
				done();
			};
		};
		util.inherits(resMock, require('stream').Writable);
		// (resMock, require('stream').Writable);

		var res=null;
		loginCtrl.login(reqMock,  res=new resMock());


	});


	it('logged user should be able to change passowrd', function(done) {
		var reqMock = {};
		reqMock.body = {};
		reqMock.body.login = 'johndoe';
		reqMock.body.password = 'johndoe';


		var changePassworReq = {};
		changePassworReq.cookies={};
		changePassworReq.cookies.securityToken='';
		changePassworReq.loginName='johndoe';
		changePassworReq.body = {};
		changePassworReq.body.currentPassword = 'johndoe';
		changePassworReq.body.newPassword = 'johndoe';



		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.cookiesCount=0;
			this.cookie=function(name,value,options){
				if (name=='securityToken') {
					changePassworReq.cookies={};
					changePassworReq.cookies.securityToken=value;
				}

			};
			this.json = function( data) {
				loginCtrl.changePassword(changePassworReq,  res=new changePasswordResMock());
			};
		};
		util.inherits(resMock, require('stream').Writable);


		var changePasswordResMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.removedCookieCount=0;

			this.clearCookie=function(cookieName){
				this.removedCookieCount++;

			};

			this.json = function(data) {
				done();
			};


		};
		util.inherits(changePasswordResMock, require('stream').Writable);

		var res=new resMock();
		loginCtrl.login(reqMock,  res);

	});


	it('request should touch/update token', function(done) {
		var token;
		var reqMock = {};
		reqMock.body = {};
		reqMock.body.login = 'johndoe';
		reqMock.body.password = 'johndoe';
		reqMock.ip="10.0.0.10";


		var logOutReqMock = {};
		logOutReqMock.cookies={};
		logOutReqMock.cookies.securityToken='';
		logOutReqMock.ip="10.0.0.10";


		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.cookiesCount=0;
			this.cookie=function(name,value,options){
				if (name=='securityToken') {
					logOutReqMock.cookies={};
					logOutReqMock.cookies.securityToken=value;
				}

			};
			this.json = function(data) {
				var now=new Date().getTime();

				// just to be sure that updated value will be bigger
				loginCtrl.authFilter(logOutReqMock,logoutResMock,function (err) {
					// expect(err).to.be.null();
					setTimeout(function() {
						_tokenDao.list({},function(err,data){
							expect(data.length).to.be.equal(1);
							token=data[0];
							expect(token.touched).to.be.above(now);
							expect(logOutReqMock.authenticated).to.be.true();
							done();
						});
					}, 10);
				} );

			};
		};


		var logoutResMock = new function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.removedCookieCount=0;

			this.clearCookie=function(cookieName){
				this.removedCookieCount++;

			};

			this.json = function( data) {
				expect(this.removedCookieCount).to.be.equal(2);
			};
		}();

		util.inherits(resMock, require('stream').Writable);
		// (resMock, require('stream').Writable);

		var res=null;

		loginCtrl.login(reqMock,  new resMock(),function(err){expect(err).to.be.null();});
		});

	it('should generate forgotten token',function(done){
		// loginCtrl.forgottenReset

		var reqMock = {};
		reqMock.body = {};
		reqMock.body.email = 'nobody@anybody.sk';
		reqMock.body.captcha = {challenge:'ch',response:'res'};

		reqMock.headers={};
		reqMock.connection={remoteAddress:"10.0.0.1"};

		var resMock = new function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';

			this.json = function (data) {
				done();

			};
			// this.send = function(code, data) {
			// };
		}();

		loginCtrl.verifyCaptcha=function (captcha,cb){
			expect(captcha.challenge).to.be.equal('ch');
			expect(captcha.response).to.be.equal('res');
			cb(true,null);
		};

		loginCtrl.sendForgottenPasswordMail= function(email,tokenId,user,serviceUrl) {
			expect(email).to.be.equal(reqMock.body.email);
			expect(tokenId).to.be.not.null();
			expect(user).to.be.not.null();
			expect(serviceUrl).to.be.not.null();

		};

		loginCtrl.forgottenToken(reqMock,resMock,function(err){done(err)});

	});


	it('generated forgotten token can be used to reset password',function(done){
		// loginCtrl.forgottenReset

		var reqMock = {};
		reqMock.body = {};
		reqMock.body.email = 'nobody@anybody.sk';
		reqMock.body.captcha = {challenge:'ch',response:'res'};

		reqMock.headers={};
		reqMock.connection={remoteAddress:"10.0.0.1"};
		var tokenId=null;

		var resMock = new function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';


			this.json = function(data) {
				// done();
				var req={params:{tokenId:tokenId}};
				var resp=new function(){
					this.json=function(){
						done();
					};
				};

				loginCtrl.forgottenReset(req,resp,function(err){expect(err).to.be.null();});
			};
		};

		loginCtrl.verifyCaptcha=function (captcha,cb){
			expect(captcha.challenge).to.be.equal('ch');
			expect(captcha.response).to.be.equal('res');
			cb(true,null);
		};

		loginCtrl.sendResetPasswordMail=function(email,randomPass,user,webserverPublicUrl){
			expect(email).to.be.equal(reqMock.body.email);

			expect(randomPass).to.be.not.null();
			console.log('new pass',randomPass);
			expect(user).to.be.not.null();
			expect(webserverPublicUrl).to.be.not.null();
		};

		loginCtrl.sendForgottenPasswordMail= function(email,_tokenId,user,serviceUrl) {
			console.log('sendForgottenPasswordMail');
			expect(email).to.be.equal(reqMock.body.email);
			expect(_tokenId).to.be.not.null();
			tokenId=_tokenId;
			expect(user).to.be.not.null();
			expect(serviceUrl).to.be.not.null();

		};

		loginCtrl.forgottenToken(reqMock,resMock,function(err){done(err)});

	});



});
