var universalDaoModule = require('./../../build/server/UniversalDao.js');
var mongoDriver = require('./../../build/server/mongoDriver.js');
var config = require('./../../build/server/config.js');



console.log('initializing data');

mongoDriver.init(config.mongoDbURI, function(err) {
	if (err) {
		throw err;
	}

	console.log(mongoDriver.getDb);

	var _dao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : "people"
	});

	_collection = mongoDriver.getDb().collection("people");

	_collection.drop();
	_collection.ensureIndex({
		"systemCredentials.login.loginName" : 1
	},{
		unique : true,
		sparse : true
	},function(err) {
		if (err){ 
			console.log(err);
		}
		
		var johndoe = {
			"systemCredentials": {
				"login": {
					"loginName" : "johndoe",
					"passwordHash" : "mcHWq0FyMluy3U3nGQJeYuR6ffSDxgtG1SaejicXJvdxyM/1NUP7X5Kx3LpvsAQ+XOq8Hs+maYLiEXDQYr3OCh2o+gtTxvhEz9Z4Bem0J09v7GyxdkD2S2zED7Obr6XzPzpaxaYfmFBHRR5iy2JDRx/lAcBM1L0qFfBnoXoGYm6jcUn6Klht9xoPnYGvDVdxtjWG9GqBrLfIJb1Aot3WCPOAG0BzlidfjdG0exJhkC0eOTwgFG4D8vP/AOblI2N+skZ3ztDb6NIxRIyd70bDooUhB7HcRnJgsrqBGg68UfBReHXYFnQYYa7Fv4/mR+4y+N+SpFXokYcKUI0e6sCPcQ==",
					"email": "root@localhost",
					"salt" : "johndoe" 
					 
				},
				"permissions" : {"Security - read":true, "Security - write":true, "Registry - read" : true ,  "System User" : true , "Registry - write" : true, "System Admin":true },
				"groups" : { },
				"profiles":["profile1"]
			}
		};



		_dao.save(johndoe,function (err,data){ console.log ('User saved')});
		
		var janedoe = {
			"systemCredentials": {
				"login": {
					"loginName" : "janedoe",
					"passwordHash" : "mcHWq0FyMluy3U3nGQJeYuR6ffSDxgtG1SaejicXJvdxyM/1NUP7X5Kx3LpvsAQ+XOq8Hs+maYLiEXDQYr3OCh2o+gtTxvhEz9Z4Bem0J09v7GyxdkD2S2zED7Obr6XzPzpaxaYfmFBHRR5iy2JDRx/lAcBM1L0qFfBnoXoGYm6jcUn6Klht9xoPnYGvDVdxtjWG9GqBrLfIJb1Aot3WCPOAG0BzlidfjdG0exJhkC0eOTwgFG4D8vP/AOblI2N+skZ3ztDb6NIxRIyd70bDooUhB7HcRnJgsrqBGg68UfBReHXYFnQYYa7Fv4/mR+4y+N+SpFXokYcKUI0e6sCPcQ==",
					"email": "root@localhost",
					"salt" : "johndoe" 
				},
				"permissions" : {"Security - read":true, "Security - write":true, "Registry - read" : true ,  "System User" : true , "Registry - write" : true, "System Admin":true },
				"groups" : { },
				"profiles":["profile1","profile12"]
			}
		};
		_dao.save(janedoe,function (err,data){ console.log ('User saved'); process.exit(0);});
	});


});
