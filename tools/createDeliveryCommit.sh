#!/bin/bash
DEPLOYMENT_HEADER="DEPLOY and DELIVERY commit"
LAST_DEPL=`git log --pretty=oneline|grep "$DEPLOYMENT_HEADER"|head -n 1|cut -f 1 -d " "`

if [ "x$LAST_DEPL" == "x" ]; then
	echo "No previous deployment commit found, using first commit"
	LAST_DEPL=`git log --reverse --pretty=format:"%H"|head -n 1`
fi

echo "Previous deployment commit:"
git show -s --pretty=format:"%H %an %ad %s" $LAST_DEPL

TMPFILE=`mktemp`

echo $DEPLOYMENT_HEADER $1 >$TMPFILE
echo >>$TMPFILE
git log $LAST_DEPL..HEAD|egrep -i '\[FINIS.* #[0-9]*\]'|sed -e 's/^.*\[FIN\w* #\([0-9]*\)\].*$/\[DELIVERED #\1\]/i'|sort -u >>$TMPFILE

cat $TMPFILE
git commit --allow-empty -F $TMPFILE
