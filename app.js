var express = require('express');

var app = express();
app.use(express.static(__dirname + '/client'));

var server = app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    console.log("Http server listening at %j", server.address());
});