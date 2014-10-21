#!/bin/bash
if [ -z "$1" ]; then
	echo "You need to provide instance name"
	exit -1
fi

INSTANCE=$1
DEPLOYMENT_HEADER="DEPLOY and DELIVERY commit"
LAST_DEPL=`git log --pretty=oneline|grep "$DEPLOYMENT_HEADER"|head -n 1|cut -f 1 -d " "`

if [ "x$LAST_DEPL" == "x" ]; then
	echo "No previous deployment commit found, using first commit"
	LAST_DEPL=`git log --reverse --pretty=format:"%H"|head -n 1`
fi

echo "Previous deployment commit:"
git show -s --pretty=format:"%H %an %ad %s" $LAST_DEPL

TMPFILE=`mktemp`

echo $DEPLOYMENT_HEADER on $INSTANCE>$TMPFILE
echo >>$TMPFILE
git log $LAST_DEPL..HEAD|egrep -i '\[FINIS|FIX.* #[0-9]*\]'|sed -e 's/^.*\[\(FIN\|FIX\)\w* #\([0-9]*\)\].*$/\[DELIVERED #\2\]/i'|sort -u >>$TMPFILE

cat $TMPFILE
git commit --allow-empty -F $TMPFILE
DATE=`date +%Y%m%d%H%M%S`
git tag -a -f -m "Deploy $DATE $INSTANCE" "$INSTANCE-$DATE"
