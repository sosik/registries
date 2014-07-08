'use strict';

var extend = require('extend');
var crypto = require("crypto");

var swig = require("swig");

var log = require('./logging.js').getLogger('RenderService.js');
var DEFAULT_CFG = {
		templateFolder: process.cwd()+'/build/server/templates' 
};

var fs = require('fs');


var templates = {
    MAIL_USER_PASSWORD : 'user-reset-password-txt.tmpl'
};

var RenderService = function( options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);
	
	function getTemplateFileName(template){
		return cfg.templateFolder+'/'+template;
	}
	
	//compile templates
	for (var templ in templates) { 
		swig.compileFile(getTemplateFileName(templates[templ]));
		console.log('Template compiled',templ);
	}
	
	this.render=function (templ,ctx){
		return swig.renderFile(getTemplateFileName(templ),ctx);
	}
	
	
//	console.log('render',this.render( templates.MAIL_USER_PASSWORD,{'userName':'xxx','userPassword':'adsadsa'}));
};

module.exports = {
		templates : templates,
    RenderService : RenderService
}