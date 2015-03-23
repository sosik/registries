# ObjectLink2

## Schema definition
```json
...
{
	"title": "Club title",
	"transCode": "schema.people.hockeyPlayerInfo.clubName",
	"type": "object",
	"required": true,
	"objectLink2": {
		"schema": "uri://registries/organization#views/organization/view",
		"fields":{
			"fieldName_1": "origFieldPath_1",
			"fieldName_2": "origFieldPath_2"
			.....
		}
	},
	"objectLink2ForcedCriteria":[
		{
			"f": "origFieldPath",
			"op": "operation",
			"v": "searchValue"
		}
		...
	]
}
...
```

where
* **title** - *OPTIONAL* name of title. It is used when transCode is empty 
* **transCode** - *MANDATORY* translate code of title (do not forget on translation.js)
* **type** - *MANDATORY* value is "object"
* **required** - *OPTIONAL* value is true, false. Default is false. It specifies that the field must be filled out
* **objectLink2** - *MANDATORY* type is object
  * **schema** - *MANDATORY* uri of schema that should be used for reference retrieval 
  * **fields** - *MANDATORY/NOT EMPTY* enumeration of fields that should be extracted form    referenced 
    * **fieldName_x** - property name used for referenced objectlink
    * **origFieldPath_x** - path to referenced property in remote object. it uses object notation 'baseData.address.street' not schema path with properties keyword
* **objectLink2ForcedCriteria** - *OPTIONAL* type is array of object. [See more search definition...](QueryFilter.md)


### Example

```json
"clubName": {
	"title": "Názov klubu",
	"transCode": "schema.people.hockeyPlayerInfo.clubName",
	"type": "object",
	"objectLink2": {
		"schema": "uri://registries/organization#views/organization/view",
		"fields":{
			"name": "baseData.name"
		}
	},
	"objectLink2ForcedCriteria":[
		{
			"f": "baseData.name",
			"op": "contains",
			"v": "test"
		}
	]
}
```

### Example of convert from objectlink to objectlink2
```json
"member": {
	"title": "Člen",
	"transCode": "schema.fees.baseData.member",
	"type": "object",
	"required": true,
	"objectLink": {
		"registry": "people",
		"surName": "baseData.surName.v",
		"name": "baseData.name.v"
	},
	"objectLink2": {
		"schema": "uri://registries/people#views/fullperson/view",
		"fields":{
			"surName": "baseData.surName",
			"name": "baseData.name"
		}
	}
}
```