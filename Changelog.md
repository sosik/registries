### Search now allows to filter data by object link too
Search by object link now works.

### Search form now display serach results on enter key
Search can be initialized by Enter key in addition to clicking the search button.

### CSV export now correctly displays even objectlink data
Object link data are now exported and text representation not [Object] keyword.

### New visual for portal editir blocks selector
Building blocks of page can be selected from nicer dialog.

### Protal editor can now show all articles
It is possible to list all articles event that are not accessible from WISIWIG editor. Articles can be filtered.

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
