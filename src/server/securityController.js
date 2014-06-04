'use strict';

var log = require('./logging.js').getLogger('loginController.js');
var extend = require('extend');

var DEFAULT_CFG = {
		schemas:[ '/shared/schemas/groups.json','/shared/schemas/permissions.json', '/shared/schemas/login.json','/shared/schemas/systemCredentials.json'  ]
};

var SchemaToolsModule = require('./SchemaTools.js');

var fs = require('fs');

var SecurityController = function(options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	var schemaTools = new SchemaToolsModule.SchemaTools();

	cfg.schemas.map(function(item){
		var content=fs.readFileSync(process.cwd()+"/build"+ item);
		
		schemaTools.registerSchema(null, content.toString());
	})
	
	schemaTools.parse();
	schemaTools.compile();
	
	var defaultObj=schemaTools.createDefaultObject('uri://registries/security#permissions');
	console.log("object " + defaultObj);
	

	this.getRoles = function(req, resp) {
		var defaultObj=schemaTools.createDefaultObject('uri://registries/security#permissions');
			
		var result=[];
		
		for(var pro in defaultObj ){
			result.push(pro);
		}
		
		resp.send(200, result); 
	};

};

module.exports = {
		SecurityController : SecurityController
	}