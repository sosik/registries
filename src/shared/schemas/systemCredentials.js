{

"$schema": "http://json-schema.org/schema#",
	"id": "uri://registries/systemCredentials#",

"systemCredential": {
  "type": "object",
  "properties": {
   		
   		"login":{
   			$ref": "uri://registries/common#login"
   		}
   		"permissions":{
   			"$ref": "uri://registries/common#permissions"
   		}
   		
   		"groups":{
   			$ref": "uri://registries/common#groups"
   		}
   		
  }


}