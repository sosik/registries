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
				"passwordHash" : new Buffer( JSON.parse( "[ 153, 193, 214, 171, 65, 114, 50, 91, 178, 221, 77, 231, 25, 2, 94, 98, 228, 122, 125, 244, 131, 198, 11, 70, 213, 38, 158, 142, 39, 23, 38, 247, 113, 200, 207, 245, 53, 67, 251, 95, 146, 177, 220, 186, 111, 176, 4, 62, 92, 234, 188, 30, 207, 166, 105, 130,			            226, 17, 112, 208, 98, 189, 206, 10, 29, 168, 250, 11, 83, 198, 248, 68, 207, 214, 120, 5, 233, 180, 39, 79, 111, 236, 108, 177, 118,			            64, 246, 75, 108, 196, 15, 179, 155, 175, 165, 243, 63, 58, 90, 197, 166, 31, 152, 80, 71, 69, 30, 98, 203, 98, 67, 71, 31, 229, 1,			            192, 76, 212, 189, 42, 21, 240, 103, 161, 122, 6, 98, 110, 163, 113, 73, 250, 42, 88, 109, 247, 26, 15, 157, 129, 175, 13, 87, 113,			            182, 53, 134, 244, 106, 129, 172, 183, 200, 37, 189, 64, 162, 221, 214, 8, 243, 128, 27, 64, 115, 150, 39, 95, 141, 209, 180, 123, 18,			            97, 144, 45, 30, 57, 60, 32, 20, 110, 3, 242, 243, 255, 0, 230, 229, 35, 99, 126, 178, 70, 119, 206, 208, 219, 232, 210, 49, 68, 140,			            157, 239, 70, 195, 162, 133, 33, 7, 177, 220, 70, 114, 96, 178, 186, 129, 26, 14, 188, 81, 240, 81, 120, 117, 216, 22, 116, 24, 97,	174, 197, 191, 143, 230, 71, 238, 50, 248, 223, 146, 164, 85, 232, 145, 135, 10, 80, 141, 30, 234, 192, 143, 113 ]")),
				"salt" : "johndoe" ,
				"groups" : { } ,
				 "permissions" : { "Registry - read" : true ,  "System User" : true , "Registry - write" : true }
					 	
				 };
		
		_dao.save(johndoe,function (err,data){ console.log ('User saved')});
		
		
	});


});
