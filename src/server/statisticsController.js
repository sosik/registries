'use strict';

var extend = require('extend');
var async = require('async');

var QueryFilter = require('./QueryFilter.js');

var dateUtils = require('./DateUtils.js').DateUtils;

var log = require('./logging.js').getLogger('StatisticsController.js');

var universalDaoModule = require('./UniversalDao.js');

var DEFAULT_CFG = {

};


var StatisticsController = function(mongoDriver, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);



	this.getStatistics=function(req,res){
		var t=this;
		var responseToSend={baseData:{},fees:{paidCount:0,paidSum:0,overdueSum:0,overdueCount:0,expectedCount:0,expectedSum:0}};

		async.parallel([
				function(callback){
					t.getNumberOfMembers(function(err,data){
						responseToSend.baseData.numberOfMembers=data;
						callback(err);
					});
				},
				function(callback){
					t.getNumberOfWomen(function(err,data){
						responseToSend.baseData.numberOfWomen=data;
						callback(err);
					});
				},
				function(callback){
					t.getYearPaymentsStats(function(err,data){
							if (data){
								data.map(function(item){
									if (item._id.isNew===true){
										if ('created'==item._id.status){
											responseToSend.fees.expectedCount=item.count;
											responseToSend.fees.expectedSum=item.sum;
										} else if ('refunded'==item._id.status){
											responseToSend.fees.paidCount=item.count;
											responseToSend.fees.paidSum=item.sum;
										} else if ('overdue'==item._id.status){
											responseToSend.fees.overdueCount=item.count;
											responseToSend.fees.overdueSum=item.sum;
										}
									}
								});
							}

						callback(err);
					});
				}

			],function(err){
				if (err){
					res.status(500).send(err);
					return;
				}
				res.status(200).json(responseToSend);
			});

	};

	this.getNumberOfMembers=function(callback){

		var dao=new universalDaoModule.UniversalDao(mongoDriver, {
			collectionName : "people"
		});

		dao.count(QueryFilter.create(),function(err,data){
			callback(err,data);
		});
	};

	this.getNumberOfWomen=function(callback){

		var dao=new universalDaoModule.UniversalDao(mongoDriver, {
			collectionName : "people"
		});

		dao.count(QueryFilter.create().addCriterium("baseData.gender", QueryFilter.operation.EQUAL, "F"),function(err,data){
			callback(err,data);
		});
	};

	this.getYearPaymentsStats=function(callback){

		var dao=new universalDaoModule.UniversalDao(mongoDriver, {
			collectionName : "fees"
		});
		var strDate = dateUtils.dateToReverse( dateUtils.dateAddDays(new Date(),-365));
		//log.error(strDate);
		dao.aggregate([{$project:{"baseData.setupDate":1,isNew:{$gt:["$baseData.setupDate",strDate]},sum:1,count:1,'baseData.feePaymentStatus':1,'baseData.membershipFee':1}},{$group:{_id:{status:'$baseData.feePaymentStatus',isNew:'$isNew'},sum:{$sum:"$baseData.membershipFee"},count:{$sum:1}}}],callback);
	};


};

module.exports = {
	StatisticsController : StatisticsController
};
