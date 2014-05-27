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

		mongoDriver.init(config.mongoDbURI, function(err) {

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
			_collection.drop();

			_collection = mongoDriver.getDb().collection("testUser");
			_collection.drop();

			var johndoe = {

			    "loginName" : "johndoe",
			    "passwordHash" : new Buffer( JSON.parse( "[ 153, 193, 214, 171, 65, 114, 50, 91, 178, 221, 77, 231, 25, 2, 94, 98, 228, 122, 125, 244, 131, 198, 11, 70, 213, 38, 158, 142, 39, 23, 38, 247, 113, 200, 207, 245, 53, 67, 251, 95, 146, 177, 220, 186, 111, 176, 4, 62, 92, 234, 188, 30, 207, 166, 105, 130,			            226, 17, 112, 208, 98, 189, 206, 10, 29, 168, 250, 11, 83, 198, 248, 68, 207, 214, 120, 5, 233, 180, 39, 79, 111, 236, 108, 177, 118,			            64, 246, 75, 108, 196, 15, 179, 155, 175, 165, 243, 63, 58, 90, 197, 166, 31, 152, 80, 71, 69, 30, 98, 203, 98, 67, 71, 31, 229, 1,			            192, 76, 212, 189, 42, 21, 240, 103, 161, 122, 6, 98, 110, 163, 113, 73, 250, 42, 88, 109, 247, 26, 15, 157, 129, 175, 13, 87, 113,			            182, 53, 134, 244, 106, 129, 172, 183, 200, 37, 189, 64, 162, 221, 214, 8, 243, 128, 27, 64, 115, 150, 39, 95, 141, 209, 180, 123, 18,			            97, 144, 45, 30, 57, 60, 32, 20, 110, 3, 242, 243, 255, 0, 230, 229, 35, 99, 126, 178, 70, 119, 206, 208, 219, 232, 210, 49, 68, 140,			            157, 239, 70, 195, 162, 133, 33, 7, 177, 220, 70, 114, 96, 178, 186, 129, 26, 14, 188, 81, 240, 81, 120, 117, 216, 22, 116, 24, 97,			            174, 197, 191, 143, 230, 71, 238, 50, 248, 223, 146, 164, 85, 232, 145, 135, 10, 80, 141, 30, 234, 192, 143, 113 ]")),
			    "salt" : "johndoe",
			    "groups" : {},
			    "permissions" : {
			        "Registry - read" : true,
			        "System User" : true,
			        "Registry - write" : true
			    }

			};

			_dao.save(johndoe, function(err, data) {
				
				if (err) console.log(err);
				done();
			});

		});

	});

	afterEach(function(done) {
		done();
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
