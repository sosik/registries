angular.module('registry', [])
.controller('registry.newCtrl', ['$scope', '$location', function($scope, $location) {
	$scope.model = {
		aaa :''
	};

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
			// there is ngModel, define commit and cancel
			if (ngModel) {
				ngModel.$render = function() {
					elm.val(ngModel.$viewValue || '');
				}

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

			var commitBtn = angular.element('<span class="psui-commit-btn"><i></i><span>save</span></span>');
			var cancelBtn = angular.element('<span class="psui-cancel-btn"><i></i><span>cancel</span></span>');
			var editBtn = angular.element('<span class="psui-edit-btn"><i></i><span>edit</span></span>');

			actionsHolder.append(commitBtn);
			actionsHolder.append(cancelBtn);
			actionsHolder.append(editBtn);

			viewElement = angular.element('<div></div>');
			viewElement.addClass('psui-inlineedit-view');
			wrapper.prepend(viewElement);
			viewElement.text(elm.val());

			var changeMode = function(newMode) {
				//TODO validate newMode
				mode = newMode;

				if (mode === 'view') {
					editBtn.removeClass('psui-hidden');
					commitBtn.addClass('psui-hidden');
					cancelBtn.addClass('psui-hidden');
					viewElement.text(elm.val());
					viewElement.removeClass('psui-hidden');
					elm.addClass('psui-hidden');
					if (editBtnHideTimeout) {
						$timeout.cancel(editBtnHideTimeout);
						editBtnHideTimeout = null;
					}
					editBtnHideTimeout = $timeout(function() {
						editBtn.addClass('psui-hidden');
					}, 500);
				} else if (mode === 'edit') {
					editBtn.addClass('psui-hidden');
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

			editBtn.on('click', function(evt) {
				changeMode('edit');
			});

			wrapper.on('dblclick', function(evt) {
				changeMode('edit');
			});

			var editBtnHideTimeout;

			editBtn.on('mouseover', function(evt) {
				editBtn.removeClass('psui-hidden');
				if (editBtnHideTimeout) {
					$timeout.cancel(editBtnHideTimeout);
					editBtnHideTimeout = null;
				}
			});

			wrapper.on('mouseover', function(evt) {
				if (mode === 'view') {
					editBtn.removeClass('psui-hidden');
				if (editBtnHideTimeout) {
					$timeout.cancel(editBtnHideTimeout);
					editBtnHideTimeout = null;
				}
				}
			});
			wrapper.on('mouseleave', function(evt) {
				if (mode === 'view') {
					if (editBtnHideTimeout) {
						$timeout.cancel(editBtnHideTimeout);
						editBtnHideTimeout = null;
					}
					editBtnHideTimeout = $timeout(function() {
						editBtn.addClass('psui-hidden');
					}, 500);
				}
			});

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

			var validationMark = angular.element('<span class="psui-validation-mark"><i></i><span>error</span></span>');
			validationMark.addClass('psui-hidden');

			actionsHolder.append(validationMark);

			errors = angular.element('<div class="psui-errors"><div>');
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
					console.log(nv);
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

