/* jshint node:true */

'use strict';

var log = require('./logging.js').getLogger('portal.js');
var express = require('express');
var cookieParser = require('cookie-parser');
var http = require('http');
var path = require('path');
var config = require('./config.js');
var mongoDriver = require('./mongoDriver.js');

var pageController = new (require('./portal/page-controller.js'))(mongoDriver);
var apiController = new (require('./portal/api-controller.js'))(mongoDriver);

// START
var swig = require('swig');
swig.setDefaults({cache: false});
var app = express();

app.use(require('./request-logger.js')
	.getLogger(require('./logging.js')
		.getLogger('HTTP'))
	.logger()
);
app.disable('view cache');

// page mappings
app.use(cookieParser());

app.use(function(req, resp, next) {
	if (req.cookies.authToken) {
		req.portalCtx = {
			mode: 'edit'
		};
	}

	next();
});

app.get('/', pageController.renderIndex);

app.all('/api/:op', apiController.renderIndex);
//app.get('/article/:id', pageController.renderArticle);

app.use(express.static(path.join(process.cwd(), 'data', 'portal')));
app.use(express.static(path.join(process.cwd(), 'build', 'client')));

// If nothing worked so far show 404

app.use(pageController.renderNotFound);

app.use(function(err, req, res, next) {
	log.error('PAGE ERROR %s', req.path, err);
	res.status(500).send(err);
});

mongoDriver.init(config.mongoDbURI, function(err) {
	if (err) {
		throw err;
	}
	http.createServer(app)
	.listen(config.portalPort, config.portalHost, function() {
		log.info('Http server listening at %s:%s', config.portalHost, config.portalPort);
	});
});
