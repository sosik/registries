angular.module('registry', ['ngRoute', 'registy_schema', 'metawidget'])
.value("registryData", {})
.config(function($routeProvider) {
    $routeProvider
        .when('/list', {
            templateUrl: 'templates/list.html',
            controller: 'listController'
        })
        .when('/detail/:oid', {
            templateUrl: 'templates/detail.html',
            controller: 'detailController'
        })
        .when('/edit/:oid', {
            templateUrl: 'templates/edit.html',
            controller: 'editController'
        })
        .when('/new', {
            templateUrl: 'templates/edit.html',
            controller: 'newController'
        })
        .otherwise({
            redirectTo: '/list'
        });
})
.controller('listController', ['$scope', '$location', 'registryData', function($scope,$location, registryData) {
    $scope.list = [];
    angular.forEach(registryData, function(value, key){
        this.push(value);
    }, $scope.list);
}])
.controller('detailController', ['$routeParams', '$scope', '$location', 'schema', 'registryData', function($routeParams, $scope, $location, schema, registryData) {
//    var _tableLayout = new metawidget.layout.HeadingTagLayoutDecorator({
    var _tableLayout = new metawidget.jqueryui.layout.TabLayoutDecorator({
		delegate: new metawidget.layout.TableLayout({ numberOfColumns: 2 })
	});
		
		
// 	$scope.contacts = [{name:'xxx', value:'xxxz'}, {name:'yyy', value:'tttte'}];
	$scope.contacts = registryData[$routeParams.oid];
	$scope.readOnly = true;
	$scope.metawidgetConf = {
		layout: _tableLayout,
		inspector: new metawidget.inspector.CompositeInspector( [ function( toInspect, type, names ) {
			return schema;
		}])
	};
}])
.controller('editController', ['$routeParams', '$scope', '$location', 'schema', 'registryData', function($routeParams, $scope, $location, schema, registryData) {
//    var _tableLayout = new metawidget.layout.HeadingTagLayoutDecorator({
    var _tableLayout = new metawidget.jqueryui.layout.TabLayoutDecorator({
		delegate: new metawidget.layout.TableLayout({ numberOfColumns: 2 })
	});
		
		
// 	$scope.contacts = [{name:'xxx', value:'xxxz'}, {name:'yyy', value:'tttte'}];
	$scope.contacts = registryData[$routeParams.oid];
	$scope.readOnly = true;
	$scope.metawidgetConf = {
		layout: _tableLayout,
		inspector: new metawidget.inspector.CompositeInspector( [ function( toInspect, type, names ) {
			return schema;
		}])
	};
	
	$scope.save = function() {
	    registryData[$scope.contacts.oid] = $scope.contacts;
	    $location.path('/list');
	}
	
	$scope.cancel = function() {
	    $location.path('/list');
	}
}])
.controller('newController', ['$scope', '$location', 'schema', 'registryData', function($scope, $location, schema, registryData) {
//    var _tableLayout = new metawidget.layout.HeadingTagLayoutDecorator({
    var _tableLayout = new metawidget.jqueryui.layout.TabLayoutDecorator({
		delegate: new metawidget.layout.TableLayout({ numberOfColumns: 2 })
	});
		
		
// 	$scope.contacts = [{name:'xxx', value:'xxxz'}, {name:'yyy', value:'tttte'}];
	$scope.contacts = {};
	$scope.readOnly = true;
	$scope.metawidgetConf = {
		layout: _tableLayout,
		inspector: new metawidget.inspector.CompositeInspector( [ function( toInspect, type, names ) {
			return schema;
		}])
	};
	
	$scope.save = function() {
	    registryData[$scope.contacts.oid] = $scope.contacts;
	    $location.path('/list');
	}
	
	$scope.cancel = function() {
	    $location.path('/list');
	}
}])