# Compatibility requirements

## 1
data/partials/x-help.html has to be created. It should contain help page.

## 2
Instances without the requests feature can be raised to this version without any changes.

In instances with requests, /schemas/requests.json has to be divided into generalRequests.json, registrationRequests.json, dataChangeRequests.json and transferRequests.json (except for data-sba where only general requests are currently implemented)
This also entails modifying the request-modified handler, x-main-menu and others.
All of this should already be on the respective repos, so only a fetch is needed.

The requests collection in the database also needs to be divided. There are scripts for this in tools/mongo/:

	- splitMigrationCheck.sh - doesn't actually modify the database, it only reports where it would move each request
	- splitMigration.sh - performs the division, drops the 'requests' collection if it ends up being empty
