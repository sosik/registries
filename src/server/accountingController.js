'use strict';

var extend = require('extend');

var log = require('./logging.js').getLogger('accountingController.js');
var QueryFilter = require('./QueryFilter.js');
var universalDaoModule = require('./UniversalDao.js');
var dateUtils = require('./DateUtils.js').DateUtils;
var async = require('async');

var DEFAULT_CFG ={};



function VirtualAccount(){
		this.dates=[];
		this.trans={};
		var self=this;


		this.addDate=function(date){
			this.dates.push(date);
			this.dates=this.dates.sort(function(a,b){
				if (a < b)
     				return -1;
  				if (a > b)
    				return 1;
  				return 0;});
		};

		this.getTrans=function(revdate){

			if (!this.trans[revdate]){
				this.trans[revdate]={credits:[],debits:[],balance:0,date:revdate};
				this.addDate(revdate);
			}

			return this.trans[revdate];
		};

		this.credit=function(revdate,value,entity){
			if (!revdate) return;
			var trs=this.getTrans(revdate);
			trs.credits.push({value:value,entity:entity});
		};

		this.debit=function(revdate,value,entity){
			if (!revdate) return;
			var trs=this.getTrans(revdate);
			trs.debits.push({value:value,entity:entity});
		};

		this.history=function(){
			return this.dates.map(function (date){
				return self.trans[date];
			});
		};

		this.recount = function(){
			var toPay=[];
			var paid=[];

			var toSpend=[];

			var balance =0;

			this.history().forEach(function(tr){
				tr.credits.map(function(credit){
					balance+=credit.value;
					credit.toSpend=credit.value;
					toSpend.push(credit);

				});

				tr.debits.map(function(debit){
					toPay.push(debit);
					debit.toPay=debit.value;
					debit.paid=0;
					debit.dateOfPayment=null;
				});

				if (balance>0){
					var payedCount=0;

					var toSpendUsed=null;
					toPay.forEach(function(debit){
						if (balance>0){
							if (balance>=debit.toPay){
							// full fee payed
								debit.paid=debit.entity.baseData.membershipFee;
								payedCount++;
								debit.dateOfPayment=tr.date;
								balance-=debit.toPay;
								toSpendUsed=spend(toSpend,debit.toPay);
								debit.toPay=0;
								toSpend=toSpendUsed.toSpend;
								debit.used=toSpendUsed.used;
								debit.fullyPayed=true;
								paid.push(debit);
							} else {
								// partially paid fee
								debit.paid+=balance;
								debit.toPay-=balance;
								debit.entity.baseData.membershipFeePaid=debit.entity.baseData.membershipFee-debit.toPay;
								spend(toSpend,balance);
								toSpendUsed=spend(toSpend,balance);
								balance=0;
								debit.used=toSpendUsed.used;
								toSpend=toSpendUsed.toSpend;
							}
						}
					});
					toPay.splice(0,payedCount);
				}
			});
			return{paid:paid,toPay:toPay,balance:balance};
		};
		function spend(credits,amount){

			var required=amount;
			var used=[];
			var toSpend=[];

			var useMore=true;
			credits.forEach(function(credit){

				if (useMore){
					if (required==credit.toSpend){
						required-=credit.toSpend;
						used.push(credit);
						useMore=false;
					}else if (required<credit.toSpend){
						used.push(credit);

						credit.toSpend-=required;
						toSpend.push(credit);
						useMore=false;
					} else if (required>credit.toSpend){
						used.push(credit);
						required-=credit.toSpend;
					}
				}else {
					toSpend.push(credit);
				}
			});
			return	{toSpend:toSpend,used:used};
		}
	}


