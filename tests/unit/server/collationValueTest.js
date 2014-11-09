var collation = require (process.cwd() + '/src/server/sortingValuesMaker.js');
var expect = require('chai').expect;

describe('value making', function(){
	it('should calculate collation value of string to array',function(done){

		var string11 = "dzaaaa";
		var string8 = "ďzabc";
		var string6 = "čchḅas";
		var string1 = "┏┏┏┏┣┣";
		var string5 = "aaaach";
		var string4 = "aaaad";
		var string10 = "Dzaaas";
		var string9 = "DZzzzz";
		var string13 = "šťDWz";
		var string12 = "DŽasca";
		var string7 = "ďakui";
		var string2 = "01923";
		var string3 = "98987";
		var string14 = "šťDW┣ccc";
		var string15 = "šťD┣zxccx";
		var string16 = "š┣DWzxcxc";
		var string17 = "šťDWzxch";
		var string18 = "šťWzcb";
		var string19 = "šťďaWzcb";
		var string20 = "šťdzDWz";

		var valStr1 = collation.getCollationKey(string1);
		var valStr2 = collation.getCollationKey(string2);
		var valStr3 = collation.getCollationKey(string3);
		var valStr4 = collation.getCollationKey(string4);
		var valStr5 = collation.getCollationKey(string5);
		var valStr6 = collation.getCollationKey(string6);
		var valStr7 = collation.getCollationKey(string7);
		var valStr8 = collation.getCollationKey(string8);
		var valStr9 = collation.getCollationKey(string9);
		var valStr10 = collation.getCollationKey(string10);
		var valStr11 = collation.getCollationKey(string11);
		var valStr12 = collation.getCollationKey(string12);
		var valStr13 = collation.getCollationKey(string13);
		var valStr14 = collation.getCollationKey(string14);
		var valStr15 = collation.getCollationKey(string15);
		var valStr16 = collation.getCollationKey(string16);
		var valStr17 = collation.getCollationKey(string17);
		var valStr18 = collation.getCollationKey(string18);
		var valStr19 = collation.getCollationKey(string19);
		var valStr20 = collation.getCollationKey(string20);

		var compare = function(arr1,arr2){
			var result = 0;
			for (i = 0;i<5;i++){
				if (arr1[i]<arr2[i]){
					result = 1;
					break;
				} else if (arr1[i]>arr2[i]){
					result = 2;
					break;
				}
			}

			return result;
		};

		expect(compare(valStr1,valStr2)).to.be.equal(1);
		expect(compare(valStr2,valStr3)).to.be.equal(1);
		expect(compare(valStr3,valStr4)).to.be.equal(1);
		expect(compare(valStr4,valStr5)).to.be.equal(1);
		expect(compare(valStr5,valStr6)).to.be.equal(1);
		expect(compare(valStr6,valStr7)).to.be.equal(1);
		expect(compare(valStr7,valStr8)).to.be.equal(1);
		expect(compare(valStr8,valStr9)).to.be.equal(1);
		expect(compare(valStr9,valStr10)).to.be.equal(1);
		expect(compare(valStr10,valStr11)).to.be.equal(1);
		expect(compare(valStr11,valStr12)).to.be.equal(1);
		expect(compare(valStr12,valStr13)).to.be.equal(1);
		expect(compare(valStr14,valStr13)).to.be.equal(1);
		expect(compare(valStr15,valStr14)).to.be.equal(1);
		expect(compare(valStr16,valStr15)).to.be.equal(1);
		expect(compare(valStr13,valStr13)).to.be.equal(0);
		expect(compare(valStr18,valStr13)).to.be.equal(2);
		expect(compare(valStr19,valStr20)).to.be.equal(1);
		done();
	});
});
