# DatePicrek

## Schema definition
```json
...
{
	"title": "Photo",
	"transCode": "schema.people.photoInfo.photo",
	"type": "date",
	"required": false,
}
...
```

where
* **title** - *OPTIONAL* name of title. It is used when transCode is empty 
* **transCode** - *MANDATORY* translate code of title
* **type** - *MANDATORY* value is "date"
* **required** - *OPTIONAL* value is true,false. Default is false. it specifies that the field must be filled out