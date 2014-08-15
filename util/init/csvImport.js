var fs = require('fs'), readline = require('readline');
var mongoDriver = require('./../../build/server/mongoDriver.js');
var config = require('./../../build/server/config.js');
var QueryFilter = require('./../../build/server/QueryFilter.js');
var universalDaoModule = require('./../../build/server/UniversalDao.js');

var async = require('async');

var path = process.cwd() + '/util/init/hockey-players.csv';

process.argv.forEach(function(val, index, array) {
	console.log(index + ': ' + val);
});

console.log('file to process', process.argv[2]);

if (process.argv[2]) {
	path = process.cwd() + '/' + process.argv[2]
}

mongoDriver.init(config.mongoDbURI, function(err) {
	if (err) {
		throw err;
	}
	parse();
});

function parse() {

	var rd = readline.createInterface({
			input : fs.createReadStream(path),
			output : process.stdout,
			terminal : false
	});

	var def = null;
	var lineN = 1;

	var dao = null;

	rd.on('line', function(line) {

		if (!def) {
			var parts = line.split(';');
			def = parseDef(parts);
			if (def.save) {
				dao = new universalDaoModule.UniversalDao(mongoDriver, {
					collectionName : def.save
				});
			}
		} else {

			line = line.replace(/^.*\(/, '').replace(/\);\s*$/, '').replace(/\)\,\s*$/, '');
			line=line.replace('NULL','\'\'');
			var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
			
			
			var parts = [];// Initialize array to receive values.
			line.replace(re_value, // "Walk" the string using replace with callback.
						function(m0, m1, m2, m3) {
//				console.log(m0, m1, m2, m3);
								// Remove backslash from \' in single quoted values.
								if      (m1 !== undefined) parts.push(m1.replace(/\\'/g, "'"));
								// Remove backslash from \" in double quoted values.
								else if (m2 !== undefined) parts.push(m2.replace(/\\"/g, '"'));
								else if (m3 !== undefined) parts.push(m3);
								return ''; // Return empty string.
						});
				// Handle special case of empty last value.
//		    if (/,\s*$/.test(text)) a.push('');
				
			parts=line.split(';');
			console.log('DDDDDDDD>>>',parts);

			if (def.collDef.length != parts.length) {
				console.log('line', lineN, ' does not match def.-->', def.collDef.length,parts.length ,'\n', line,'\n', parts.join('|'));
				console.log(def);
				return;
			}

			var json = createJson(def, lineN, parts);

			if (def.resolve) {
				
				var resovleFs=[];
				def.resolve.map(function(toResolve){
					resovleFs.push(function(callback){
						if (toResolve.byBirthNumber){
							resolveByBirthNumberToObjectLink(json,toResolve.attribute,callback);
						}
						else
						if (toResolve.byName){
							resolveByNameToObjectLink(json,toResolve.attribute,callback);
						}
						else {
							resolveToObjectLink(json,toResolve.attribute,callback);
						}
					})
				});
				
				async.parallel(resovleFs, function( err ){
					dao.save(json, function(err, data) {
						console.log('saved', json);
					});
				} );
			}
			else
			{
				if (json) {
					if (def.save) {
						dao.save(json, function(err, data) {
							console.log('Object saved ', lineN);
						});
					} else {
						console.log(json);
					}
				}
			}
		}
		lineN++;
	});
}

function resolveToObjectLink(json,path,callback){

	var parts=path.split('.');
	
	var obj = json;
	var prev;
	var lastPart = null;
	parts.map(function(part) {
		obj = obj[part];
		lastPart = part;
	});
	
	console.log(json);
	var daoLink = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : obj.registry
	});
	
	daoLink.list(QueryFilter.create().addCriterium('import.id', QueryFilter.operation.EQUAL,''+obj.unresolved), function(err,data){
		if (err) {
			callback(err);
			return
		} 
		if (data.length===0){
			callback(null);
			console.log('Not able to resolve',obj);
			return;
		}
		obj.oid=data[0].id;
		delete obj.unresolved;
		callback(null);
	} );
}

function resolveByNameToObjectLink(json,path,callback){

	var parts=path.split('.');
	
	var obj = json;
	var prev;
	var lastPart = null;
	parts.map(function(part) {
		obj = obj[part];
		lastPart = part;
	});
	
	console.log(json);
	var daoLink = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : obj.registry
	});
	console.log('>>>>> ',obj.registry);
	
	daoLink.list(QueryFilter.create().addCriterium('club.name', QueryFilter.operation.EQUAL,''+obj.unresolved.trim()), function(err,data){
		if (err) {
			callback(err);
			return
		} 
		if (data.length===0){
			callback(null);
			console.log('Not able to resolve',obj);
			return;
		}
		obj.oid=data[0].id;
		delete obj.unresolved;
		callback(null);
	} );
}



function resolveByBirthNumberToObjectLink(json,path,callback){

	var parts=path.split('.');
	
	var obj = json;
	var prev;
	var lastPart = null;
	parts.map(function(part) {
		obj = obj[part];
		lastPart = part;
	});
	
	console.log(json);
	var daoLink = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : obj.registry
	});
	console.log('>>>>> ',obj.registry);
	
	daoLink.list(QueryFilter.create().addCriterium('baseData.id', QueryFilter.operation.EQUAL,''+obj.unresolved.trim()), function(err,data){
		if (err) {
			callback(err);
			return
		} 
		if (data.length===0){
			callback(null);
			console.log('Not able to resolve',obj);
			return;
		}
		obj.oid=data[0].id;
		delete obj.unresolved;
		callback(null);
	} );
}


/**
 * default conversion
 * 
 * @param item
 * @returns
 */
