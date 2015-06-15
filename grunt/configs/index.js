var extend = require('extend');
var fs = require('fs');
var path = require('path');

config = {};

var files = fs.readdirSync(__dirname);

for (var f in files) {
	var filename = files[f];

	if (!/^\./.test(filename) && filename != 'index.js') {
		config = extend(config, require(path.join(__dirname, filename)));
	}
}

module.exports = config;
