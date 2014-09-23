'use strict';
var fs = require('fs'), readline = require('readline');
var extend = require('extend');

var mongoDriver = require('./../../build/server/mongoDriver.js');
var config = require('./../../build/server/config.js');
var QueryFilter = require('./../../build/server/QueryFilter.js');
var universalDaoModule = require('./../../build/server/UniversalDao.js');

var objectTools = require('./../../build/server/ObjectTools.js');

var async = require('async');

var path = null;

// process.argv.forEach(function(val, index, array) {
// 	console.log(index + ': ' + val);
// });

// console.log('file to process', process.argv[2]);

if (process.argv[2]) {
	path = process.cwd() + '/' + process.argv[2];
}

mongoDriver.init(config.mongoDbURI, function(err) {
	if (err) {
		throw err;
	}
	parseLines( function(){mongoDriver.close();});
});


var dao=null;

var DataSet = function() {
		this.lines = [];
		var that = this;
	this.collectLine = function(line) {
		that.lines.push(line);
	};
};

function parseLines(callback){

	var rd = readline.createInterface({
		input : fs.createReadStream(path),
		output : process.stdout,
		terminal : false
	});


	var dataSet2=new DataSet();
	rd.on('line', dataSet2.collectLine);
	rd.on('close', function(){processDataset(dataSet2,callback);});
}


function splitLine(line){
	return line.split(';');
}

function processDataset(dataset,callback){
 
	var importDefinition=parseDef( splitLine(dataset.lines[0]));
	var dataLines=dataset.lines.slice(1);
	// console.log(dataLines);

		if (importDefinition.save) {
				dao = new universalDaoModule.UniversalDao(mongoDriver, {
					collectionName : importDefinition.save
				});
			}

			if (importDefinition.merge) {
				dao = new universalDaoModule.UniversalDao(mongoDriver, {
					collectionName : importDefinition.merge.registry
				});
			}

	var lineProcessors=[];
	var lineNr=1;
	
	dataLines.map(function(line){	
		lineProcessors.push( function(callback){processLine(importDefinition,line,lineNr++,callback); });
	});

	async.parallel(lineProcessors,callback);
}


function processLine(def,line,lineNr,callback){

	var parts=splitLine(line);
	
	var json = createJson(def, lineNr, parts);

		if (def.resolve) {
				
				var resovleFs=[];
				def.resolve.map(function(toResolve){
					// console.log('----->',toResolve);
					resovleFs.push(function(callback2){
						if (toResolve.byBirthNumber){
							resolveByBirthNumberToObjectLink(json,toResolve.attribute,callback2);
						}
						else
						if (toResolve.byName){
							resolveByNameToObjectLink(json,toResolve.attribute,callback2);
						}
						else if (toResolve.path){
							resolveByPathToObjectLink(json,toResolve.attribute,toResolve.path,callback2);
						}
						else {
							resolveToObjectLink(json,toResolve.attribute,callback2);
						}
					});
				});
				
				async.parallel(resovleFs, function( err ){
				
				if (def.copy){
						def.copy.map(function(item){
						objectTools.setValue(json,item.to,objectTools.evalPath(json,item.from));
					});
				}

				if (def.merge){
						try {
							eval(def.merge.searchByMethod + '(json,dao,mergeAndSave,callback)');
						}	catch (err){
							console.log('Not able to evaluate ', def.merge.searchByMethod);
						}
					}else {
						dao.save(json, function(err, data) {
							console.log('line saved',lineNr,line,JSON.stringify(json));
							callback();
						});
					}

				} );
		}else {
			if (def.copy){
						def.copy.map(function(item){
						objectTools.setValue(json,item.to,objectTools.evalPath(json,item.from));
					});
				}
			
			if (def.merge){
						try {
							eval(def.merge.searchByMethod + '(json,dao,mergeAndSave,callback)');
						}	catch (err){
							console.log('Not able to evaluate ', def.merge.searchByMethod,err);
						}
					}else {
						dao.save(json, function(err, data) {
							console.log('line saved',lineNr,line, JSON.stringify(json));
							callback();
						});
					}
		}

}

function mergeAndSave(err,dao,entity,json,callback){

	if (entity){
		entity=extend(true, {}, entity, json);
		console.log('merging>>',JSON.stringify(entity));
		dao.update(entity, function(err, data) {
			callback(err);
		});
	}	else {

		console.log('saving', JSON.stringify(json));
		dao.save(json, function(err, data) {
			callback(err);
		});
	}

}

