#!/bin/bash

if [[ $# -lt 1 ]]; then
cat <<- EOT
	Usage: $0 <db>
	Outputs the type of request for each document in the 'requests' collection.
	If the type is not recognized, it outputs the JSON.
EOT
exit
fi

DB=$1

read -r -d '' COMMAND <<- EOC

db.requests.find().forEach(function(x){
	if(x.hasOwnProperty('peopleObjLink') && x.peopleObjLink.hasOwnProperty('people')){
		print('dataChangeRequests');
	}else if(x.hasOwnProperty('transferData')){
		print('transferRequests');
	}else if(x.hasOwnProperty('baseData') && x.baseData.hasOwnProperty('subject')){
		print('generalRequests');
	}else if(x.hasOwnProperty('baseData') && x.baseData.hasOwnProperty('id')){
		print('registrationRequests');
	}else{
		print('Error, request not recognized:');
		print(JSON.stringify(x, null, 4));
	}
});
EOC

mongo $DB --quiet --eval "$COMMAND"
