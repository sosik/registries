'use strict';

var extend = require('extend');
var log = require('./logging.js').getLogger('MassmailingController.js');
var renderServiceModule= require('./renderService.js');
var universalDaoModule = require('./UniversalDao.js');

var nodemailer = require('nodemailer');

var DEFAULT_CFG = {
	userCollection:'people',
	mailLogCollection: 'mailLogs'
};


var MassmailingController = function(mongoDriver, options) {

	var transport = nodemailer.createTransport('Sendmail');

	var cfg = extend(true, {}, DEFAULT_CFG, options);
	
	var self = this;

	var userDao = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : cfg.userCollection
	});

	var mailLogDao=new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : cfg.mailLogCollection
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

	this.createMailLog=function(subjectTemplate,textTemplate,htmlTemplate,sender,recipients){
		var mailLog = {baseData:{subject:subjectTemplate, text:textTemplate, htmlTemplate:htmlTemplate,recipients:recipients}}; 
		mailLogDao.save(mailLog, function(err){ log.debug("Mailog stored" ,err)});
	}
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
					self.createMailLog(req.body.template.baseData.subjectTemplate,req.body.template.baseData.textTemplate,req.body.template.baseData.htmlTemplate,req.currentUser,req.body.users);
				}
		} else { 
			log.verbose('Sending mail to users matching criteria',req.body.criteria);
			userDao.list(req.body.criteria,function(err,data){
					var users=[]
					for(var index in data){
						users.push(data[index].oid);
						self.resolveAndSend(req.body.template.baseData.subjectTemplate,req.body.template.baseData.textTemplate,req.body.template.baseData.htmlTemplate,data[index],req.currentUser);
					}
					self.createMailLog(req.body.template.baseData.subjectTemplate,req.body.template.baseData.textTemplate,req.body.template.baseData.htmlTemplate,req.currentUser,users);
			});
		}
		res.send(200,'');

	};

};	

module.exports = {
	MassmailingController : MassmailingController
};
