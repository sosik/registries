'use strict';

var extend = require('extend');

var swig = require('swig');

var log = require('./logging.js').getLogger('RenderService.js');
var DEFAULT_CFG = {
		templateFolder: process.cwd()+'/build/server/templates' 
};


var templates = {
    MAIL_USER_PASSWORD_RESET: 'user-reset-password-txt.tmpl'
};

var RenderService = function( options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);
	
	function getTemplateFileName(template){
		return cfg.templateFolder+'/'+template;
	}
	
	//compile templates
	for (var templ in templates) { 
		swig.compileFile(getTemplateFileName(templates[templ]));
		log.verbose('Template compiled',templ);
	}
	
	this.render=function(templ,ctx){
		return swig.renderFile(getTemplateFileName(templ),ctx);
	};
	
	this.renderInstant=function(template,ctx){
		return swig.render(template,ctx);
	};


//	console.log('render',this.render( templates.MAIL_USER_PASSWORD_RESET,{'userName':'xxx','userPassword':'adsadsa'}));
};




module.exports = {
		templates : templates,
		RenderService : RenderService
};