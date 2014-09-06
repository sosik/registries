'use strict';

var extend = require('extend');
var async = require('async');

var QueryFilter = require('./QueryFilter.js');

var log = require('./logging.js').getLogger('StatisticsController.js');

var universalDaoModule = require('./UniversalDao.js');

var DEFAULT_CFG = {

};


var StatisticsController = function(mongoDriver, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);
	


	this.getStatistics=function(req,res){
		var t=this;
		var responseToSend={baseData:{}};
		
		async.parallel([
				function(callback){
					t.getNumberOfMembers(function(err,data){
						responseToSend.baseData.numberOfMembers=data;
						callback();
					});
				},
				function(callback){
					t.getNumberOfWomen(function(err,data){
						responseToSend.baseData.numberOfWomen=data;
						callback();
					});
				}

			],function(err){
				if (err){
					res.send(500,err);
					return;
				}
				res.send(200,responseToSend);
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

		dao.count(QueryFilter.create().addCriterium("baseData.gender", QueryFilter.operation.EQUAL, "Z"),function(err,data){
			callback(err,data);
		});
	};

};

module.exports = {
	StatisticsController : StatisticsController
};