var AccountingController = function(mongoDriver, schemaRegistry, options) {

	var cfg = extend(true, {}, DEFAULT_CFG, options);

	var peopleDao = new universalDaoModule.UniversalDao(
				mongoDriver,
				{collectionName: 'people'}
			);
	var feesDao = new universalDaoModule.UniversalDao(
		mongoDriver,
		{collectionName: 'fees'}
	);

	var paymentsDao = new universalDaoModule.UniversalDao(
		mongoDriver,
		{collectionName: 'payments'}
	);

	var self=this;

	this.getUserInfo = function(req, res,next) {

		if (!req.params.userId){
			log.error('userId not present');
			next('userId not present');
			return;
		}

		//verify authorization

		self.recountPerson(req.params.userId,function(err,data){if (err){next(err);log.error(err);return;} res.send(data)})
	};


	this.getClubInfo = function(req, res,next) {

		if (!req.params.clubId){
			log.error('clubId not present');
			next('clubId not present');
			return;
		}

		//get users fees and payments
		var qf=QueryFilter.create();
		qf.addCriterium('hockeyPlayerInfo.clubName.oid','eq',req.params.clubId)
		qf.addCriterium('membershipFeeInfo.membershipFee','ex',null);
		qf.addCriterium('hockeyPlayerInfo.isActivePlayer','eq','TRUE');
		qf.addSort('baseData.surName.c', 'asc');

		peopleDao.find(qf,function(error,players){

			var tocall=players.map(function(player){
				return function(callback){
					self.recountPerson(player.id,function(err,data){if(err){callback(err);return; }
					data.entity=player;
					callback(null,data);});
				}
			});
			async.parallelLimit(tocall, 10,function(err,data){
				self.aggregateResults(data,function(err,data){
					res.send(data);
				})
			});
		});





		//verify authorization

	};

	function countToPay(arr){
		var result=0;
		arr.forEach(function(item){
			result+=Number(item.toPay);
		})
		return result;
	}
	this.aggregateResults=function(data,callback){

		var overal={feesOverdue:0,
					feesOverdueValue:0,
					feesToPay:0,
					feesToPayValue:0,
					};

		var peoples=data.map(function(personInfo){
			var credit=0;
			if (personInfo.counted.balance>0){
				credit=personInfo.counted.balance;
			}
			var personLine={
				name:personInfo.entity.baseData.name.v,
				surName:personInfo.entity.baseData.surName.v,
				fee:personInfo.entity.membershipFeeInfo.membershipFee,
				paidValue: -1,
			 	feesToPay:personInfo.counted.toPay.length,
			 	feesToPayValue:countToPay(personInfo.counted.toPay),
				feesOverdue: personInfo.overDue.count,
				feesOverdueValue:personInfo.overDue.sum,
				paymentSum:personInfo.paymentSum,
				credit: credit,
				assocMember: personInfo.entity.otherInfo.stateOfPerson
			};

			overal.feesToPay+=personLine.feesToPay;
			overal.feesToPayValue+=personLine.feesToPayValue;
			overal.feesOverdue+=personLine.feesOverdue;

			overal.feesOverdueValue+=personLine.feesOverdueValue;

			return personLine;
		});

		// var data={people:peoples,overal:overal,raw:data};
		var data={people:peoples,overal:overal};

		callback(null,data);
	};

	this.recountPerson=function(peopleId,callback){

			//get users fees and payments
			var qf=QueryFilter.create();
			qf.addCriterium('baseData.member.oid','eq',peopleId);
			// qf.addSort('baseData.accountingDate','asc');

			var va =  new VirtualAccount();

			var result={};


			paymentsDao.find(qf,function(err,payments){

				if (err){
					log.error(err);
					return;
				}

				result.payments=payments;

				var qf=QueryFilter.create();
				qf.addCriterium('baseData.member.oid','eq',peopleId);


				result.paymentSum = 0;
				payments.forEach(function(payment){
					va.credit(payment.baseData.accountingDate,payment.baseData.amount,payment);
					result.paymentSum += payment.baseData.amount;
				});

				feesDao.find(qf,function (err,fees){

					if (err){
						log.error(err);
						return;
					}

					fees.forEach(function(fee){
						va.debit(fee.baseData.setupDate,fee.baseData.membershipFee,fee);
					});

					var counted=va.recount();

					result.counted=counted;


					var overDue={new:[],old:[],sum:0,count:0};
					result.overDue=overDue;
					counted.toPay.forEach(function(topay){
						topay.entity.baseData.membershipFeePaid=topay.paid;
						if (topay.entity.baseData.feePaymentStatus=='created' ){
							if (topay.entity.baseData.dueDate<dateUtils.nowToReverse()){
								overDue.new.push(topay);
								overDue.sum+=(topay.entity.baseData.membershipFee-topay.entity.baseData.membershipFeePaid);
								overDue.count++;
								topay.entity.baseData.feePaymentStatus='overdue';

							}
							topay.entity.baseData.dateOfPayment=topay.dateOfPayment;
							topay.entity.baseData.membershipFeePaid=topay.paid;
							if (topay.used){
								topay.entity.listOfPayments={payments:topay.used.map(function(used){
									return {registry:'payments',oid:used.entity.id};
								})};
							}

						} else if (topay.entity.baseData.feePaymentStatus=='overdue' ||topay.entity.baseData.feePaymentStatus=='refunded'){
							topay.entity.baseData.feePaymentStatus='overdue';
							if (topay.entity.baseData.dueDate>dateUtils.nowToReverse()){
								topay.entity.baseData.feePaymentStatus='created';
							} else {
								overDue.old.push(topay);
								overDue.sum+=(topay.entity.baseData.membershipFee-topay.entity.baseData.membershipFeePaid);
								overDue.count++;
							}
							if (topay.used){
								topay.entity.listOfPayments={payments:topay.used.map(function(used){
									return {registry:'payments',oid:used.entity.id};
								})};
							}
							topay.entity.baseData.dateOfPayment=topay.dateOfPayment;
							topay.entity.baseData.membershipFeePaid=topay.paid;
						}
					});
					callback(null,result);
				});
			});
		};

};





module.exports = {
	AccountingController : AccountingController
};
