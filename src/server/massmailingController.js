'use strict';

var extend = require('extend');
var log = require('./logging.js').getLogger('MassmailingController.js');
var renderServiceModule= require('./renderService.js');
var universalDaoModule = require('./UniversalDao.js');

var nodemailer = require('nodemailer');

var DEFAULT_CFG = {
	userCollection:'people'	
};


var MassmailingController = function(mongoDriver, options) {

	var transport = nodemailer.createTransport('Sendmail');

	var cfg = extend(true, {}, DEFAULT_CFG, options);
	
	var self = this;

	var userDao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : cfg.userCollection
	});

	var renderService = new renderServiceModule.RenderService();

	this.resolveAndSend=function(subjectTemplate,textTemplate,htmlTemplate,user,sender){
	
		if (!('contactInfo' in user) || !(user.contactInfo.email)){
			log.warn('user has no mail',user);
			return;
		}

		var email = user.contactInfo.email;

		var resolvedSubject,resolvedHtml,resolvedText;
		try {

			if (subjectTemplate){
				resolvedSubject=renderService.renderInstant(subjectTemplate,{locals:{'recipient':user,'sender':sender}});
			}
			if (textTemplate){
				resolvedText=renderService.renderInstant(textTemplate,{locals:{'recipient':user,'sender':sender}});
			}
			if(htmlTemplate){
				resolvedHtml=renderService.renderInstant(htmlTemplate,{locals:{'recipient':user,'sender':sender}});
			}

			var mailOptions = {
				from : 'websupport@unionsoft.sk',
				to : email,
				subject :  resolvedSubject,
				text : resolvedText,
				html : resolvedHtml
			};

			transport.sendMail(mailOptions);
			log.debug('Sending mail', mailOptions,sender);
		}	catch(err){
			log.error('error',err.stack);
		}

	};

	/**
	*	Sends mails asynchronuosly,
	*	Async user/recipient query --> paralel send mail.
	*/
	this.sendMail=function(req ,res){

		if (!('template' in req.body)){
			res.send(500,'mising templetates');
		}

		if (req.body.users){
				for (var index in req.body.users){
					log.silly(req.body.users[index]);

					userDao.get(req.body.users[index],function(err,user){
						if (err){
							log.debug(err);
							return;
						}
						self.resolveAndSend(req.body.template.baseData.subjectTemplate,req.body.template.baseData.textTemplate,req.body.template.baseData.htmlTemplate,user,req.currentUser);
					});
				}
		} else { 
			log.verbose('Sending mail to users matching criteria',req.body.criteria);
			userDao.list(req.body.criteria,function(err,data){
					for(var index in data){
						self.resolveAndSend(req.body.template.baseData.subjectTemplate,req.body.template.baseData.textTemplate,req.body.template.baseData.htmlTemplate,data[index],req.currentUser);
					}
			});
		}
		res.send(200,'');

	};

};

module.exports = {
	MassmailingController : MassmailingController
};
