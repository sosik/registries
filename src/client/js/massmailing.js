angular.module('massmailing', ['schema-utils','pascalprecht.translate','schema-utils'])
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

	

	return service;
} ])
//
.controller('massmailing.editCtrl', [ '$scope', '$routeParams', 'schema-utils.SchemaUtilFactory',function($scope, $routeParams,SchemaUtilFactory) {
	
	var schemaUri='uri://registries/mailtemplates#master/view';
	
	$scope.selectedTemplate={};

	SchemaUtilFactory.listBySchema(schemaUri).success(function(data){
		$scope.templates=data;
	});
	
	$scope.changed=function(){
		console.log($scope.selectedTemplate);
	};
	
} ]);
