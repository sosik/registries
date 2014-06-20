angular.module('registry', ['schema-utils'])
.controller('registry.newCtrl', ['$scope', '$routeParams', '$http', '$location','schema-utils.SchemaUtilFactory','psui.notificationFactory', function($scope, $routeParams, $http, $location,schemaUtilFactory,notificationFactory) {
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

	$scope.currentSchemaUri = schemaUtilFactory.decodeUri($routeParams.schema);

	$scope.model = {};
	$scope.model.obj = {};
	
	$scope.schemaFormOptions = {
		modelPath: 'model.obj',
		schema: {}
	};

	$scope.save = function() {
		$http({url: '/udao/save/'+$scope.schemaFormOptions.schema.table, method: 'PUT',data: $scope.model.obj})
		.success(function(data, status, headers, config){
			$location.path('/registry/view/' + schemaUtilFactory.encodeUri($scope.currentSchemaUri) + '/' + data.id);
		});
	};

	schemaUtilFactory.getCompiledSchema($scope.currentSchemaUri, 'new').success(function(data) {
		$scope.schemaFormOptions.schema = data;
		generateObjectFromSchema($scope.schemaFormOptions.schema, $scope.model.obj);
	}).error(function(err) {
		notificationFactory.error(err);
	});
}])
.controller('registry.viewCtrl', ['$scope', '$routeParams', '$http', '$location','schema-utils.SchemaUtilFactory','psui.notificationFactory', function($scope, $routeParams, $http, $location,schemaUtilFactory,notificationFactory) {
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

	$scope.currentSchema = $routeParams.schema;
	$scope.currentId = $routeParams.id;

	$scope.model = {};
	$scope.model.obj = {};
	
	$scope.schemaFormOptions = {
		modelPath: 'model.obj',
		schema: {}
	};

	$scope.save = function() {
		$http({url: '/udao/save/'+$scope.schemaFormOptions.schema.table, method: 'PUT',data: $scope.model.obj})
		.success(function(data, status, headers, config){
			$location.path('/registry/view/' + schemaUtilFactory.encodeUri($cope.currentSchema) + '/' + $scope.model.obj.id);
		});
	}

	var schemaUri = decodeURIComponent( $routeParams.schema);

	schemaUtilFactory.getCompiledSchema(schemaUri, 'view')
	.success(function(data) {
		$scope.schemaFormOptions.schema = data;
		
		$http({ method : 'GET',url: '/udao/get/'+$scope.schemaFormOptions.schema.table+'/'+ $scope.currentId})
		.success(function(data, status, headers, config){
			generateObjectFromSchema($scope.schemaFormOptions.schema, $scope.model.obj);
			$scope.model.obj = data;
		}).error(function(err) {
			notificationFactory.error(err);
		});
		
	})
		notificationFactory.error(err);
	});
}])
/**
 * places validation mark to element
 */
