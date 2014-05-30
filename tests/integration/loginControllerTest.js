var expect = require('chai').expect;
var fs = require('fs.extra');
var path = require('path');
var async = require('async');
var util = require('util');
var stream = require('stream');


var universalDaoModule = require('./../../build/server/UniversalDao.js');
var mongoDriver = require('./../../build/server/mongoDriver.js');
var config = require(process.cwd() + '/build/server/config.js');

var loginControllerModule = require(process.cwd() + '/build/server/loginController.js');

var loginCtrl = null;
var _tokenDao=null;



describe('loginController', function() {

	beforeEach(function(done) {

		mongoDriver.init(config.mongoDbURI_test, function(err) {

			loginCtrl = new loginControllerModule.LoginController(mongoDriver, {
			    userCollection : 'testUser',
			    tokenCollection : 'testToken'
			});

			var _dao = new universalDaoModule.UniversalDao(mongoDriver, {
				collectionName : "testUser"
			});
			
			_tokenDao = new universalDaoModule.UniversalDao(mongoDriver, {
				collectionName : "testToken"
			});
			
			var _collection = mongoDriver.getDb().collection("testToken");
			_collection.drop(function(err,data){
				
				_collection = mongoDriver.getDb().collection("testUser");
				_collection.drop(function(err,data){
					
					var johndoe = {
							
							"loginName" : "johndoe",
							"passwordHash" : "mcHWq0FyMluy3U3nGQJeYuR6ffSDxgtG1SaejicXJvdxyM/1NUP7X5Kx3LpvsAQ+XOq8Hs+maYLiEXDQYr3OCh2o+gtTxvhEz9Z4Bem0J09v7GyxdkD2S2zED7Obr6XzPzpaxaYfmFBHRR5iy2JDRx/lAcBM1L0qFfBnoXoGYm6jcUn6Klht9xoPnYGvDVdxtjWG9GqBrLfIJb1Aot3WCPOAG0BzlidfjdG0exJhkC0eOTwgFG4D8vP/AOblI2N+skZ3ztDb6NIxRIyd70bDooUhB7HcRnJgsrqBGg68UfBReHXYFnQYYa7Fv4/mR+4y+N+SpFXokYcKUI0e6sCPcQ==",
							"salt" : "johndoe",
							"groups" : {},
							"permissions" : {
								"Registry - read" : true,
								"System User" : true,
								"Registry - write" : true
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
		reqMock.body.login = "johndoe";
		reqMock.body.password = "johndoe";

		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.cookie=function(name,value,options){
				
			}
			this.send = function(code, data) {
				expect(code).to.be.equal(200);
				
				_tokenDao.list({},function(err,data) {
					 
				 expect(data.length).to.be.equal(1);
					
					done();
				})
			};
		};
		util.inherits(resMock, require('stream').Writable);

		var res=null;
		loginCtrl.login(reqMock,  res=new resMock());
	});

	it('should create cookies for authUser', function(done) {
		var reqMock = {};
		reqMock.body = {};
		reqMock.body.login = "johndoe";
		reqMock.body.password = "johndoe";

		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.cookiesCount=0;
			this.cookie=function(name,value,options){
				this.cookiesCount++;
			}
			this.send = function(code, data) {
				expect(code).to.be.equal(200);
				
					 
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
		reqMock.body.login = "johndoe";
		reqMock.body.password = "johndoe";

		
		var logOutReqMock = {};
		logOutReqMock.cookies={};
		logOutReqMock.cookies.securityToken="";
		
		
		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.cookiesCount=0;
			this.cookie=function(name,value,options){
				if (name=="securityToken") { 
					logOutReqMock.cookies={};
					logOutReqMock.cookies.securityToken=value;
				}
				
			}
			this.send = function(code, data) {
				
				expect(code).to.be.equal(200);
				
				 loginCtrl.logout(logOutReqMock,  res=new logoutResMock()); 
			};
		};
		util.inherits
		

		var logoutResMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.removedCookieCount=0;
			
			this.clearCookie=function(cookieName){
				this.removedCookieCount++;
				
			}
			
			this.send = function(code, data) {
				expect(code).to.be.equal(200);
				 expect(this.removedCookieCount).to.be.equal(2);
					
					done();
			};
			
			
		};
		util.inherits(resMock, require('stream').Writable);
		(resMock, require('stream').Writable);

		var res=null;
		loginCtrl.login(reqMock,  res=new resMock());
		

	});
	

	it('logged user should be able to change passowrd', function(done) {
		var reqMock = {};
		reqMock.body = {};
		reqMock.body.login = "johndoe";
		reqMock.body.password = "johndoe";

		
		var changePassworReq = {};
		changePassworReq.cookies={};
		changePassworReq.cookies.securityToken="";
		changePassworReq.loginName="johndoe";
		changePassworReq.body = {};
		changePassworReq.body.currentPassword = "johndoe";
		changePassworReq.body.newPassword = "johndoe";

		
		
		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.cookiesCount=0;
			this.cookie=function(name,value,options){
				if (name=="securityToken") { 
					changePassworReq.cookies={};
					changePassworReq.cookies.securityToken=value;
				}
				
			}
			this.send = function(code, data) {
				
				expect(code).to.be.equal(200);
				
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
				
			}
			
			this.send = function(code, data) {
				expect(code).to.be.equal(200);
					done();
			};
			
			
		};
		util.inherits(changePasswordResMock, require('stream').Writable);

		var res=null;
		loginCtrl.login(reqMock,  res=new resMock());
		

	});
	

	
	
	

	it('request should touch/update token', function(done) {
		var reqMock = {};
		reqMock.body = {};
		reqMock.body.login = "johndoe";
		reqMock.body.password = "johndoe";

		
		var logOutReqMock = {};
		logOutReqMock.cookies={};
		logOutReqMock.cookies.securityToken="";
		
		
		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.cookiesCount=0;
			this.cookie=function(name,value,options){
				if (name=="securityToken") { 
					logOutReqMock.cookies={};
					logOutReqMock.cookies.securityToken=value;
				}
				
			}
			this.send = function(code, data) {
				
				expect(code).to.be.equal(200);
				
				var now=new Date().getTime();
				
				// just to be sure that updated value will be bigger
				
				setTimeout(function() {
					loginCtrl.authFilter(logOutReqMock,logoutResMock,function () {	
						
						
						_tokenDao.list({},function(err,data){
							
							expect(data.length).to.be.equal(1);
							token=data[0];
							expect(token.touched).to.be.above(now);
							expect(logOutReqMock.authenticated).to.be.true;
							done();	
							
						})
						} ); 
					}, 10);
				
				
				 
					
			};
		};
		util.inherits
		

		var logoutResMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.removedCookieCount=0;
			
			this.clearCookie=function(cookieName){
				this.removedCookieCount++;
				
			}
			
			this.send = function(code, data) {
				expect(code).to.be.equal(200);
				 expect(this.removedCookieCount).to.be.equal(2);
					
				
			};
			
			
		};
		util.inherits(resMock, require('stream').Writable);
		(resMock, require('stream').Writable);

		var res=null;
		loginCtrl.login(reqMock,  res=new resMock());
	});
	

});
