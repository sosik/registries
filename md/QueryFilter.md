
# Query Filter

## Search definition

```json
	[
		{
			"f": "origFieldPath",
			"op": "operation",
			"v": "value"
		},
		...
	]
```
where
* **f** - *MANDATORY* path to referenced property in object. it uses object notation 'baseData.address.street' not schema path with properties keyword
* **op** - *MANDATORY* value of operations like 'ex', 'eq', [and more...](#operations)
* **v** - *MANDATORY* it is search string

###  <a name="operations" />Operations

```javascript
{
	EXISTS: 'ex', // field exists in structure
	EQUAL: 'eq', // field value is equal
	GREATER: 'gt',
	GREATER_EQUAL: 'gte',
	LESS: 'lt',
	LESS_EQUAL: 'lte',
	NOT_IN: 'nin',
	IN: 'in',
	NOT_EQUAL: 'neq', // field value is not equal
	CONTAINS:'contains',
	STARTS_WITH: 'starts', // field value starts with
	ALL: 'all' // all values present in array
}
```


## Query operation

```javascript
{
	ASC: 'asc',
	DESC: 'desc'
};
```

## 