# Select Box

## Schema definition
```json
...
{
	"title": "Gender",
	"transCode": "schema.people.baseData.gender",
	"type": "string",
	"required": true,
	"translationPrefix":"enum.gender",
	"enum":[
		"value_1",
		"value_2",
		...
	],
	"enumTransCodes":[
		"titleTransCode_1",
		"titleTransCode_2",
		...
	]
}
...
```

where
* **title** - *OPTIONAL* name of title. It is used when transCode is empty 
* **transCode** - *MANDATORY* translate code of title (do not forget on translation.js)
* **type** - *MANDATORY* value is "string"
* **required** - *OPTIONAL* value is true, false. Default is false. It specifies that the field must be filled out
* **translationPrefix** - do not know
* **enum** - *MANDATORY* type is array. Selectbox can contain pair of option value and name 
 * **value_x** - it is option value which is saved in database. If **enumTransCodes** are empty then the value is option name too and it is showing to the user. E.g. for gender ["M","F"]
* **enumTransCodes** - *OPTIONAL* type is array of translation codes.
 * **titleTransCode_x** - type is string. Value of trans code of option name. 
