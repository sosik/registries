### Portal widget for email subscription
Widget allows user to enter his email address (optentially other values) and stores it into schema.

### Improved speed of export functionality
Speed and memory consumption of export improved. Visual indication of export process works now.

### Customizable width of column in search window
Search form now recognizes definition fo relative width of column in search results grid. To render baseData.registrationID liitle more narrow then standard field, use `render.width` property:

```javascript
"search": {
	"listFields": [{
			"field": "baseData.registrationID",
			"title": "Registračné číslo",
			"transCode": "schema.people.registrationID",
            "render": {
            	"width": "narrow"
            }
	},
	{
		"field": "baseData.surName",
		"title": "Priezvisko",
		"transCode": "schema.people.surName"
	}]
	}
}
```

Supported values are: narrow, normal, wide.
