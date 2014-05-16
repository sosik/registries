'use strict';

var express = require('express');
var path = require('path');
var fsCtrl = new (require('./FsCtrl.js')).FsCtrl({rootPath: path.join(process.cwd(),'data')});

var noop = function() {return;};

var app = express();
app.disable('view cache');

// FSController
app.get('/fs/ls', function(req, res) {fsCtrl.ls(req, res, noop);});
app.get('/fs/ls/*', function(req, res) {fsCtrl.ls(req, res, noop);});

app.get('/fs/get/*', function(req, res) {fsCtrl.get(req, res, noop);});
app.get('/fs/rm/*', function(req, res) {fsCtrl.rm(req, res, noop);});
app.get('/fs/mkdir/*', function(req, res) {fsCtrl.mkdir(req, res, noop);});
app.put('/fs/put/*', function(req, res) {fsCtrl.put(req, res, noop);});
app.put('/fs/replace/*', function(req, res) {fsCtrl.replace(req, res, noop);});

// Static data
app.use(express.static(path.join(process.cwd(), 'build', 'client')));


var server = app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
	console.log("Http server listening at %j", server.address());
});
