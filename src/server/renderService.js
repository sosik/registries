'use strict';

var extend = require('extend');
var crypto = require("crypto");


var log = require('./logging.js').getLogger('SecurityService.js');
var DEFAULT_CFG = {};
var transport = nodemailer.createTransport("Sendmail");
var SchemaToolsModule = require('./SchemaTools.js');
var fs = require('fs');


var templates = {
    MAIL_USER_PASSWORD : '_read',
    MODIFY : '_modify',
    CREATE : '_create'
};

var RenderService = function( options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

};

module.exports = {
    actions : actions,
    SecurityService : SecurityService
}