function createJson(defs, lineNr, line) {
	var retVal = {};

	var index = 0;
	defs.collDef.map(function(def) {
		// console.log (def,line[index]);
		applyValue(retVal, def, line[index]);
		index++;
	});

	return retVal;
}

function applyValue(o, d, v) {
	// console.log(o,d,v);
	var path = d.to;
	// if(!v) return;
	if ('null' === path) {
		return;
	}
	var parts = path.split('.');
	var obj = o;
	var prev;
	var lastPart = null;
	parts.map(function(part) {
		
		if (part=='') return;
		if (!obj[part]) {
			obj[part] = {};
		}
		
		prev = obj;
		obj = obj[part];
		lastPart = part;
	});
	if(!prev) return;
	var val = convertValue(d, v);
	if (val){
		prev[lastPart]=val;
	} else {
		prev[lastPart]=null;
	}
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
					tmp = eval(fun + '(null)');
				} else{
					tmp = eval(fun + '(\'' + tmp + '\')');
				}
			} catch (err) {
				console.log('Not able to evaluate ', fun, ' on ', tmp,err);
			}
		}
	});

	return tmp;
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
		case '$copy$':
			if (!def.copy){
					def.copy=[];
			}
			def.copy.push({"from": items[1],"to":items[2]});
		break;
		case '$merge$': 
				def.merge={	searchByMethod: items[1], registry:items[2]};
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

			case '$resolveByPath$':
			if (!def.resolve) {
				def.resolve = [];
			}
			
			def.resolve.push({attribute:items[1],path:items[2]});
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


/**
 * default conversion
 * 
 * @param item
 * @returns
 */
