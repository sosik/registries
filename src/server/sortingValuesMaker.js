var config = require('./config.js');
var collationMaker = require('./collationMaker.js');

function getCollationKey(s){
	var arrOfVals = [];
	var border = config.collation.numberOfChars;
	var index = 0;
	for(i = 0; i < border; i++){
		arrOfVals[index] = collationMaker.finalCollation.indexOf(s[i]) + 1;
		var j = 0;
		while(collationMaker.specialChars[j]){
			if (s[i] == collationMaker.specialChars[j][1]){
				if(s.substr(i,collationMaker.specialChars[j][2]) == collationMaker.specialChars[j][0]){
					arrOfVals[index] = collationMaker.finalCollation.indexOf(s.substr(i,collationMaker.specialChars[j][2])) + 1;
					i = i + collationMaker.specialChars[j][2] - 1;
					border = border + collationMaker.specialChars[j][2] - 1;
				}
			}
			j++;
		}
		index++;
	}

	return arrOfVals;
}

module.exports.getCollationKey = getCollationKey;
