var config = require('./config.js');
var generalCollation = require('./collation.js');

if (config.collation.language == 'sk'){
	var collation = require('./sk_collation.js');
}else if (config.collation.language == 'cz'){
	var collation = require('./cz_collation.js');
}

var remove = function(originalArray, removeArray){
	var i = 0;
	while (removeArray[i]){
		var index = originalArray.indexOf(removeArray[i]);
		originalArray.splice(index, 1);
		i++;
	}
};
var insert = function(originalArray, insertArray){
	var i = 0;
	while (insertArray[i]){
		var index = originalArray.indexOf(insertArray[i][1]);
		originalArray.splice(index + 1, 0, insertArray[i][0]);
		i++;
	}
};

var finalCollation = generalCollation.collation;

remove(finalCollation, collation.remove);
insert(finalCollation, collation.insert);

var findDoubleChars = function(finColl){
	var specialChars = new Array();
	var i = 0;
	var j = 0;
	while(finColl[i]){
		if(finColl[i][1]){
			specialChars[j] = [finColl[i],finColl[i][0],finColl[i].length];
			j++;
		}
		i++;
	}
	return specialChars;
};

var specialChars = findDoubleChars(finalCollation);


module.exports.finalCollation = finalCollation;
module.exports.specialChars = specialChars;
