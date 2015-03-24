angular.module('design', ['ps-gui', 'ngRoute'])
.config(function($routeProvider) {
    $routeProvider
        .when('/empty', {
            templateUrl: 'empty.html',
            controller: 'emptyController'
        })
        .when('/new/:schema', {
            templateUrl: 'new.html',
            controller: 'newController'
        })
        .when('/view/:schema/:id', {
            templateUrl: 'view.html',
            controller: 'viewController'
        })
        .when('/list/:schema', {
            templateUrl: 'list.html',
            controller: 'listController'
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
            redirectTo: '/empty'
        });
})
.controller('design-menu', ['$scope', '$location', function($scope, $location) {
	$scope.menuSelected = false;

	$scope.menuToggle = function() {
		if ($scope.menuSelected) {
			angular.element(document.getElementById('main-menu')).addClass('ps-gui-hidden');
			$scope.menuSelected = false;
		} else {
			angular.element(document.getElementById('main-menu')).removeClass('ps-gui-hidden');
			$scope.menuSelected = true;
		}
	}

	$scope.go = function(where) {
		$location.path(where);
	};
}])
.controller('emptyController', [function(){
}])
.controller('newController', ['$scope', '$routeParams', '$http', '$location', function($scope, $routeParams, $http, $location) {
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
	}

	$scope.save = function() {
		$http({url: '/udao/save/'+$scope.schema.table, method: 'PUT',data: $scope.obj})
		.success(function(data, status, headers, config){
			$location.path('/view/' + $routeParams.schema + '/' + data.id);
		});
	}
	//$scope.peopleSchema = {};
	$scope.obj = {};
	$http({url: 'js/' + $routeParams.schema + '.js', responseType: 'text'})
	.success(function(data, status, headers, config){
			$scope.schema = data;
			generateObjectFromSchema($scope.schema, $scope.obj);
	});
}])
.controller('viewController', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
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
	}

	$scope.$on('model_changed', function() {
		$http({url: '/udao/save/'+$scope.schema.table, method: 'PUT',data: $scope.obj})
		.success(function(data, status, headers, config){
		});
	});
	//$scope.peopleSchema = {};
	$scope.obj = {};
	$http({url: 'js/' + $routeParams.schema + '.js', responseType: 'text'})
	.success(function(data, status, headers, config){
			$scope.schema = data;
			generateObjectFromSchema($scope.schema, $scope.obj);

			$http({url: '/udao/get/'+$scope.schema.table+'/'+$routeParams.id})
			.success(function(data, status, headers, config){
				$scope.obj = data;
			});
	});
}])
.controller('listController', ['$scope', '$routeParams', '$http', '$location', function($scope, $routeParams, $http, $location) {
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
	}

	$scope.rowClick = function(id) {
		$location.path('/view/' + $routeParams.schema + '/' + id);
	}

	$scope.getVal = function(exp) {
		return $scope.$eval(exp);
	}
	//$scope.peopleSchema = {};
	$scope.headers = {};
	$http({url: 'js/' + $routeParams.schema + '.js', responseType: 'text'})
	.success(function(data, status, headers, config){
			$scope.schema = data;
			$scope.headers = data.listFields;

			$http({url: '/udao/list/'+$scope.schema.table})
			.success(function(data, status, headers, config){
				$scope.objs = data;
			});
	});
}])
.controller('new-people', ['$scope', '$http', function($scope, $http) {
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
	}

	//$scope.peopleSchema = {};
	$scope.obj = {};
	$http({url: 'js/peopleSchema.js', responseType: 'text'})
	.success(function(data, status, headers, config){
			$scope.peopleSchema = data;
			generateObjectFromSchema($scope.peopleSchema, $scope.obj);
	});
}])
.directive('psSchemaForm', ['$compile', function($compile){
	return {
		restrict: 'E',
		scope: {
			renderMode: '@',
			showButtons: '@',
			formSchema: "=",
			formObject: "=",
			formObjectText: "@formObject",
			saveActionText: '@saveAction',
			saveAction: '=saveAction'

		},
		transclude: true,
		link: function(scope, element, attrs, controller) {
			var generateTableElement = function(title) {
				var tableElm = angular.element('<table class="ps-schema-form-table"></table>');
				var headerElm = angular.element('<tr class="ps-schema-form-header"><td colspan=2>'+title+'</td></tr>');
				return tableElm.append(headerElm);
			}

			var generateTableRows = function(tableElm, schemaPart, modelPath) {
				angular.forEach(schemaPart.properties, function(value, key){
					var rowElm = angular.element('<tr><td>'+value.title+'</td><td><ps-gui-clickedit-text render-mode="'+scope.renderMode+'" show-buttons="'+scope.showButtons+'" ng-model="'+modelPath+'.'+key+'" ng-required="true" save-action="saveAction"></ps-gui-clickedit-text></td><tr>');
					$compile(rowElm)(scope);
					tableElm.append(rowElm);
				});


			}

			var doLink = function() {
				if (!scope || !scope.formSchema) {
					return;
				}
				var properties = scope.formSchema.properties;
				angular.forEach(properties, function(value, key) {
					if (value.type === 'object') {
						var tableElm = generateTableElement(value.title);
						$compile(tableElm)(scope);
						element.append(tableElm);
						
						generateTableRows(tableElm, properties[key], 'formObject.'+key);
					} else {
					}
					//element.append('<div class="ps-table-row"><div class="ps-table-label">Priezvisko:</div><div class="ps-table-value"><ps-gui-clickedit-text show-buttons="false" ng-model="tezt">Stárek</ps-gui-clickedit-text></div></div>');
				});
			}

			scope.$watch(function() {return scope.formSchema}, function() {
				doLink();
			});
		}
	};
}])
.directive('psGuiClickeditText', ['$compile', function($compile){
	return {
		restrict: 'E',
		require: '?ngModel',
		scope: {
			renderMode: '@',
			showButtons: '@',
			saveAction: '&'

		},
		link: function(scope, element, attrs, controller) {
			if(!controller) return;

			var renderMode = scope.renderMode || 'view';
			element.empty();	
			var viewElm = angular.element('<div></div>');
			var editElm = angular.element('<input></input>');
			var editButton = angular.element('<ps-gui-button class="editButton" ps-gui-icon="img/iconmonstr-pencil-9-icon.svg"></ps-gui-button>');
			var okButton = angular.element('<ps-gui-button class="okButton" ps-gui-icon="img/iconmonstr-check-mark-6-icon.svg"></ps-gui-button>');
			var cancelButton = angular.element('<ps-gui-button class="cancelButton" ps-gui-icon="img/iconmonstr-x-mark-5-icon.svg"></ps-gui-button>');

			$compile(editButton)(scope);
			$compile(okButton)(scope);
			$compile(cancelButton)(scope);

			var setRenderMode = function(mode) {
				renderMode = mode;

				if (renderMode === 'view') {
					viewElm.removeClass('ps-gui-hidden');
					editElm.addClass('ps-gui-hidden');
					element.removeClass('edit');
				} else {
					viewElm.addClass('ps-gui-hidden');
					editElm.removeClass('ps-gui-hidden');
					editElm[0].focus();
					element.addClass('edit');
				}
			};
			setRenderMode(renderMode);

			viewElm.on('dblclick', function() {
				setRenderMode('edit');
			});

			element.on('mouseenter', function() {
				element.addClass('hovered');
			});
			element.on('mouseleave', function() {
				element.removeClass('hovered');
			});

			var cancelEdit = function() {
				editElm.val(controller.$modelValue);
				controller.$setViewValue(controller.$modelValue);
				setRenderMode('view');
			};

			var commitEdit = function() {
				controller.$setViewValue(editElm.val());
				viewElm.text(controller.$viewValue || '');
				setRenderMode('view');
				scope.$emit('model_changed');
			};

			editElm.on('keypress keydown', function(evt) {
				if (evt.which === 27) {
					scope.$apply(cancelEdit);
					evt.preventDefault();
				} else if (evt.which === 13) {
					scope.$apply(commitEdit);
					evt.preventDefault();
				} else if (evt.which === 9) {
					scope.$apply(commitEdit);
				}
			});

			editElm.on('blur', function() {
				scope.$apply(cancelEdit);
			});
			element.append(editElm);
			element.append(viewElm);

			if (scope.showButtons === 'true') {
				element.append(editButton);
				element.append(okButton);
				element.append(cancelButton);
			}

			controller.$render = function() {
				editElm.val(controller.$modelValue || '');
				viewElm.text(controller.$modelValue || '');
			};

		}
	}
}])
.controller('teztController', ['$scope', function($scope) {
	$scope.tezt = 'Jozef';
}]);

