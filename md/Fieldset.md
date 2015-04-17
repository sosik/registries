# Fieldset

## Schema definition
```json
...
{
	"title": "Bank info",
	"transCode": "schema.people.bankInfo",
	"type": "object",
	"render": {
		"width": "full"
	},
	"properties": {
		"component_1",
		"component_2",
		...
	}
}
...
```

where
* **title** - *OPTIONAL* name of title. It is used when transCode is empty 
* **transCode** - *MANDATORY* translate code of title (do not forget on translation.js)
* **type** - *MANDATORY* value is "object"
* **render** - *OPTIONAL* type is object
 * **width** - type is string. Value "full" is render the fieldset view the full with
* **properties** - *MANDATORY* type is object
 * **component_x** - type is object. It is a component definition

