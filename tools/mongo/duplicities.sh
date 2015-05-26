#!/bin/bash

if [[ $# -lt 3 ]]; then
cat <<- EOT
	Usage: $0 <db> <collection> <field>
	Displays list of duplicated values in collection by specified field
EOT
exit
fi

DB=$1
COLLECTION=$2
FIELD=$3

read -r -d '' COMMAND <<- EOC
db.$COLLECTION.aggregate([
  { \$group: { 
    _id: "\$$FIELD", 
    count: { \$sum: 1 } 
  }}, 
  { \$match: { 
    count: { \$gt: 1 } 
  }}
  ]).forEach(printjson);
EOC

mongo $DB --quiet --eval "$COMMAND"