.directive('psuiInlineedit', ['$timeout', function($timeout) {
	return {
		restrict: 'A',
		require: ['^ngModel'],
		link: function(scope, elm, attrs, controller) {
			var mode = attrs.psuiInlineedit;
			var wrapper;
			var oldValue = '';

			var commit = function() {
			}

			var cancel = function() {
			}

			var ngModel = null;
			if (controller[0]) {
				ngModel = controller[0];
			}
			var viewElement = angular.element('<div></div>');
			viewElement.addClass('psui-inlineedit-view');
			// there is ngModel, define commit and cancel
			if (ngModel) {
				ngModel.$render = function() {
					elm.val(ngModel.$viewValue || '');
					viewElement.text(ngModel.$viewValue || '');
				}

				scope.$watch(function(scope) {return ngModel.$viewValue;}, function() {
					viewElement.text(ngModel.$viewValue || '');
				})

				commit = function() {
					scope.$apply( function() {
						ngModel.$setViewValue(elm.val());
					});
					changeMode('view');
				}

				cancel = function() {
					scope.$apply(function() {
						elm.val(oldValue);
						ngModel.$setViewValue(elm.val());
					});
					changeMode('view');
				}
			}
			elm.addClass('psui-inlineedit-edit');
			// create base html elements
			if (elm.parent().hasClass('psui-wrapper')) {
				// element is wrapped, we are going to use this wrapper
				wrapper = angular.element(elm.parent());
			} else {
				// there is no wrapper, we have to create one
				wrapper = angular.element('<span class="psui-wrapper"></span>');
				elm.wrap(wrapper);
			}

			// check it there is psui-buttons-holder
			var wrapperChildren = wrapper.children();
			var actionsHolder = null;
			for (var i = 0; i<wrapperChildren.length; i++) {
				if (angular.element(wrapperChildren[i]).hasClass('psui-actions-holder')) {
					actionsHolder = angular.element(wrapperChildren[i]);
				}
			}

			if (!actionsHolder) {
				console.log('No button holder');
				actionsHolder = angular.element('<span class="psui-actions-holder"></span>');
				wrapper.append(actionsHolder);
			}

			var commitBtn = angular.element('<span class="psui-btn psui-commit-btn"><i></i><span>save</span></span>');
			var cancelBtn = angular.element('<span class="psui-btn psui-cancel-btn"><i></i><span>cancel</span></span>');
//			var editBtn = angular.element('<span class="psui-edit-btn"><i></i><span>edit</span></span>');

			actionsHolder.append(commitBtn);
			actionsHolder.append(cancelBtn);
//			actionsHolder.append(editBtn);

			wrapper.prepend(viewElement);
			//viewElement.text(elm.val());

			var changeMode = function(newMode) {
				//TODO validate newMode
				mode = newMode;

				if (mode === 'view') {
//					editBtn.removeClass('psui-hidden');
					commitBtn.addClass('psui-hidden');
					cancelBtn.addClass('psui-hidden');
					viewElement.text(elm.val());
					viewElement.removeClass('psui-hidden');
					elm.addClass('psui-hidden');
//					if (editBtnHideTimeout) {
//						$timeout.cancel(editBtnHideTimeout);
//						editBtnHideTimeout = null;
//					}
//					editBtnHideTimeout = $timeout(function() {
//						editBtn.addClass('psui-hidden');
//					}, 500);
				} else if (mode === 'edit') {
//					editBtn.addClass('psui-hidden');
					commitBtn.removeClass('psui-hidden');
					cancelBtn.removeClass('psui-hidden');
					viewElement.addClass('psui-hidden');
					elm.removeClass('psui-hidden');
					oldValue = elm.val();
				}
			}

			commitBtn.on('click', function(evt) {
				commit();
				changeMode('view');
			});

			cancelBtn.on('click', function(evt) {
				cancel();
				changeMode('view');
			});

//			editBtn.on('click', function(evt) {
//				changeMode('edit');
//			});

			viewElement.on('click', function(evt) {
				changeMode('edit');
			});

//			var editBtnHideTimeout;
//
//			editBtn.on('mouseover', function(evt) {
//				editBtn.removeClass('psui-hidden');
//				if (editBtnHideTimeout) {
//					$timeout.cancel(editBtnHideTimeout);
//					editBtnHideTimeout = null;
//				}
//			});

//			wrapper.on('mouseover', function(evt) {
//				if (mode === 'view') {
//					editBtn.removeClass('psui-hidden');
//				if (editBtnHideTimeout) {
//					$timeout.cancel(editBtnHideTimeout);
//					editBtnHideTimeout = null;
//				}
//				}
//			});
//			wrapper.on('mouseleave', function(evt) {
//				if (mode === 'view') {
//					if (editBtnHideTimeout) {
//						$timeout.cancel(editBtnHideTimeout);
//						editBtnHideTimeout = null;
//					}
//					editBtnHideTimeout = $timeout(function() {
//						editBtn.addClass('psui-hidden');
//					}, 500);
//				}
//			});

			elm.on('keypress keydown', function(evt) {
				if (evt.which === 27) {
					cancel();
					evt.preventDefault();
				} else if (evt.which === 13) {
					commit();
					evt.preventDefault();
				} else if (evt.which === 9) {
					commit();
				}
			});


			changeMode(mode);
		}
	}
}])
.directive('psuiValidityMark', [function() {
	return {
		restrict: 'A',
		require: ['^ngModel'],
		link: function(scope, elm, attrs, controller) {
			var wrapper;

			var ngModel = null;
			if (controller[0]) {
				ngModel = controller[0];
			}

			// create base html elements
			if (elm.parent().hasClass('psui-wrapper')) {
				// element is wrapped, we are going to use this wrapper
				wrapper = elm.parent;
			} else {
				// there is no wrapper, we have to create one
				wrapper = angular.element('<span class="psui-wrapper"></span>');
				elm.wrap(wrapper);
			}

			// check it there is psui-buttons-holder
			var wrapperChildren = wrapper.children();
			var actionsHolder = null;
			for (var i = 0; i<wrapperChildren.length; i++) {
				if (angular.element(wrapperChildren[i]).hasClass('psui-actions-holder')) {
					actionsHolder = wrapperChildren[i];
				}
			}

			if (!actionsHolder) {
				console.log('No button holder');
				actionsHolder = angular.element('<span class="psui-actions-holder"></span>');
				wrapper.append(actionsHolder);
			}

			var validationMark = angular.element('<span class="psui-btn psui-validation-mark"><i></i><span>error</span></span>');
			validationMark.addClass('psui-hidden');

			actionsHolder.append(validationMark);

			var errors = angular.element('<div class="psui-errors"><div>');
			errors.addClass('psui-hidden');
			validationMark.append(errors);
			validationMark.on('mouseover', function(evt) {
				errors.removeClass('psui-hidden');
			});
			validationMark.on('mouseleave', function(evt) {
				errors.addClass('psui-hidden');
			});

			if (ngModel) {
				scope.$watch(function(scope) {return ngModel.$invalid;}, function(nv, ov) {
					if (nv) {
						validationMark.addClass('ng-invalid');
						validationMark.removeClass('psui-hidden');
					} else {
						validationMark.removeClass('ng-invalid');
						validationMark.addClass('psui-hidden');
					}
				});

				scope.$watch(function(scope) {return ngModel.$pristine;}, function(nv, ov) {
					if (nv) {
						validationMark.addClass('ng-pristine');
					} else {
						validationMark.removeClass('ng-pristine');
					}
				});

				scope.$watchCollection(function(scope) {return ngModel.$error;}, function(nv, ov) {
					errors.empty();
					for (e in nv) {
						if (nv[e]) {
							errors.append('<div class="psui-error">'+e+'</div>');
						}
					}
				});
			}
		}
	}
}])
.directive('psuiSchemaForm', ['$compile', function($compile) {
	return {
		restrict: 'A',
		transclude: true,
		link: function(scope, element, attrs, controller) {
			var options = scope[attrs.psuiSchemaForm];

			var render = function() {
				var properties = options.schema.properties;
				console.log(properties);
				angular.forEach(properties, function(value, key) {
					if (value.type === 'object') {
						var fieldSet = angular.element('<fieldset></fieldset');
						element.append(fieldSet);
						fieldSet.wrap('<div class="col-md-6"></div>');
						fieldSet.append('<label>'+value.title+'</label>');
						angular.forEach(value.properties, function(value2, key2) {
							if (value2.render && value2.render.component === 'psui-datepicker') {
								fieldSet.append('<div class="form-group"><label class="col-sm-4 control-label">'+value2.title+'</label>'
								+'<div class="col-sm-8"><div class="input-group">'
								+'<input psui-validity-mark psui-datepicker required type="text" class="form-control" placeholder="" ng-model="'+options.modelPath+'.'+key+'.'+key2+'"/></div></div></div>');
							} else if (value2.render && value2.render.component === 'psui-uploadable-image') {
								fieldSet.append('<div class="form-group"><label class="col-sm-4 control-label">'+value2.title+'</label>'
								+'<div class="col-sm-8"><div class="input-group">'
								+'<psui-uploadable-image psui-imageresizor psui-imageresizor-width="' +value2.render.width
								+ '" psui-imageresizor-height="'+value2.render.height
								+'" ng-model="'+options.modelPath+'.'+key+'.'+key2+'" style="'+(value2.render.width ? 'width:'+value2.render.width+'px !important;':'')+(value2.render.height ? 'height:'+value2.render.height+'px !important;':'')+'"/></psui-uploadable-image></div></div>');
							} else {
								fieldSet.append('<div class="form-group"><label class="col-sm-4 control-label">'+value2.title+'</label>'
								+'<div class="col-sm-8"><div class="input-group">'
								+'<input psui-validity-mark required type="text" class="form-control" placeholder="" ng-model="'+options.modelPath+'.'+key+'.'+key2+'"/></div></div></div>');
							}
						});

						//var tableElm = generateTableElement(value.title);
						$compile(fieldSet)(scope);
						
						//generateTableRows(tableElm, properties[key], 'formObject.'+key);
					} else {
					}
					//element.append('<div class="ps-table-row"><div class="ps-table-label">Priezvisko:</div><div class="ps-table-value"><ps-gui-clickedit-text show-buttons="false" ng-model="tezt">Stárek</ps-gui-clickedit-text></div></div>');
				});
			};

			scope.$watchCollection(function() {return options}, function() {
				console.log('options changed');
				render();
			});
		}
	}
}])
.directive('psuiSchemaForm2', ['$compile', function($compile) {
	return {
		restrict: 'A',
		transclude: true,
		link: function(scope, element, attrs, controller) {
			var options = scope[attrs.psuiSchemaForm2];

			var render = function() {
				var properties = options.schema.properties;
				console.log(properties);
				angular.forEach(properties, function(value, key) {
					if (value.type === 'object') {
						var fieldSet = angular.element('<fieldset></fieldset');
						element.append(fieldSet);
						fieldSet.wrap('<div class="col-md-6"></div>');
						fieldSet.append('<label>'+value.title+'</label>');
						angular.forEach(value.properties, function(value2, key2) {
							if (value2.render && value2.render.component === 'psui-datepicker') {
								fieldSet.append('<div class="form-group"><label class="col-sm-4 control-label">'+value2.title+'</label>'
								+'<div class="col-sm-8"><div class="input-group">'
								+'<input psui-validity-mark psui-datepicker psui-inlineedit="view" required type="text" class="form-control" placeholder="" ng-model="'+options.modelPath+'.'+key+'.'+key2+'"/></div></div></div>');
							} else if (value2.render && value2.render.component === 'psui-uploadable-image') {
								fieldSet.append('<div class="form-group"><label class="col-sm-4 control-label">'+value2.title+'</label>'
								+'<div class="col-sm-8"><div class="input-group">'
								+'<psui-uploadable-image ng-model="'+options.modelPath+'.'+key+'.'+key2+'" style="'+(value2.render.width ? 'width:'+value2.render.width+'px !important;':'')+(value2.render.height ? 'height:'+value2.render.height+'px !important;':'')+'"/></psui-uploadable-image></div></div>');
							} else {
								fieldSet.append('<div class="form-group"><label class="col-sm-4 control-label">'+value2.title+'</label>'
								+'<div class="col-sm-8"><div class="input-group">'
								+'<input psui-validity-mark psui-inlineedit="view" required type="text" class="form-control" placeholder="" ng-model="'+options.modelPath+'.'+key+'.'+key2+'"/></div></div></div>');
							}
						});

						//var tableElm = generateTableElement(value.title);
						$compile(fieldSet)(scope);
						
						//generateTableRows(tableElm, properties[key], 'formObject.'+key);
					} else {
					}
					//element.append('<div class="ps-table-row"><div class="ps-table-label">Priezvisko:</div><div class="ps-table-value"><ps-gui-clickedit-text show-buttons="false" ng-model="tezt">Stárek</ps-gui-clickedit-text></div></div>');
				});
			};

			scope.$watchCollection(function() {return options}, function() {
				console.log('options changed');
				render();
			});
		}
	}
}])
.directive('psSchemaForm', ['$compile', function($compile){
	return {
		restrict: 'E',
		scope: {
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
}]);

