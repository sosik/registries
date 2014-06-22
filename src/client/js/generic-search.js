angular.module('generic-search', ['schema-utils'])
//
.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/search/:entity', {
	    templateUrl : 'partials/searchPage.html',
	    controller : 'SearchCtrl'
	});
} ])
//
.factory('generic-search.GenericSearchFactory', [ '$http', 'schema-utils.SchemaUtilFactory', function($http, schemaUtilFactory) {
	var service = {};

	service.getSearch = function(searchSchema, criteria) {
		console.log(searchSchema, schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri(searchSchema,'search')), schemaUtilFactory.concatUri(searchSchema,'search'));
		return $http({
		    method : 'POST',
		    url : '/search/' + schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri(searchSchema,'search')),
		    data : {
		        criteria : criteria
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
	
    $scope.addCrit = function() {
    	$scope.searchCrit.push({});
    };

	schemaUtilFactory.getCompiledSchema(entityUri, 'search').success(function(data) {

		$scope.searchDef = genericSearchFactory.parseSearchDef(data);
		$scope.entity = data.title;
		$scope.addCrit(); 
	}).error(function(err) {
		notificationFactory.error(err);
	});
/*
	$scope.addCrit = function() {

		if (!$scope.critTempAtt) {
			notificationFactory.error("Attribute must be specified");
			return;
		}

		if (!$scope.critTempOper) {
			notificationFactory.error("Operator must be specified");
			return;
		}

		if (!$scope.critTempVal) {
			notificationFactory.error("Value must be specified");
			return;
		}

		$scope.searchCrit.push({
		    attribute : $scope.critTempAtt,
		    oper : $scope.critTempOper,
		    value : $scope.critTempVal
		});
		$scope.critTempAtt = null;
		$scope.critTempOper = null;
		$scope.critTempVal = null;
	};
*/
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

	$scope.search = function() {
		genericSearchFactory.getSearch($scope.entityUri, convertCriteria($scope.searchCrit)).success(function(data) {
			$scope.data = data;
		}).error(function(err) {
			notificationFactory.error(err);
		});
	};

	$scope.goView = function(i) {
			$location.path('registry/view/'+encodeURIComponent( $routeParams.entity)+'/' + $scope.data[i].id);
	}
} ]);
