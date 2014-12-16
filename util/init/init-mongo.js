var universalDaoModule = require('./../../build/server/UniversalDao.js');
var mongoDriver = require('./../../build/server/mongoDriver.js');
var config = require('./../../build/server/config.js');



console.log('initializing data');

mongoDriver.init(config.mongoDbURI, function(err) {
	if (err) {
		throw err;
	}

	console.log(mongoDriver.getDb);


	var _daoProfiles = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : "securityProfiles"
	});


	var masterProfile={
			"id": "53cd19d5502cd4915bd08724",
			"baseData": {
				"name": "masterProfile"
			},
			"forcedCriteria": {
			},
			"security": {
				"permissions": {
					"System User": true,
					"Registry - read": true,
					"Registry - write": true,
					"Security - read": true,
					"Security - write": true,
					"System Admin": true
				},
				"groups": {

				}
			}
		};


		var defaultProfile={
			"id": "53cd19d5502cd4915bd08720",
			"baseData": {
				"name": "default"
			},
			"forcedCriteria": {
				"uri://registries/member#search": {
					"criteria": {
						"0": {
							"f": "contactInfo.street",
							"op": "lt",
							"v": "3"
						},
						"1": {
							"f": "baseData.name",
							"op": "neq",
							"v": "454"
						}
					}
				}
			},
			"security": {
				"permissions": {
					"System User": true,
					"Registry - read": true,
					"Registry - write": true
				},
				"groups": {

				}
			}
		};




	var _dao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : "people"
	});


	_daoProfiles.save(defaultProfile,function(err){
		console.log(err);
	});
	_daoProfiles.save(masterProfile,function(err,data){

		console.log(data);
		_collection = mongoDriver.getDb().collection("people");


		// _collection.drop();
		_collection.ensureIndex({
			"systemCredentials.login.loginName" : 1
		},{
			unique : true,
			sparse : true
		},function(err) {
			if (err){
				console.log(err);
			}

			// var johndoe = {
			// 	"id":"53cf5c54118025ff1b88e368",
			// 	"systemCredentials": {
			// 		"login": {
			// 			"loginName" : "johndoe",
			// 			"passwordHash" : "mcHWq0FyMluy3U3nGQJeYuR6ffSDxgtG1SaejicXJvdxyM/1NUP7X5Kx3LpvsAQ+XOq8Hs+maYLiEXDQYr3OCh2o+gtTxvhEz9Z4Bem0J09v7GyxdkD2S2zED7Obr6XzPzpaxaYfmFBHRR5iy2JDRx/lAcBM1L0qFfBnoXoGYm6jcUn6Klht9xoPnYGvDVdxtjWG9GqBrLfIJb1Aot3WCPOAG0BzlidfjdG0exJhkC0eOTwgFG4D8vP/AOblI2N+skZ3ztDb6NIxRIyd70bDooUhB7HcRnJgsrqBGg68UfBReHXYFnQYYa7Fv4/mR+4y+N+SpFXokYcKUI0e6sCPcQ==",
			// 			"email": "root@localhost",
			// 			"salt" : "johndoe"
			// 		},
			// 		"profiles" : { "53cd19d5502cd4915bd08724":true,"53cd19d5502cd4915bd08720":true}
			// 	}
			// };
			var johndoe={
				"id": "53cf5c54118025ff1b88e368",
				"systemCredentials": {
					"login": {
						"loginName": "Administrator",
						"passwordHash": "mcHWq0FyMluy3U3nGQJeYuR6ffSDxgtG1SaejicXJvdxyM/1NUP7X5Kx3LpvsAQ+XOq8Hs+maYLiEXDQYr3OCh2o+gtTxvhEz9Z4Bem0J09v7GyxdkD2S2zED7Obr6XzPzpaxaYfmFBHRR5iy2JDRx/lAcBM1L0qFfBnoXoGYm6jcUn6Klht9xoPnYGvDVdxtjWG9GqBrLfIJb1Aot3WCPOAG0BzlidfjdG0exJhkC0eOTwgFG4D8vP/AOblI2N+skZ3ztDb6NIxRIyd70bDooUhB7HcRnJgsrqBGg68UfBReHXYFnQYYa7Fv4/mR+4y+N+SpFXokYcKUI0e6sCPcQ==",
						"email": "websupport@unionsoft.sk",
						"salt": "johndoe"
					},
					"profiles": ["53cd19d5502cd4915bd08724"]
				},
				"baseData": {
					"name": "Administrator",
					"bornNumber": "771010/1010",
					"surName": "UnionSoft s.r.o.",
					"birthDate": "19771010",
					"nationality": "SVK",
					"gender": "M"
				},
				"contactInfo": {
					"email": "websupport@unionsoft.sk",
					"street": "Galvaniho",
					"houseNumber": "17/B",
					"city": "Bratislava ",
					"phoneNumber": "+421 2 50267 117",
					"zipCode": "821 04",
					"country": "SVK"
				}
			};




			_dao.save(johndoe,function (err,data){

				console.log ('User saved');

				mongoDriver.close();
				});

			// var janedoe = {
			// 	"id":"53cf5c54118025ff1b88e367",
			// 	"systemCredentials": {
			// 		"login": {
			// 			"loginName" : "janedoe",
			// 			"passwordHash" : "mcHWq0FyMluy3U3nGQJeYuR6ffSDxgtG1SaejicXJvdxyM/1NUP7X5Kx3LpvsAQ+XOq8Hs+maYLiEXDQYr3OCh2o+gtTxvhEz9Z4Bem0J09v7GyxdkD2S2zED7Obr6XzPzpaxaYfmFBHRR5iy2JDRx/lAcBM1L0qFfBnoXoGYm6jcUn6Klht9xoPnYGvDVdxtjWG9GqBrLfIJb1Aot3WCPOAG0BzlidfjdG0exJhkC0eOTwgFG4D8vP/AOblI2N+skZ3ztDb6NIxRIyd70bDooUhB7HcRnJgsrqBGg68UfBReHXYFnQYYa7Fv4/mR+4y+N+SpFXokYcKUI0e6sCPcQ==",
			// 			"email": "root@localhost",
			// 			"salt" : "johndoe"
			// 		},
			// 		"profiles" : { "53cd19d5502cd4915bd08724":true}
			// 	}
			// };
			// _dao.save(janedoe,function (err,data){ console.log ('User saved'); process.exit(0);});

		});


	});



});
