# Uploadable Image

## Schema definition
```json
...
{
	"title": "Photo",
	"transCode": "schema.people.photoInfo.photo",
	"type": "string",
	"required": false,
	"uploadableImage": {
		"height": 244,
		"width": 205
	}
}
...
```

where
* **title** - *OPTIONAL* name of title. It is used when transCode is empty 
* **transCode** - *MANDATORY* translate code of title
* **type** - *MANDATORY* value is "string"
* **required** - *OPTIONAL* value is true,false. Default is false. it specifies that the field must be filled out
* **uploadableImage** - *MANDATORY* type is object. Settings of component
 * **height** - *MANDATORY* picture height which is stored on server
 * **width** - *MANDATORY* picture width which is stored on server