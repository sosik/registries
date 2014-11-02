'use strict';
var fs = require('fs');


var mongoDriver = require('./../../build/server/mongoDriver.js');
var config = require('./../../build/server/config.js');
var renderServiceModule= require('./../../build/server/renderService.js');

var universalDaoModule = require('./../../build/server/UniversalDao.js');

var schemaRegistryModule = require('./../../build/server/schemaRegistry.js');

var universalDaoControllerModule = require('./../../build/server/UniversalDaoController.js');

var dateUtils = require('./../../build/server/DateUtils.js').DateUtils;

var async = require('async');
var path= require('path');
var uuid = require('node-uuid');
var util= require('util');



process.argv.forEach(function(val, index, array) {
	console.log(index + ': ' + val);
});

console.log('file to process', process.argv[2]);

var schema='uri://registries/member#new';

mongoDriver.init(config.mongoDbURI, function(err) {
	if (err) {
		throw err;
	}

	var schemasListPaths = JSON.parse(
		fs.readFileSync(path.join(config.paths.schemas, '_index.json')))
		.map(function(item) {
			return path.join(config.paths.schemas, item);
	});

	var schemaRegistry = new schemaRegistryModule.SchemaRegistry({schemasList:schemasListPaths});
	var udc = new universalDaoControllerModule.UniversalDaoController(mongoDriver, schemaRegistry);
	var renderService = new renderServiceModule.RenderService();

	var feeDao = new universalDaoModule.UniversalDao(mongoDriver, {
				collectionName :'fees'
	});

	fs.mkdir('mails',function(e){
		if(!e || (e && e.code === 'EEXIST')){
				//do something with contents
			} else {
				//debug
				console.log(e);
			}
			var uid=uuid.v4();
			go(udc,feeDao,renderService,schema,uid,function(err){if (err) console.log(err); mongoDriver.close(); console.log('import.id',uid) });
	});

});


function go(udc,feeDao,renderService,schema,uid,callback) {

	var createdOn=new Date();

	var req={params:{schema:schema},body:{'criteria':[{'f':'membershipFeeInfo.paymentFrequency','v':'12xročne','op':'eq'},{'f':'hockeyPlayerInfo.isActivePlayer','v':'Áno','op':'eq'}]}};

	var res=function (){
		this.send=function (code ,data){
			iterateData(uid,data,udc,feeDao,renderService,createdOn,callback);
		};
		this.status=function(status){
			return this;
		};
		this.json=function(data){
			iterateData(uid,data,udc,feeDao,renderService,createdOn,callback);
		};
	};

	util.inherits(res, require('stream').Writable);
	res= new res();

	req['perm']={'Registry - read':true};

	udc.searchBySchema(req,res);

}


function iterateData(uid,data,udc,feeDao,renderService,createdOn,cb){
	var index=1;
	var toCall=data.map(function (item){
		return function(callback){
			mongoDriver.nextSequence('feeIndex',function(err,data){
				saveItem(uid,item,udc,feeDao,renderService,data.seq%1000000,createdOn,callback);
			});
		};
	});

	async.parallel(toCall,cb);
}

function saveItem(uid,item,udc,feeDao,renderService,index,createdOn,callback){

		var bill = {"import":{id:uid}, baseData:{member:{registry:'people',oid:item.id},membershipFee:Number(item.membershipFeeInfo.membershipFee),
							setupDate:dateUtils.dateToReverse(createdOn),
							dueDate:dateUtils.dateToReverse(dateUtils.dateAddDays(createdOn,15)),feePaymentStatus:'created',variableSymbol:createVS(dateUtils.dateToReverse(createdOn),index)}};

		createMail(renderService,index,item,bill);
		feeDao.save(bill,callback);

}

function createVS(createdOnReverse, index){
	var i=''+index;
	while (i.length<6){
		i='0'+i;
	}

	return createdOnReverse.substring(2,6)+i;
}


function createMail(renderService,index,user,bill){
	var template=
'From: websupport@caihp.unionsoft.eu\n'+
'To: {{email}}\n'+
'Return-Path: websupport@unionsoft.sk\n'+
'MIME-Version: 1.0\n'+
'Subject: Členský příspěvek.\n'+
'Content-Type: multipart/alternative;\n'+
' boundary="PAA08673.1018277622/unionsoft.sk"\n\n'+

'This is a multipart message in MIME format.\n\n'+

'--PAA08673.1018277622/unionsoft.sk\n'+
'Content-type: text/plain; charset="UTF-8"\n'+
'Ahoj {{name}},\n\n'+
'Dovol mi oznámit ti výši členského příspěvku za členství v České asociaci hokejistů a to {{fee}} Kč měsíčně.\n\n\n'+
'Platbu můžeš uskutečnit následním způsobem: \n\n'+
'\tbankovním převodem na účet asociace 2110167935/2700, var. symbol {{variableSymbol}}, do poznámky (popisu platby) napiš pro jistotu své jméno a příjmení\n\n'+
'Díky\n\n'+
'Marek Černošek\n'+
'Předseda';


// '--PAA08673.1018277622/server.xyz.com\n'+
// 'Content-Type: text/html\n'+
// '{{htmlVersion}}\n'+
// '--PAA08673.1018277622/server.xyz.com\n'+


	var resolvedHtml=renderService.renderInstant(template,{locals:{'name':user.baseData.name,'surname':user.baseData.surName,email:user.contactInfo.email,'fee':bill.baseData.membershipFee,'variableSymbol':bill.baseData.variableSymbol}});

	fs.writeFile('mails/mail-'+bill.baseData.variableSymbol+'-'+user.baseData.name+'.'+user.baseData.surName+'.toSend',resolvedHtml, function(err) {
		if(err) {
				console.log(err);
		}
	});


}
