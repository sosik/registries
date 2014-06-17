angular.module('generic-search', [])

.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/search/:entity', {
	    templateUrl : 'partials/searchPage.html',
	    controller : 'SearchCtrl'
	});
} ])

.factory('GenericSearchService', [ '$http', '$rootScope', function($http, $rootScope) {
	var service = {};

	service.getSearchDef = function(entity) {

		return $http({
		    method : 'POST',
		    url : '/search/def',
		    data : {
			    entity : entity
		    }
		});
	};

	service.getCompiledSchema = function(schemaUri) {

		return $http({
		    method : 'GET',
		    url : '/schema/compiled/' + encodeURIComponent(schemaUri)
		});

	};

	service.getSearch = function(searchSchema, criteria) {

		return $http({
		    method : 'POST',
		    url : '/search',
		    data : {
		        searchSchema : searchSchema,
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
		;

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
} ]).controller('SearchCtrl', [ '$scope', '$routeParams', 'GenericSearchService', '$location', function($scope, $routeParams, searchService, $location) {

	var entityUri = decodeURIComponent($routeParams.entity);

	$scope.entityUri = entityUri;

	$scope.searchDef = {};

	$scope.alert = null;
	$scope.searchCrit = [];

	$scope.data = [];

	searchService.getCompiledSchema(entityUri).success(function(data) {

		$scope.searchDef = searchService.parseSearchDef(data);
		$scope.entity = data.title;
	}).error(function(err) {
		$scope.alert = err;
	});

	$scope.addCrit = function() {
		$scope.alert = null;

		if (!$scope.critTempAtt) {
			$scope.alert = "Attribute must be specified";
			return;
		}

		if (!$scope.critTempOper) {
			$scope.alert = "Operator must be specified";
			return;
		}

		if (!$scope.critTempVal) {
			$scope.alert = "Value must be specified";
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

	$scope.removeCrit = function(index) {
		$scope.searchCrit.splice(index, 1);
	};

	$scope.editCrit = function(index) {
		$scope.critTempAtt = $scope.searchCrit[index].attribute;
		$scope.critTempOper = $scope.searchCrit[index].oper;
		$scope.critTempVal = $scope.searchCrit[index].value;
	};

	function convertCriteria(crit) {

		var retval = [];
		for ( var c in crit) {
			retval.push({
			    f : c.attribute.path,
			    v : c.value,
			    op : c.oper.value
			});
		}
		return retval;

	}

	var convertCriteria = function(crit) {

		var retval = [];

		crit.map(function(c) {
			retval.push({
			    f : c.attribute.path,
			    v : c.value,
			    op : c.oper.value
			});
		})

		return retval;

	};

	$scope.search = function() {
		$scope.alert = null;
		searchService.getSearch($scope.entityUri, convertCriteria($scope.searchCrit)).success(function(data) {
			$scope.data = data;
		}).error(function(err) {
			$scope.alert = err;
		});
	};

	$scope.goView = function(i) {
		if ($scope.entity === 'company') {
			$location.path('registry/view/companySchema/' + $scope.data[i].id);
		} else {
			$location.path('registry/view/peopleSchema/' + $scope.data[i].id);
		}
	}
} ]);
