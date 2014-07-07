#!/bin/bash

getGitData() {
	commit=$(git rev-parse HEAD)

	echo Current commit is ${commit}

	tags=$(git tag --points-at ${commit})

	if [ "x${tags}" == "x" ]; then
		echo No tags found, looking for nearest one
		tags="AHEAD OF $(git describe --abbrev=0)"
	else
		echo Found tags $tags
	fi
}

getGitData
date=$(date -R)
echo "${tags} -> ##CODEBASE_VERSION_PLACEHOLDER##"
echo "${commit} -> ##CODEBASE_COMMIT_PLACEHOLDER##"
echo "${date} -> ##CODEBASE_BUILDDATE_PLACEHOLDER##"

codebase_tags=${tags}
codebase_commit=${commit}
pushd data/
getGitData
echo "${tags} -> ##SCHEMABASE_VERSION_PLACEHOLDER##"
echo "${commit} -> ##SCHEMABASE_COMMIT_PLACEHOLDER##"
popd

tempfile=`mktemp`
cat build/client/index.html|sed -e "s/##CODEBASE_VERSION_PLACEHOLDER##/${codebase_tags}/" > ${tempfile}
mv ${tempfile} build/client/index.html
cat build/client/index.html|sed -e "s/##CODEBASE_COMMIT_PLACEHOLDER##/${codebase_commit}/" > ${tempfile}
mv ${tempfile} build/client/index.html
cat build/client/index.html|sed -e "s/##CODEBASE_BUILDDATE_PLACEHOLDER##/${date}/" > ${tempfile}
mv ${tempfile} build/client/index.html
cat build/client/index.html|sed -e "s/##DATASET_VERSION_PLACEHOLDER##/${tags}/" > ${tempfile}
mv ${tempfile} build/client/index.html
cat build/client/index.html|sed -e "s/##DATASET_COMMIT_PLACEHOLDER##/${commit}/" > ${tempfile}
mv ${tempfile} build/client/index.html
