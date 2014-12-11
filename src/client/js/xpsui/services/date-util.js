(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:DateUtil',['xpsui:logging', '$translate', function(log, $translate) {
		
		function getDateFromYYYYMMDD(value){
			var year = value.substring(0,4),
				month = value.substring(4,6),
				day = value.substring(6,8)
			;
			
			if (year.length === 4 && month.length === 2 && day.length === 2) {
				return new Date(year, month-1, day);
			}
			return null;
		}
		
		function getDateFromDMYYYY(value){
			if (/^[0-9]{1,2}\.[0-9]{1,2}\.[1-9][0-9][0-9][0-9]$/.test(value)) {
				var s = value.split('.');
				var day = parseInt(s[0]);
				var month = parseInt(s[1]);
				var year = parseInt(s[2]);

				if ((day > 0 && day < 32) &&
					(month > 0 && month <13) &&
					(year > 0 && year < 10000)
				) {
					var d = new Date();
					d.setDate(day);
					d.setMonth(month -1);
					d.setYear(year);
					return d;
				}
			}	
			return null;
		}
		
		
		function formatterDMYYYY(date){
			if (angular.isString(date) ){
				date = getDateFromYYYYMMDD(date);
			}
			
			if (date instanceof Date) {
				return date.getDate() + '.' + (date.getMonth()+1) + '.' + date.getFullYear();
			}
			
			return null;
		}
		
		function formatterYYYYMMDD(date) {
			if (date instanceof Date) {
				var ys = date.getFullYear().toString(10);

				var ms = (date.getMonth() + 1).toString(10);
				if (ms.length < 2) {
					ms = '0'.concat(ms);
				}

				var ds = date.getDate().toString();
				if (ds.length < 2) {
					ds = '0'.concat(ds);
				}

				return ds.conat('.',ms,'.',ys);
			}
			
			return null;
		}

		function parserDMYYYY(value){
			var date;
			
			if (angular.isDate(value)) {
				date = new Date(value.getTime()) ;
			} else {
				date = getDateFromDMYYYY(value);
			}
			
			if (angular.isDate(date)) {
				var ys = date.getFullYear().toString(10);
				var ms = (date.getMonth() + 1).toString(10);
				if (ms.length < 2) {
					ms = '0'.concat(ms);
				}
				var ds = date.getDate().toString();
				if (ds.length < 2) {
					ds = '0'.concat(ds);
				}

				return ys.concat(ms, ds);
			}
			
			return null;
		}

		function nowToReverse() {
			return parserDMYYYY(new Date());
		};

		return {
			getDateFromYYYYMMDD: getDateFromYYYYMMDD, 
			nowToReverse: function () {
				return nowToReverse();
			},
			formatter:function(value) {
				if (value) {
					var string = formatterDMYYYY(value);
					if(string){
						return string;
					}

					return value;
				}
				return '';
			},
						
			parser: function(value) {
				if (value) {
					var string = parserDMYYYY(value);
					if(string){
						return string;
					}
					// invalid
					return undefined;
				}
			},
			
			formatterToBackend: function(value) {
				if (value) {
					var string = formatterYYYYMMDD(value);
					if(string){
						return string;
					}

					return value;
				}
				return '';
			},

			getNameOfMonth: function(month){
				if (month == 0){
					return $translate.instant('date.jan');
				}else if (month == 1){
					return $translate.instant('date.feb');
				}else if (month == 2){
					return $translate.instant('date.mar');
				}else if (month == 3){
					return $translate.instant('date.apr');
				}else if (month == 4){
					return $translate.instant('date.may');
				}else if (month == 5){
					return $translate.instant('date.jun');
				}else if (month == 6){
					return $translate.instant('date.jul');
				}else if (month == 7){
					return $translate.instant('date.aug');	
				}else if (month == 8){
					return $translate.instant('date.sep');
				}else if (month == 9){
					return $translate.instant('date.oct');
				}else if (month == 10){
					return $translate.instant('date.nov');
				}else if (month == 11){
					return $translate.instant('date.dec');
				}
			}
		};
	}])

}(window.angular));