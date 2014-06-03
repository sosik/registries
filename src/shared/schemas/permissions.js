{
	
	"$schema": "http://json-schema.org/schema#",
	"id": "uri://registries/common#permissions",
	"permissions": {

      "type": "object",
      "properties": {
        "System User": {
          "title": "Systémový používateľ",
          "type": "boolean"
        },
        "Registry - read": {
          "title": "Zobrazenie dát registrov",
          "type": boolean"
        },
        "Registry - write": {
          "title": "Modifikácia dát registrov",
          "type": boolean"
        }
       
      }
}