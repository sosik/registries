angular.module('generic-search', ['schema-utils'])
//
.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/search/:entity', {
	    templateUrl : 'partials/generic-search.html',
	    controller : 'SearchCtrl'
	});
} ])
//
.factory('generic-search.GenericSearchFactory', [ '$http', 'schema-utils.SchemaUtilFactory', function($http, schemaUtilFactory) {
	var service = {};

	service.getSearch = function(searchSchema, criteria,sortBy,limit) {
		
		return $http({
		    method : 'POST',
		    url : '/search/' + schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri(searchSchema,'search')),
		    data : {
		        criteria : criteria,
		        sortBy: sortBy, 
		        limit: limit
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
					    path : pathPrefix + pr,
					    type : objectDef.properties[pr].type,
					    title : objectDef.properties[pr].title
					});
				}
			}

		}
		

		retval.schema = schema.url;
		retval.attributes = [];
		retval.operators = [ {
		    title : '=',
		    value : 'eq'
		}, {
		    title : '>',
		    value : 'gt'
		}, {
		    title : '<',
		    value : 'lt'
		}, {
		    title : '!=',
		    value : 'neq'
		}, {
		    title : 'starts',
		    value : 'starts'
		}, {
		    title : 'exists',
		    value : 'ex'
		} ];

		collectProperties('', schema, retval.attributes);

		return retval;

	};

	return service;
} ])
//
.controller('SearchCtrl', [ '$scope', '$routeParams','$location', 'generic-search.GenericSearchFactory' ,'schema-utils.SchemaUtilFactory' ,'psui.notificationFactory', function($scope, $routeParams,  $location, genericSearchFactory, schemaUtilFactory ,notificationFactory ) {
	var entityUri = schemaUtilFactory.decodeUri($routeParams.entity);

	$scope.entityUri = entityUri;

	$scope.searchDef = {};

	$scope.searchCrit = [];

	$scope.data = [];
	
	$scope.headers = {};
	$scope.forcedCriterias = [];
	
    $scope.addCrit = function() {
    	$scope.searchCrit.push({});
    };
    
    
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

		$scope.searchDef = genericSearchFactory.parseSearchDef(data);
		$scope.entity = data.title;
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
		})
	
		return retval;

	};

	function convertSearchBy(searchBy){
		if (!searchBy)  {
			return null;
		}
		console.log('makak',{ f:searchBy.header.field, o: searchBy.direction});
		return [{ f:searchBy.header.field, o: searchBy.direction}];
	}
	
	$scope.search = function() {
		var c = convertCriteria($scope.searchCrit);
		// add forced criteria
		for (var idx = 0; idx < $scope.forcedCriterias.length; idx++) {
			c.push($scope.forcedCriterias[idx]);
		}

		genericSearchFactory.getSearch($scope.entityUri, c,convertSearchBy( $scope.sortBy)).success(function(data) {
			$scope.data = data;
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
		console.log($scope.sortBy);
		$scope.search();
	};
	
	$scope.goView = function(i) {
			$location.path('registry/view/' + schemaUtilFactory.encodeUri(entityUri) + '/' + $scope.data[i].id);
	}
} ]);
