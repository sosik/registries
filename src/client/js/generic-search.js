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
			    entity:entity
		    }
		});
	}

	service.getSearch = function(searchSchema, criteria) {

		return $http({
		    method : 'POST',
		    url : '/search',
		    data : {
		        searchSchema : searchSchema ,
		        criteria : criteria
		    }
		});
	}

	return service;
} ])
.controller('SearchCtrl', [ '$scope', '$routeParams', 'GenericSearchService', '$location', function($scope, $routeParams, searchService, $location) {

	var entity = $routeParams.entity;

	$scope.entity=entity;
	$scope.searchDef = {};

	$scope.alert = null;
	$scope.searchCrit = [];

	$scope.data = [];
	searchService.getSearchDef(entity).success(function(data) {

		$scope.searchDef = data;
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
	


	$scope.search = function() {
		searchService.getSearch($scope.searchDef.schema, $scope.searchCrit).success(function(data) {
			$scope.data = data;
		});
	};

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
		searchService.getSearch($scope.searchDef.schema, convertCriteria($scope.searchCrit)).success(function(data) {
			$scope.data = data;
		}).error(function(err) {
			$scope.alert = err;
		});
	};

	$scope.goView = function(i) {
		if ($scope.entity === 'company') {
			$location.path('registry/view/companySchema/'+$scope.data[i].id);
		} else {
			$location.path('registry/view/peopleSchema/'+$scope.data[i].id);
		}
	}
} ]);