function defConversion(item) {

	var val= item.trim().replace(/\'/g, '');
	if (val.length){
		return val;
	}
	return null;
}

/**
 * creates definitions from form below ->[fn1->...->fnX]->dst_field
 * 
 */
function parseDef(rawDef) {
	var def = {};
	var collDef = [];
	def.collDef = collDef;

	rawDef.map(function(item) {
		var items = item.trim().split('->');

		switch (items[0]) {
		case '$save$':
			def.save = items[1];
			break;
		case '$resolve$':
			if (!def.resolve) {
				def.resolve = [];
			}
			def.resolve.push({attribute:items[1]});
			break;
		case '$resolveByName$':
			if (!def.resolve) {
				def.resolve = [];
			}
			
			def.resolve.push({attribute:items[1],byName:true});
			break;
			case '$resolveByBirthNumber$':
			if (!def.resolve) {
				def.resolve = [];
			}
			
			def.resolve.push({attribute:items[1],byBirthNumber:true});
			break;
		default:

			if (items.length == 1) {
				collDef.push({
						from : item,
						to : item,
						convert : [ defConversion ]
				});
			} else if (items.length == 2) {
				collDef.push({
						from : items[0],
						to : items[1],
						convert : [ defConversion ]
				});
			} else if (items.length > 2) {
				collDef.push({
						from : items[0],
						to : items[items.length - 1],
						convert : items.slice(1, items.length - 1)
				});
			}
			break;
		}

	});

	console.log('parsed def', def);
	return def;
}

// Calls function(s) to resolve value
function convertValue(d, v) {
	var tmp = v;	
	d.convert.map(function(fun) {
		if (typeof (fun) == 'function') {
			tmp = fun(tmp);
		} else {
			try {
				if (tmp==null){
					tmp = eval(fun + "(null)");
				} else{
					tmp = eval(fun + "(\'" + tmp + "\')");
				}
			} catch (err) {
				console.log('Not able to evaluate ', fun, ' on ', tmp,err);
			}
		}
	});

	return tmp;
}

function separateFullstop(item){
	return item.replace('\.','\. ');
}

function applyValue(o, d, v) {
	var path = d.to;
	if ('null' === path) {
		return;
	}
	var parts = path.split('.');
	var obj = o;
	var prev;
	var lastPart = null;
	parts.map(function(part) {
		if (!obj[part]) {
			obj[part] = {}
		}
		;
		prev = obj;
		obj = obj[part];
		lastPart = part;
	});
	var val = convertValue(d, v);
	if (val){
		prev[lastPart]=val;
	} else {
		prev[lastPart]=null;
	}
}

function objLinkOrganization(item) {
	var ret=	{
			"registry" : "organizations",
			"oid" : "",
			unresolved : item
	};
	console.log(ret);
	return ret;
}

function objLinkPeople(item) {
	var ret=	{
			"registry" : "people",
			"oid" : "",
			unresolved : item
	};
	console.log(ret);
	return ret;
}

function createJson(def, lineNr, line) {
	var retVal = {};

	var index = 0;
	def.collDef.map(function(def) {
		applyValue(retVal, def, line[index++]);
	});

	return retVal;

}

// CONVERSIONS
function upCase(item) {
	return item.toUpperCase();
}


function lowerCase(item) {
	return item.toLowerCase();
}

function zeroToNull(item){
	if ('0'==item) return null;
	return item;
}


function reformatDate(date){
	if (!date) {
		return null;
	}
	var parts=date.toString().split('-');
	if (parts.length===3){
		return parts[2]+'.'+parts[1]+'.'+parts[0];
	}
	else {
		console.log('!!!'+ date);
		return 'invalid '+date;
	}
}

function part1(str){
	if (!str) return null;
	return str.split(' ')[0];
}

function part2(str){
	if (!str) return null;
	
	return str.split(' ')[1];
}

function mapGenderTrueFalse(item){
	if (item == 'TRUE') { 
		return 'M';
	}
	if (item == 'FALSE') { 
		return 'Z';
	}
	return null;
}

function camelCase(input) { 
		return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		// return input.toLowerCase();
}

function mapDochodca(item) {
	if (item==="D") { 
		return 'Dôchodca';
	}
	return null;
}

function mapTrueFalse(item){
	if (item.toLowerCase()=='true'){
		return 'A';
	} else {
		return 'N';
	}

}

function mapPoDohodeStudium(item){
	if ("1"==item){
		return "Po dohode";
	}
	return "Počas štúdia";

} 

function fullDate(item){
	if (!item)return null;
	if (item.length===4) {
		return "1.1."+item;
	}
	return item;
}

function fullDateEndYear(item){
	if (!item||null==item)return null;

	if (item.length===4) {
		return "31.12."+item;
	}
	return item;
}

function mapInvalid(item){
	if (item ==="I") return 'A'; 
	return 'N'; 
}

function mapZaznamPlatnyNeplatny(item){
	if('Platný'==item){
		return 'A';
	}
	else {
		return 'N';
	}
}

function mapAktivna(item){
	if ('Aktívna'==item){
		return "aktívna";
	}
	return "neaktívna"
}

function parseDateMix(item)	{ 
	if (!item) return null;

	if (item.indexOf('/')>-1){
		var parts=item.split('/');
		return parts[1]+"."+parts[0]+"."+parts[2];
	}
	return item;

}

function mapPT(item){
	if ('P'==item){
		return  "prestup";
	}
		return "hosťovanie"
}

function remapPlayerPosition(item){
	
	var values={
				'1': 'brankář',
				'2': 'obránce',
				'3': 'útočník'
	};
	
	return values[item];
	
}
