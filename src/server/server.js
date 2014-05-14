'use strict';

var express = require('express');
var path = require('path');


var app = express();
app.use(express.static(path.join(process.cwd(), 'build', 'client')));
app.disable('view cache');

var server = app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
	console.log("Http server listening at %j", server.address());
});
