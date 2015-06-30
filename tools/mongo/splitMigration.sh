#!/bin/bash

if [[ $# -lt 1 ]]; then
cat <<- EOT
	Usage: $0 <db>
	
	Splits the 'requests' collection into 'generalRequests' 
	'registrationRequests', 'dataChangeRequests' and 'transferRequests'.	

EOT
exit
fi

DB=$1

read -r -d '' COMMAND <<- EOC

var move = function(x, collection){
	db.getCollection(collection).insert(x);
	db.requests.remove({_id : x._id});
}

var notRec = false;
db.requests.find().forEach(function(x){
	if(x.hasOwnProperty('peopleObjLink') && x.peopleObjLink.hasOwnProperty('people')){
		move(x, 'dataChangeRequests');
	}else if(x.hasOwnProperty('transferData')){
		move(x, 'transferRequests');
	}else if(x.hasOwnProperty('baseData') && x.baseData.hasOwnProperty('subject')){
		move(x, 'generalRequests');
	}else if(x.hasOwnProperty('baseData') && x.baseData.hasOwnProperty('id')){
		move(x, 'registrationRequests');
	}else{
		print('Request not recognized, not moving:');
		print(JSON.stringify(x, null, 4));
		notRec = true;
	}
});

db.generalRequests.update({}, { \$rename : {'baseData': 'requestData'}}, false, true);

db.securityProfiles.update({'security.forcedCriteria.applySchema': 'uri://registries/requests#views/peopleRegistrationApplicant/search'}, 
	{\$set : {'security.forcedCriteria.$.applySchema' : 'uri://registries/registrationRequests#views/peopleRegistrationApplicant/search'}});

db.securityProfiles.update({'security.forcedCriteria.applySchema': 'uri://registries/requests#views/dataChangeApplicant/search'}, 
	{\$set : {'security.forcedCriteria.$.applySchema' : 'uri://registries/dataChangeRequests#views/dataChangeApplicant/search'}});

db.securityProfiles.update({'security.forcedCriteria.applySchema': 'uri://registries/requests#views/transferApplicant/search'}, 
	{\$set : {'security.forcedCriteria.$.applySchema' : 'uri://registries/transferRequests#views/transferApplicant/search'}});


if(notRec){
	print("Some unrecognized requests have been left in the 'requests' collection.");
}else if (db.requests.count() > 0){
	print('The collection is not empty, not dropping.');
}else{
	var x = db.requests.drop();
	print("Done. 'requests' collection dropped.");
}
EOC

mongo $DB --quiet --eval "$COMMAND"
