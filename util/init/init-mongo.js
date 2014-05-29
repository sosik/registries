var universalDaoModule = require('./../../build/server/UniversalDao.js');
var mongoDriver = require('./../../build/server/mongoDriver.js');
var config = require('./../../build/server/config.js');



console.log('test');

mongoDriver.init(config.mongoDbURI, function(err) {
	if (err) {
		throw err;
	}

	console.log(mongoDriver.getDb);

	var _dao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : "user"
	});

	_collection = mongoDriver.getDb().collection("user");

	_collection.drop();
	_collection.ensureIndex({
		login : 1
	}, {
		unique : true
	}, function(err) {
		if (err){ 
			console.log(err);
		}
		
		var johndoe = {
				
				"loginName" : "johndoe",
				"passwordHash" : "mcHWq0FyMluy3U3nGQJeYuR6ffSDxgtG1SaejicXJvdxyM/1NUP7X5Kx3LpvsAQ+XOq8Hs+maYLiEXDQYr3OCh2o+gtTxvhEz9Z4Bem0J09v7GyxdkD2S2zED7Obr6XzPzpaxaYfmFBHRR5iy2JDRx/lAcBM1L0qFfBnoXoGYm6jcUn6Klht9xoPnYGvDVdxtjWG9GqBrLfIJb1Aot3WCPOAG0BzlidfjdG0exJhkC0eOTwgFG4D8vP/AOblI2N+skZ3ztDb6NIxRIyd70bDooUhB7HcRnJgsrqBGg68UfBReHXYFnQYYa7Fv4/mR+4y+N+SpFXokYcKUI0e6sCPcQ==",
				"email": "root@localhost",
				"salt" : "johndoe" ,
				"groups" : { } ,
				 "permissions" : { "Registry - read" : true ,  "System User" : true , "Registry - write" : true }
					 	
				 };
		
		_dao.save(johndoe,function (err,data){ console.log ('User saved'); process.exit(0)});
		
		
	});


});
