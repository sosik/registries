'use strict';

var extend = require('extend');
var log = require('./logging.js').getLogger('MassmailingController.js');
var renderServiceModule= require('./renderService.js');
var universalDaoModule = require('./UniversalDao.js');
var QueryFilter = require('./QueryFilter.js');

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

	this.resolveAndSend=function(subjectTemplate,textTemplate,htmlTemplate,user,sender,mailId){

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

			if (!htmlTemplate){
				htmlTemplate=textTemplate;
			}

			if(htmlTemplate){
				htmlTemplate='<img src="{{mailId}}">'+htmlTemplate;
				resolvedHtml=renderService.renderInstant(htmlTemplate,{locals:{'recipient':user,'sender':sender,mailId:mailId}});
			}

			var mailOptions = {
				from : cfg.mails.massmailSenderAddress,
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

	this.createMailLog=function(subjectTemplate,textTemplate,htmlTemplate,sender,recipient,callback){
		var mailLog = {baseData:{subject:subjectTemplate, text:textTemplate, htmlTemplate:htmlTemplate,sender:{'registry' : 'people',
			'oid' : sender.id},recipient:{'registry' : 'people',
			'oid' : recipient.id,},sentOn:new Date().getTime()}};
		mailLogDao.save(mailLog, callback);
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
						var mailId=self.createMailLog(req.body.template.baseData.subjectTemplate,req.body.template.baseData.textTemplate,req.body.template.baseData.htmlTemplate,req.currentUser,user,function(err,data){
							if (err) {
								res.status(500).json(err);
								log.err(err);
								return;
							}
							self.resolveAndSend(req.body.template.baseData.subjectTemplate,req.body.template.baseData.textTemplate,req.body.template.baseData.htmlTemplate,user,req.currentUser,data.id);
						}


						);
					});
				}
		} else {
			log.verbose('Sending mail to users matching criteria',req.body.criteria);


		var qf=QueryFilter.create();

		for(var c in req.body.criteria){
			qf.addCriterium(req.body.criteria[c].f,req.body.criteria[c].op,req.body.criteria[c].v);
		}


			userDao.list(qf,function(err,data){
							if (err) {
								res.status(500).json(err);
								log.err(err);
								return;
							}

						data.map(function(user){

							var mailId=self.createMailLog(req.body.template.baseData.subjectTemplate,req.body.template.baseData.textTemplate,req.body.template.baseData.htmlTemplate,req.currentUser,user,function(err,data){
							if (err) {
								res.status(500).json(err);
								log.err(err);
								return;
							}
							self.resolveAndSend(req.body.template.baseData.subjectTemplate,req.body.template.baseData.textTemplate,req.body.template.baseData.htmlTemplate,user,req.currentUser,data.id);
						});
				});
		});

		}
		res.send(200,'');

	};

};

module.exports = {
	MassmailingController : MassmailingController
};
