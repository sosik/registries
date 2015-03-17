# ObjectLink2

## Schema definition
```json
...
{
  type: 'object',
  objectLink2: {
    schema: 'uri://...',
    fields: {
      'fieldName_1': 'origFieldPath_1',
      'fieldName_2': 'origFieldPath_2',
      ...
    }
  }
}
...
```

where
* **schema** - *OPTIONAL* uri of schema that should be used for reference retrieval
* **fields** - *MANDATORY/NOT EMPTY* enumeration of fields that should be extracted form    referenced object
 * **fieldName_x** - property name used for referenced objectlink
 * **origFieldPath_x** - path to referenced property in remote object. it uses object notation 'baseData.address.street' not schema path with properties keyword
