'use strict';
var extend = require('extend');
var fs = require('fs'), readline = require('readline');
var async = require('async');
var path = require('path');
var util = require('util');
var stream = require('stream');
var hash = require('object-hash');

var log = require('./logging.js').getLogger('CsvImportService.js');
var objectTools = require('./../../build/server/ObjectTools.js');

var universalDaoModule = require('./../../build/server/UniversalDao.js');

var DataSet = function() {
        this.lines = [];
        var that = this;
    this.collectLine = function(line) {
        that.lines.push(line);
    };
};

var CsvImportService=function(cfg,mongoDriver,defs){

    var importDefs=defs;
    var mongoDriver=mongoDriver;
    var self=this;
    this.udc=null;

    this.setUdc=function(udc){
        this.udc=udc;
    };

    this.import=function (type,id,file,callback){


        log.info('importing file',file,type,id);
        log.silly(importDefs);
        var ctx={importId:id};

        if (type in importDefs){
            var filepath = path.join(cfg.paths.uploads, file);
            parseLines(mongoDriver,self.udc,importDefs[type],filepath,ctx,callback);
        }
        else {
            setTimeout(function(){
             callback('Unsupported type '+ type);
            },0);
        }

    };
};


function parseLines(mongoDriver,udc,importDef,path,ctx,callback){

    var rd = readline.createInterface({
        input : fs.createReadStream(path),
        output : process.stdout,
        terminal : false
    });


    var dataSet2=new DataSet();
    rd.on('line', dataSet2.collectLine);
    rd.on('close', function(){processDataset(mongoDriver,udc,importDef,dataSet2,ctx,callback);});
}


function processDataset(mongoDriver,udc,importDefinition,dataset,ctx,callback){

    var dao=null;
    var dataLines=dataset.lines.slice(1);

        if (importDefinition.save) {
                dao = new universalDaoModule.UniversalDao(mongoDriver, {
                    collectionName : importDefinition.save
                });
        }
        if (importDefinition.saveBySchema){

        }

    var lineNr=1;

    var lineProcessors =dataLines.map(function(line){
        return function(callback){processLine(dao,udc,importDefinition,line,lineNr++,ctx,callback); };
    });

    async.parallel(lineProcessors,callback);
}

function checkIfMatch(json,crits){
    var matching=true;

    crits.map(function(crit){
        for (var field in crit){
            var value=objectTools.evalPath(json,field);
            if (value!=crit[field]){
                matching=false;
            }
        }
    });

    return matching;

}

function store(dao,udc,def,entity,update,callback){


    if (def.saveBySchema){

        var req={currentUser:{id:-1},params:{schema:def.saveBySchema},body:entity};
            var res=function (){

            this.send=function (code ,data){
                callback();
            };

            this.json=function(data){
                callback();
            };

        };
        req.perm={"Registry - write":true};
        util.inherits(res, require('stream').Writable);
        res= new res();
        log.error("calling", req);
        udc.saveBySchema(req,res);
    }
    else {
        dao.save(entity, function(err, data) {
            log.verbose('line saved',JSON.stringify(entity));
            callback(err, data);
        });
    }


}

function setStaticValues(ctx,set,json){
    set.map(function(item){
        for (var field in item){
            if (item[field] && item[field].indexOf('$')===0){
                objectTools.setValue(json,field,objectTools.evalPath(ctx,item[field].substring(1)));
            }else {
                objectTools.setValue(json,field,item[field]);
            }
        }
    });
}

function setCheckSum(chkDef,json){
    var chksObj={};


    chkDef.includes.map(function (item){
        objectTools.setValue(chksObj,item,objectTools.evalPath(json,item));
    });

    objectTools.setValue(json,chkDef.to,hash.sha1(JSON.stringify(chksObj)));
}

