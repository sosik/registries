'use strict';
angular.module('generic-search', ['schema-utils','pascalprecht.translate', 'xpsui'])
//
.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/search/:entity', {
		templateUrl : 'partials/generic-search.html',
		controller : 'SearchCtrl'
	});
} ])
//
.factory('generic-search.GenericSearchFactory', [ '$http', 'schema-utils.SchemaUtilFactory', '$translate', function($http, schemaUtilFactory, $translate) {
	var service = {};

	service.getSearch = function(searchSchema, criteria,sortBy,skip,limit) {
		
		return $http({
			method : 'POST',
			url : '/search/' + schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri(searchSchema,'search')),
			data : {
				criteria : criteria,
				sortBy: sortBy, 
				limit: limit,
				skip: skip
			}
		});
	};

	service.parseSearchDef = function(schema) {
		
		var retval = {};

		function collectProperties(pathPrefix, objectDef, resultArr) {
			for ( var pr in objectDef.properties) {

					if (objectDef.properties[pr].$objectLink) {
						resultArr.push({
							path: pathPrefix + pr+'.oid',
							type: objectDef.properties[pr].type,
							render:{objectLink:objectDef.properties[pr].$objectLink},
							schemaFragment:objectDef.properties[pr],
							title: (objectDef.properties[pr].transCode ? $translate.instant(objectDef.properties[pr].transCode) : objectDef.properties[pr].title)
						});

					continue;
				}

				//FIXME: change to datetype 
				if ('render' in objectDef.properties[pr] && objectDef.properties[pr].render.component==='psui-datepicker' ) {
						resultArr.push({
							path: pathPrefix + pr,
							type: objectDef.properties[pr].type,
							render:{datepicker:true},
							schemaFragment:objectDef.properties[pr],
							title: (objectDef.properties[pr].transCode ? $translate.instant(objectDef.properties[pr].transCode) : objectDef.properties[pr].title)
						});

					continue;
				}


				if (objectDef.properties[pr].type === 'object') {
					collectProperties(pr + '.', objectDef.properties[pr], resultArr);
				} else {
					resultArr.push({
						path: pathPrefix + pr,
						type: objectDef.properties[pr].type,
						title: objectDef.properties[pr].transCode ? $translate.instant(objectDef.properties[pr].transCode) : objectDef.properties[pr].title
					});
				}
			}

		}
		

		retval.schema = schema.url;
		retval.attributes = [];
		retval.operators = [ {
			title: '=',
			value: 'eq'
		}, {
			title: '>',
			value: 'gt'
		},
		{
			title: '>=',
			value: 'gte'
		},  {
			title: '<',
			value: 'lt'
		},
		 {
			title: '<=',
			value: 'lte'
		},  {
			title: 'je iné ako',
			value: 'neq'
		}, {
			title: 'začína s',
			value: 'starts'
		},{
			title: 'obsahuje',
			value: 'contains'
		},
		 {
			title: 'má vyplnené',
			value: 'ex'
		} ];

		collectProperties('', schema, retval.attributes);

		return retval;

	};

	return service;
} ])
//
.controller('SearchCtrl', [ '$scope', '$routeParams','$location', 'generic-search.GenericSearchFactory' ,'schema-utils.SchemaUtilFactory' ,'psui.notificationFactory','$translate', 'xpsui:ObjectTools', function($scope, $routeParams,  $location, genericSearchFactory, schemaUtilFactory ,notificationFactory,$translate, objectTools ) {
	var entityUri = schemaUtilFactory.decodeUri($routeParams.entity);

	$scope.entityUri = entityUri;

	$scope.searchDef = {};

	$scope.searchCrit = [];

	$scope.data = [];
	
	$scope.headers = {};
	$scope.forcedCriterias = [];
	
	$scope.lastCriteria={};
	
	
	$scope.addCrit = function() {
		$scope.searchCrit.push({});
	};
	
	var pageSize=20;
	
	var generateObjectFromSchema = function(schema, obj) {
		var _obj = obj;
		angular.forEach(schema.properties, function(value, key){
			if (value.type === 'object') {
				_obj[key] = {};
				generateObjectFromSchema(value, _obj[key]);
			} else {
				_obj[key] = '';
			}
		});
	};


	schemaUtilFactory.getCompiledSchema(entityUri, 'search').success(function(data) {

		$scope.schema=data;
		$scope.searchDef = genericSearchFactory.parseSearchDef(data);
		$scope.entity = data.title;

		$scope.entity = $translate.instant( data.transCode || data.title);
		
		$scope.addCrit(); 
		$scope.headers = data.listFields;
		$scope.sortBy={header: data.listFields[0] , direction : 'asc' };
		$scope.forcedCriterias = data.forcedCriterias || [];
	}).error(function(err) {
		notificationFactory.error(err);
	});

	$scope.selectedCritAttribute=function(crit){
		if (crit.attribute.objectLink){
			crit.object={};
		}
	};


	$scope.removeCrit = function(index) {
		$scope.searchCrit.splice(index, 1);
	};

	var convertCriteria = function(crit) {

		console.log(crit);
		var retval = [];

		crit.map(function(c) {
			if (c && c.attribute && c.attribute.path) {
				if (c.attribute.render && c.attribute.render.objectLink){
					retval.push({
						f : c.attribute.path,
						v : c.obj.oid,
						op : c.operator.value
					});	
				}
				else {
					retval.push({
						f : c.attribute.path,
						v : c.value,
						op : c.operator.value
					});	
				}
				
			}
		});

		return retval;

	};

	function convertSortBy(searchBy){
		if (!searchBy)  {
			return null;
		}
		return [{ f:searchBy.header.field, o: searchBy.direction}];
	}
	
	$scope.search = function() {
		var c = convertCriteria($scope.searchCrit);
		// add forced criteria
		for (var idx = 0; idx < $scope.forcedCriterias.length; idx++) {
			c.push($scope.forcedCriterias[idx]);
		}

		$scope.lastCriteria=JSON.parse(JSON.stringify(c));
		
		genericSearchFactory.getSearch($scope.entityUri, c,convertSortBy( $scope.sortBy),0,pageSize).success(function(data) {
			$scope.data = data;
		}).error(function(err) {
			notificationFactory.error(err);
		});
	};	
	
	
	$scope.searchNext = function() {
		var c = convertCriteria($scope.searchCrit);
		// add forced criteria
		for (var idx = 0; idx < $scope.forcedCriterias.length; idx++) {
			c.push($scope.forcedCriterias[idx]);
		}
		genericSearchFactory.getSearch($scope.entityUri, $scope.lastCriteria,convertSortBy( $scope.sortBy),$scope.data.length,pageSize).success(function(data) {
			
			data.map(function (newItems){
				$scope.data.push(newItems);
			});
			
			
		}).error(function(err) {
			notificationFactory.error(err);
		});
	};	
	
	
		
	function toCsv(schema,data){ 
		var retVal='';
		var separator=';';
		
		for (var li in schema.listFields){
			var lisDef=schema.listFields[li];
			retVal+=lisDef.title;
			retVal+=separator;
		}
		retVal+='\r\n';
		
		for(var item in data){
			for ( li in schema.listFields){
				retVal+=getValue(data[item],schema.listFields[li].field)+separator;
			}
			retVal+='\r\n';
		}

		return new TextEncoder('cp1250', { NONSTANDARD_allowLegacyEncoding: true }).encode(retVal);
	}
	

	$scope.getVal = function getValueXX(fieldPath, obj) {
		if (!obj) {
			return '';
		}

		var schemaFragment = objectTools.getSchemaFragmentByObjectPath($scope.schema, fieldPath);

		if (schemaFragment && schemaFragment.render && schemaFragment.render.component === 'psui-datepicker') {
			return obj.substring(6,8) + '.' + obj.substring(4,6) + '.' + obj.substring(0,4);
		}

		return obj;
	};

	function getValue(obj,fieldPath){
		
		var parts=fieldPath.split('.');
		var iter=obj;
		parts.map(function(part) {
			
			if (part in iter){
				iter = iter[part];
			}
			else {
				iter={};
			}
		});
		
		if (iter.constructor === String){
			if (iter.indexOf(',')>-1){
				iter='"'+iter+'"';
			}
		}
		return iter;
		
	}	
	
	$scope.exportCsv = function() {
		var c = convertCriteria($scope.searchCrit);
		// add forced criteria
		for (var idx = 0; idx < $scope.forcedCriterias.length; idx++) {
			c.push($scope.forcedCriterias[idx]);
		}
		genericSearchFactory.getSearch($scope.entityUri, $scope.lastCriteria,convertSortBy( $scope.sortBy),0,10000).success(function(data) {

			data=toCsv($scope.schema,data);
			
			var blob = new Blob([data], {type: 'text/csv;charset=cp1250'});
			var url  = window.URL || window.webkitURL;
			var link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
			link.href = url.createObjectURL(blob);
			link.download = 'search-export.csv'; // whatever file name you want :)

			var event = document.createEvent('MouseEvents');
			event.initEvent('click', true, false);
			link.dispatchEvent(event); 
			
		}).error(function(err) {
			notificationFactory.error(err);
		});
	};
	
	$scope.setSortBy=function (header){
		if ($scope.sortBy && $scope.sortBy.header===header){
			if ( 'asc'===$scope.sortBy.direction) {
				$scope.sortBy={header: header , direction : 'desc' };
			}
			else {
				$scope.sortBy={header: header , direction : 'asc' };
			} 
		}
		else {
			$scope.sortBy={header: header , direction : 'desc' };
		}
		$scope.search();
	};
	
	$scope.goView = function(i) {
			$location.path('registry/view/' + schemaUtilFactory.encodeUri(entityUri) + '/' + $scope.data[i].id);
	};
} ]);
