var fs = require('fs');


var mongoDriver = require('./../../build/server/mongoDriver.js');
var config = require('./../../build/server/config.js');

var universalDaoModule = require('./../../build/server/UniversalDao.js');
var schemaRegistryModule = require('./../../build/server/schemaRegistry.js');

var universalDaoControllerModule = require('./../../build/server/UniversalDaoController.js');

var path = require('path');
var async = require('async');


var util = require('util');
var stream = require('stream');


var schema=null;

process.argv.forEach(function(val, index, array) {
	console.log(index + ': ' + val);
});

console.log('file to process', process.argv[2]);

if (process.argv[2]) {
 	schema =  process.argv[2];
}

mongoDriver.init(config.mongoDbURI, function(err) {
	if (err) {
		throw err;
	}

	var schemasListPaths = JSON.parse(
		fs.readFileSync(path.join(config.paths.schemas, '_index.json')))
		.map(function(item) {
			return path.join(config.paths.schemas, item);
	});
	
	var schemaRegistry = new schemaRegistryModule.SchemaRegistry({schemasList:schemasListPaths});
	var udc = new universalDaoControllerModule.UniversalDaoController(mongoDriver, schemaRegistry);
	
	go(udc,schema);

});



function go(udc,schema) {

	var req={params:{schema:schema},body:{}};
	var res=function (){
		this.send=function (code ,data){
			console.log(code,data);
		};
		this.json=function(data){
			iterateData(data,udc);
		};
	}; 
	
	util.inherits(res, require('stream').Writable);
	res= new res();
	udc.searchBySchema(req,res);

}


function iterateData(data,udc){
	
	data.map(function (item){

		saveItem(item,udc);

	})

}

function saveItem(item,udc){

		var req={currentUser:{id:-1},params:{schema:schema},body:item};
			var res=function (){
			
			this.send=function (code ,data){
			console.log("save res",code,data);
			};

			this.json=function(data){
				console.log(data);
			};
			
	}; 
	
	util.inherits(res, require('stream').Writable);
	res= new res();

	udc.saveBySchema(req,res);


}