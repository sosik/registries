angular.module('generic-search', ['schema-utils','pascalprecht.translate'])
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
		
		var collectPropertyPaths = function(schemaFragment, path, properties) {

			for ( var prop in schemaFragment) {
				switch (prop) {
				case '$schema':
				case 'id':
				case 'type':
				case '$ref':
					// skip schema keywords;
					break;
				default:
					var propLocalPath = null;
					var propUrl = null;

					if (schema.def[prop].id) {
						// id is defined, lets override canonical resolution
						propUrl = URL.resolve(uri, schema.def[prop].id);
						// make id argument absolute
						schema.def[prop].id = propUrl;
						propLocalPath = URL.parse(propUrl).hash;
						propLocalPath = (propLocalPath && propLocalPath.length > 0 ? propLocalPath : "#");
					} else {
						propLocalPath = localPath + (localPath === "#" ? '' : '/') + prop;
						propUrl = URL.resolve(uri, propLocalPath);
					}

					if ('object' === typeof schema.def[prop]) {
						// dive only if it is object
						that.registerSchema(propUrl, schema.def[prop], true);
						parseInternal(propUrl, that.getSchema(propUrl), propLocalPath);
					}
				}
			}
		};

		var retval = {};

		function collectProperties(pathPrefix, objectDef, resultArr) {
			for ( var pr in objectDef.properties) {
				if (objectDef.properties[pr].$objectLink) {
					// do not allow search by object link for now
					continue;
				}
				if (objectDef.properties[pr].type === 'object') {
					collectProperties(pr + '.', objectDef.properties[pr], resultArr)
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
		}, {
			title: '<',
			value: 'lt'
		}, {
			title: '!=',
			value: 'neq'
		}, {
			title: 'starts',
			value: 'starts'
		}, {
			title: 'exists',
			value: 'ex'
		} ];

		collectProperties('', schema, retval.attributes);

		return retval;

	};

	return service;
} ])
//
.controller('SearchCtrl', [ '$scope', '$routeParams','$location', 'generic-search.GenericSearchFactory' ,'schema-utils.SchemaUtilFactory' ,'psui.notificationFactory','$translate','$filter', function($scope, $routeParams,  $location, genericSearchFactory, schemaUtilFactory ,notificationFactory,$translate,$filter ) {
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
	
	
	var generateTableHeaders = function(schema, obj) {
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

		$scope.entity = $translate.instant( data.transCode);
		
		$scope.addCrit(); 
		$scope.headers = data.listFields;
		$scope.sortBy={header: data.listFields[0] , direction : "asc" };
		$scope.forcedCriterias = data.forcedCriterias || [];
		
	}).error(function(err) {
		notificationFactory.error(err);
	});

	$scope.removeCrit = function(index) {
		$scope.searchCrit.splice(index, 1);
	};

	var convertCriteria = function(crit) {

		var retval = [];

		crit.map(function(c) {
			if (c && c.attribute && c.attribute.path) {
				
				retval.push({
					f : c.attribute.path,
					v : c.value,
					op : c.operator.value
				});
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
		var retVal="";
		
		for (var li in schema.listFields){
			var lisDef=schema.listFields[li];
			retVal+=lisDef.title;
			retVal+=',';
		}
		retVal+="\r\n";
		
		for(var item in data){
			var row=[]
			for (var li in schema.listFields){
				var lisDef=schema.listFields[li];
				retVal+=getValue(data[item],schema.listFields[li]['field'])+",";
			}
			retVal+="\r\n";
		}
		
		return retVal;
	}
	
	
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
			console.log('isString');
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
			
			var blob = new Blob([data], {type: 'text/csv;charset=utf-8'});
			var url  = window.URL || window.webkitURL;
			var link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
			link.href = url.createObjectURL(blob);
			link.download = 'search-export.csv'; // whatever file name you want :)

			var event = document.createEvent("MouseEvents");
			event.initEvent("click", true, false);
			link.dispatchEvent(event); 
			
		}).error(function(err) {
			notificationFactory.error(err);
		});
	};
	
	$scope.setSortBy=function (header){
		if ($scope.sortBy && $scope.sortBy.header===header){
			if ( 'asc'===$scope.sortBy.direction) {
				$scope.sortBy={header: header , direction : "desc" };
			}
			else {
				$scope.sortBy={header: header , direction : "asc" };
			} 
		}
		else {
			$scope.sortBy={header: header , direction : "desc" };
		}
		$scope.search();
	};
	
	$scope.goView = function(i) {
			$location.path('registry/view/' + schemaUtilFactory.encodeUri(entityUri) + '/' + $scope.data[i].id);
	};
} ]);
