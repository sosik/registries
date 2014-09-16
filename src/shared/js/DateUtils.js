var DateUtils = function() {

	var self=this;
	this.reverseToStr=function(strReverseDate){

		var year = strReversDate.substring(0,4);
		var month = strReversDate.substring(4,6);
		var day = strReversDate.substring(6,8);
		if (year.length === 4 && month.length === 2 && day.length === 2) {
			var d = new Date(year, month-1, day);
			return d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear();
		}
		return null;
	};

	this.strAddDays=function(strDate,days){

		var year = strReversDate.substring(0,4);
		var month = strReversDate.substring(4,6);
		var day = strReversDate.substring(6,8);

		if (year.length === 4 && month.length === 2 && day.length === 2) {
			var d = new Date(year, month-1, day);
			d.setDate(d.getDate()+days);
			return self.dateToStr(d);
		}
		return null;
	};

	this.strToTS=function(strDate){

		if (!strDate) return null;

		var year = strDate.substring(0,4);
		var month = strDate.substring(4,6);
		var day = strDate.substring(6,8);

		if (year.length === 4 && month.length === 2 && day.length === 2) {
			var d = new Date(year, month-1, day);

			return d.getTime();
		}
		return null;
	};
	this.dateAddDays=function(dateDate,days){

		var d = new Date(dateDate);
		d.setDate(dateDate.getDate()+days);
		return (d);
	};



	this.dateToStr=function(dateDate){
		var ys = dateDate.getFullYear().toString(10);
		var ms = (dateDate.getMonth() + 1).toString(10);

		if (ms.length < 2) {
			ms = '0'.concat(ms);
		}

		var ds = dateDate.getDate().toString();
		if (ds.length < 2) {
			ds = '0'.concat(ds);
		}

		return ds.conat('.',ms,'.',ys);
	};

	this.dateToReverse=function(dateDate){
		var ys = dateDate.getFullYear().toString(10);
		var ms = (dateDate.getMonth() + 1).toString(10);

		if (ms.length < 2) {
			ms = '0'.concat(ms);
		}

		var ds = dateDate.getDate().toString();
		if (ds.length < 2) {
			ds = '0'.concat(ds);
		}

		return ys.concat(ms, ds);
	};


	this.strToReverse=function(strDate){
		var d = new Date();
		var s = value.split('.');
		if (s.length === 3) {
			var day = parseInt(s[0]);
			var month = parseInt(s[1]);
			var year = parseInt(s[2]);

			if ((day > 0 && day < 32) && (month > 0 && month <13) && (year > 0 && year < 10000)) {
				d.setYear(year);
				d.setMonth(month -1);
				d.setDate(day);
				return self.dateToStr(d);
			}
							// invalid
							return null;
						}
						// invalid
						return null;

					};
				};

				module.exports = {
					DateUtils: new DateUtils()
				};
