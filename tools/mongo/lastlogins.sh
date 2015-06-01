#!/bin/bash

if [[ $# -lt 1 ]]; then
cat <<- EOT
	Usage: $0 <db> [limit]
	Shows ordered list of logins into application. Optional limit parameter can be used to
	show only limited number of results.
EOT
exit
fi

DB=$1
LIMIT=$2 || 1000

read -r -d '' COMMAND <<- EOC
db.token.find().sort({created: -1}).limit($LIMIT).forEach(function(d){
print((new Date(d.created)).toISOString(), d.user, d.ip, (new Date(d.touched).toISOString()));
});
EOC

mongo $DB --quiet --eval "$COMMAND"
