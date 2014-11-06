#!/bin/bash

declare -A datasets

datasets=(
	["caihp"]="https://github.com/sosik/registries-data-caihp.git"
	["svf"]="https://github.com/sosik/registries-data-svf.git"
	["srz"]="https://github.com/sosik/registries-data-srz.git"
	["szh"]="https://github.com/sosik/registries-data-szh.git"
	["demo01"]="https://github.com/sosik/registries-data-demo01.git"
	["caihp-petugez"]="https://github.com/petugez/registries-data-caihp.git"
	["caihp-mkotul"]="https://github.com/mkotul/registries-data-caihp.git"
	["svf-mkotul"]="https://github.com/mkotul/registries-data-svf.git"
	["srz-petugez"]="https://github.com/petugez/registries-data-srz.git"
	["svf-petugez"]="https://github.com/petugez/registries-data-svf.git"
)

if [ $# -lt 1 ]; then
	echo "---------------------------------------------"
	echo "Creates data directory for particular dataset"
	echo
	echo "Usage:"
	echo "$0 <dataset>"
	echo
	echo "Known datasets:"
	for set in ${!datasets[@]}; do echo "$set => ${datasets["$set"]}"; done;
	echo

	exit -1;
fi

# do stuff
done=0;
for set in ${!datasets[@]}; do
	if [ "$1" == "$set" ]; then
		done=1;
		echo "Requested set $set"
		echo "Cloning ${datasets["$set"]}"

		git clone ${datasets[$set]} data
		exit 0;
	fi
done;

if [ $done -eq 0 ]; then
	echo "Unrecognized dataset $1"
	exit -1;
fi;