function processLine(dao,udc,def,line,lineNr,ctx,callback){

    var parts=splitLine(def,line);

    var json = createJson(def, lineNr, parts);



        if (def.set){
            setStaticValues(ctx,def.set,json);
        }


        if (def.checkSum){
            setCheckSum(def.checkSum,json);
        }

        if (def.filter && def.filter.match){
            if (!checkIfMatch(json, def.filter.match)){
                return;
            }
        }

        if (def.resolve) {

                var resovleFs=[];
                def.resolve.map(function(toResolve){
                    resovleFs.push(function(callback2){
                        if (toResolve.byBirthNumber){
                            resolveByBirthNumberToObjectLink(json,toResolve.attribute,callback2);
                        } else if (toResolve.byName){
                            resolveByNameToObjectLink(json,toResolve.attribute,callback2);
                        } else  if (toResolve.path){
                            resolveByPathToObjectLink(json,toResolve.attribute,toResolve.path,callback2);
                        } else {
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
                            log.error('Not able to evaluate ', def.merge.searchByMethod);
                        }
                    }else {

                        store(dao,udc,def,json,false,function(err, data) {
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
                            log.error('Not able to evaluate ', def.merge.searchByMethod,err);
                        }
                    }else {
                        store(dao,udc,def,json,false,function(err, data) {
                            log.error('line saved',lineNr,line,JSON.stringify(json));
                            callback();
                        });
                    }
        }

}

function unEscapeString(def,value){
    if (def.stringEscapeCharacter){
        return unEscape(def.stringEscapeCharacter,value);
    }
    else {
        return unEscape('\'',value);
    }
}

function unEscape(char,value){
    if (value){
        if (value.indexOf(char)===0){
            if (value.lastIndexOf(char)==value.length-1){
                return value.substring(1,value.length-1);
            }
            else {
                throw 'Not escaped properly '+ value;
            }
        }
    }
    return value;
}

function createJson(defs, lineNr, line) {
    var retVal = {};

    var index = 0;
    defs.collDef.map(function(def) {
        // console.log (def,line[index]);
        applyValue(retVal, def,unEscapeString(defs, line[index]));
        index++;
    });

    return retVal;
}
function splitLine(def,line){
    return csv2array(line,def.separator||';')[0];
}

function toNumber(item){
    if (item){
        return parseFloat(item);
    }
}
function reverseDate(item){
    if (!item){
        return null;
    }

    var parts=item.split('.');
    return parts[2]+parts[1]+parts[0];
}

/**
 * Convert data in CSV (comma separated value) format to a javascript array.
 *
 * Values are separated by a comma, or by a custom one character delimeter.
 * Rows are separated by a new-line character.
 *
 * Leading and trailing spaces and tabs are ignored.
 * Values may optionally be enclosed by double quotes.
 * Values containing a special character (comma's, double-quotes, or new-lines)
 *   must be enclosed by double-quotes.
 * Embedded double-quotes must be represented by a pair of consecutive
 * double-quotes.
 *
 * Example usage:
 *   var csv = '"x", "y", "z"\n12.3, 2.3, 8.7\n4.5, 1.2, -5.6\n';
 *   var array = csv2array(csv);
 *
 * Author: Jos de Jong, 2010
 *
 * @param {string} data      The data in CSV format.
 * @param {string} delimeter [optional] a custom delimeter. Comma ',' by default
 *                           The Delimeter must be a single character.
 * @return {Array} array     A two dimensional array containing the data
 * @throw {String} error     The method throws an error when there is an
 *                           error in the provided data.
 */
function csv2array(data, delimeter) {
  // Retrieve the delimeter
  if (!delimeter)
    delimeter = ',';
  if (delimeter && delimeter.length > 1)
    delimeter = ',';

  // initialize variables
  var newline = '\n';
  var stringEsc='\'';
  var eof = '';
  var i = 0;
  var c = data.charAt(i);
  var row = 0;
  var col = 0;
  var array = new Array();

  while (c != eof) {
    // skip whitespaces
    while (c == ' ' || c == '\t' || c == '\r') {
      c = data.charAt(++i); // read next char
    }

    // get value
    var value = "";
    if (c == stringEsc) {
      // value enclosed by double-quotes
      c = data.charAt(++i);

      do {
        if (c != stringEsc) {
          // read a regular character and go to the next character
          value += c;
          c = data.charAt(++i);
        }

        if (c == stringEsc) {
          // check for escaped double-quote
          var cnext = data.charAt(i+1);
          if (cnext == stringEsc) {
            // this is an escaped double-quote.
            // Add a double-quote to the value, and move two characters ahead.
            value += stringEsc;
            i += 2;
            c = data.charAt(i);
          }
        }
      }
      while (c != eof && c != stringEsc);

      if (c == eof) {
        throw "Unexpected end of data, double-quote expected";
      }

      c = data.charAt(++i);
    }
    else {
      // value without quotes
      while (c != eof && c != delimeter && c!= newline && c != ' ' && c != '\t' && c != '\r') {
        value += c;
        c = data.charAt(++i);
      }
    }

    // add the value to the array
    if (array.length <= row)
      array.push(new Array());
    array[row].push(value);

    // skip whitespaces
    while (c == ' ' || c == '\t' || c == '\r') {
      c = data.charAt(++i);
    }

    // go to the next row or column
    if (c == delimeter) {
      // to the next column
      col++;
    }
    else if (c == newline) {
      // to the next row
      col = 0;
      row++;
    }
    else if (c != eof) {
      // unexpected character
      throw "Delimiter expected after character " + i;
    }

    // go to the next character
    c = data.charAt(++i);
  }

  return array;
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

        if (part==='') return;
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
    if (d.convert){
        d.convert.map(function(fun) {
            if (typeof (fun) == 'function') {
                tmp = fun(tmp);
            } else {
                try {
                    if (tmp===null){
                        tmp = eval(fun + '(null)');
                    } else{
                        tmp = eval(fun + '(\'' + tmp + '\')');
                    }
                } catch (err) {
                    log.error('Not able to evaluate ', fun, ' on ', tmp,err.stack);
                }
            }
        });
    }

    return tmp;
}



module.exports = {
    CsvImportService : CsvImportService
};
