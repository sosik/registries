# Contenteditable

## Schema definition
```json
...
{
	"title": "Title",
	"transCode": "schema.name",
	"type": "string",
	"required": true,
	"render": {
		"component": "psui-contenteditable",
	}
}
...
```

where
* **title** - *OPTIONAL* name of title. It is used when transCode is empty 
* **transCode** - *MANDATORY* translate code of title (do not forget on translation.js)
* **type** - *MANDATORY* value is "string"
* **required** - *OPTIONAL* value is true, false. Default is false. It specifies that the field must be filled out
* **render** - *MANDATORY* type is object
  * **render** - *MANDATORY* value is psui-contenteditable
  