function defConversion(item) {
	if (!item) return null;
	var val= item.trim().replace(/\'/g, '');
	if (val.length){
		return val;
	}
	return null;
}

function objLinkOrganization(item) {
	if (!item) return null;
	var ret=	{
			'registry' : 'organizations',
			'oid' : '',
			'unresolved' : item
	};
	// console.log(ret);
	return ret;
}

function objLinkPeople(item) {
	var ret=	{
			'registry' : 'people',
			'oid' : '',
			'unresolved' : item
	};
	// console.log(ret);
	return ret;
}


function objLinkAgeCategory(item) {
	var ret=	{
			'registry' : 'ageCategories',
			'oid' : '',
			'unresolved' : item
	};
	// console.log(ret);
	return ret;
}

function objLinkSeason(item) {
	var ret=	{
			'registry' : 'seasons',
			'oid' : '',
			'unresolved' : item
	};
	// console.log(ret);
	return ret;
}

function resolveToObjectLink(json,path,callback){

	var parts=path.split('.');
	
	console.log(json,path);

	var obj = json;
	var prev;
	var lastPart = null;
	parts.map(function(part) {
		obj = obj[part];
		lastPart = part;
	});
	if (!obj) return;
	console.log(obj);
	// console.log(json);
	var daoLink = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : obj.registry
	});
	
	daoLink.list(QueryFilter.create().addCriterium('import.id', QueryFilter.operation.EQUAL,''+obj.unresolved), function(err,data){
		if (err) {
			callback(err);
			return;
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
	// console.log(json,path);
	// console.log('resolveByNameToObjectLink',json,path);
	var parts=path.split('.');
	
	var obj = json;
	var prev;
	var lastPart = null;
	
	parts.map(function(part) {
		if (obj && part in obj){
			obj = obj[part];
			lastPart = part;
		}else{
			obj=null;
		}
	});
	if (!obj){
		callback();
		return;
	}
	var daoLink = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : obj.registry
	});




	// console.log('>>>>> ',obj.registry);
	
	daoLink.list(QueryFilter.create().addCriterium('club.name', QueryFilter.operation.EQUAL,''+obj.unresolved.trim()), function(err,data){
		if (err) {
			callback(err);
			return;
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

function resolveByPathToObjectLink(json,path,searchPath,callback){


	console.log(json,path,searchPath);
	// console.log('resolveByNameToObjectLink',json,path);
	var parts=path.split('.');
	
	var obj = json;
	var prev;
	var lastPart = null;
	
	parts.map(function(part) {
		if (obj && part in obj){
			obj = obj[part];
			lastPart = part;
		}else{
			obj=null;
		}
	});
	if (!obj){
		callback();
		return;
	}
	var daoLink = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : obj.registry
	});

	daoLink.list(QueryFilter.create().addCriterium(searchPath, QueryFilter.operation.EQUAL,''+obj.unresolved.trim()), function(err,data){
		if (err) {
			callback(err);
			return;
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
	
	// console.log(json);
	var daoLink = new universalDaoModule.UniversalDao(mongoDriver, {
		collectionName : obj.registry
	});
	// console.log('>>>>> ',obj.registry);
	
	daoLink.list(QueryFilter.create().addCriterium('baseData.id', QueryFilter.operation.EQUAL,''+obj.unresolved.trim()), function(err,data){
		if (err) {
			callback(err);
			return;
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
	if (item==='D') { 
		return 'Dôchodca';
	}
	return null;
}

function mapStavTransferu(item) {
	if (item==='Schválila') { 
		return 'schválený';
	}
	return 'neschválený';
}

function mapKrajina(item) {
	if (item==='Slovensko') { 
		return 'SVK';
	}
	return item;
}

function mapTrueFalse(item){
	if (item.toLowerCase()=='true'){
		return 'A';
	} else {
		return 'N';
	}

}

function mapPoDohodeStudium(item){
	if ('1'==item){
		return 'Po dohode';
	}
	return 'Počas štúdia';

} 

function fullDate(item){
	if (!item)return null;
	if (item.length===4) {
		return '1.1.'+item;
	}
	return item;
}

function fullDateEndYear(item){
	if (!item||null===item)return null;

	if (item.length===4) {
		return '31.12.'+item;
	}
	return item;
}

function mapInvalid(item){
	if (item ==='I') return 'A'; 
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
		return 'aktívna';
	}
	return 'neaktívna';
}



function parseDateMix(item)	{ 
	if (!item) return null;

	if (item.indexOf('/')>-1){
		var parts=item.split('/');
		if (parts[1].length===1) {
			parts[1]='0'+parts[1];
		}
		if (parts[0].length===1) {
			parts[0]='0'+parts[0];
		}
		return parts[1]+'.'+parts[0]+'.'+parts[2];
	}

		if (item.indexOf('-')>-1){
		var parts=item.split('-');
		if (parts[1].length===1) {
			parts[1]='0'+parts[1];
		}
		if (parts[0].length===1) {
			parts[0]='0'+parts[0];
		}
		return parts[2]+'.'+parts[1]+'.'+parts[0];
	}

	var parts=item.split('.');
		if (parts[0].length===1) {
			parts[0]='0'+parts[0];
		}
		if (parts[1].length===1) {
			parts[1]='0'+parts[1];
		}
		
		return parts[0]+'.'+parts[1]+'.'+parts[2];
}

function mapPT(item){
	if ('P'==item){
		return 'prestup';
	}
		return 'hosťovanie';
}

function mapMZ(item){
	if ('M'===item){
		return 'Muž';
	}
		return 'Žena';
}


function Muz(item){
		return 'Muž';
}


function remapPlayerPosition(item){
	var values={
				'1': 'brankář',
				'2': 'obránce',
				'3': 'útočník'
	};
	return values[item];
}

function removeFullstop(item) {
	if (!item) return null;
	var val= item.trim().replace(/\./g,'');
	if (val.length){
		return val;
	}
	return null;
}

function ano (item){
	return 'Áno';
}


function remapExtraliga23(item){
	if (!item ) return null;
	if (Number(item)<0){
		return {membershipType:"Extraliga do 23r.",paymentFrequency:"12xročne",membershipFee:"500" };
	}
	else {
		return {membershipType:"Extraliga nad 23r.",paymentFrequency:"12xročne",membershipFee:"800" };;
	}
}

function remapCompetition (item) { 

}


function reverseDate(item){
	if (!item){
		return null;
	}

	var parts=item.split('.');
	return parts[2]+parts[1]+parts[0];
}

function findByNameBirthDate(json,dao,mergeAndSave,callback){
	// console.log('method called', json,dao,callback);
		var qf=QueryFilter.create();
		qf.addCriterium('baseData.name',QueryFilter.operation.EQUAL,json.baseData.name);
		qf.addCriterium('baseData.bornName',QueryFilter.operation.EQUAL,json.baseData.bornName);
		qf.addCriterium('baseData.birthDate',QueryFilter.operation.EQUAL,json.baseData.birthDate);
		dao.list(qf,function (err,data){if (err) {callback(err);return;} mergeAndSave(err,dao,data[0],json,callback); });

}