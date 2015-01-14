'use strict';
angular.module('psui-selectbox', ['psui', 'pascalprecht.translate'])
.directive('psuiSelectboxView', ['$parse', '$translate', function($parse, $translate) {
	return {
		restrict: 'A',
		require: ['^ngModel'],
		link: function(scope, elm, attrs, ctrls) {
			var schemaFragment = null;
			var data = [];

			if (attrs.schemaFragment) {
				schemaFragment = $parse(attrs.schemaFragment)(scope);

				if (!schemaFragment.enum) {
					throw "Schema fragment does not contain enum field";
				}

				if (schemaFragment.enumTransCodes) {
					// there are transCodes
					for (var i = 0; i < schemaFragment.enum.length; i++) {
						data.push({
							v: $translate.instant(schemaFragment.enumTransCodes[i]),
							k: schemaFragment.enum[i]
						});
					}
				} else {
					if (schemaFragment.translationPrefix){
						for (var i = 0; i < schemaFragment.enum.length; i++) {
							data.push({
								v: $translate.instant(schemaFragment.translationPrefix+'.'+schemaFragment.enumTransCodes[i]),
								k: schemaFragment.enum[i]
							});
						}
					} else {
						for (var i = 0; i < schemaFragment.enum.length; i++) {
							data.push({
								v: schemaFragment.enum[i],
								k: schemaFragment.enum[i]
							});
						}

					}
				}
			}

			var ngModel = ctrls[0];

			ngModel.$render = function() {
				if (ngModel.$viewValue) {
					var val = ngModel.$viewValue;
					for (var i  = 0; i < data.length; i++) {
						if (data[i].k === val) {
							elm.text(data[i].v);
							return;
						}
					}

					console.error('Key not found in data');
					elm.text('');
				} else {
					elm.text('');
				}
			};
		}
	};
}])
.directive('psuiSelectbox', ['psui.dropdownFactory', '$parse', '$translate', function (dropdownFactory, $parse, $translate) {
	return {
		restrict: 'E',
		require: ['?ngModel', '^?psuiFormCtrl'],
		link: function(scope, elm, attrs, ctrls) {
			var data = [];
			var wrapper;
			var isDropdownVisible = false;

			elm[0].readOnly = true;
			elm.addClass('psui-selectbox');

			// create base html elements
			if (elm.parent().hasClass('psui-wrapper')) {
				// element is wrapped, we are going to use this wrapper
				wrapper = elm.parent();
			} else {
				// there is no wrapper, we have to create one
				wrapper = angular.element('<div class="psui-wrapper"></div>');
				elm.wrap(wrapper);
			}

			// handle ng-model
			var updateViewValue = function(val) {
				for (var i  = 0; i < data.length; i++) {
					if (data[i].k === val) {
						elm.text(data[i].v);
						return;
					}
				}

				console.log('Key not found in data');
				elm.text('');
			}

			var commitChange = function(index) {
				elm.text(dropdown.data[index].v);
			};

			if (ctrls[0]) {
				var ngModelCtrl = ctrls[0];
				//ng-model controller is there

				var commitChange = function(index) {
					var val = data[index];
					elm.text(val.v + ' - ' + val.k);
					scope.$apply(function() {
						ngModelCtrl.$setViewValue(val.k);
					});
					elm[0].focus();
				};

				ngModelCtrl.$render = function() {
					updateViewValue(ngModelCtrl.$viewValue || '');
				}
			}

			// Get data from schema fragment
			var schemaFragment = null;

			if (attrs.schemaFragment) {
				schemaFragment = $parse(attrs.schemaFragment)(scope);

				if (!schemaFragment.enum) {
					throw "Schema fragment does not contain enum field";
				}

				if (schemaFragment.enumTransCodes) {
					// there are transCodes
					for (var i = 0; i < schemaFragment.enum.length; i++) {
						data.push({
							v: $translate.instant(schemaFragment.enumTransCodes[i]),
							k: schemaFragment.enum[i]
						})
					}
				} else {
					for (var i = 0; i < schemaFragment.enum.length; i++) {
						data.push({
							v: schemaFragment.enum[i],
							k: schemaFragment.enum[i]
						})
					}
				}
			}

			if (!attrs.tabindex) {
				attrs.$set('tabindex', 0);
			}

			if (elm.nodeName === "psui-selectbox") {
				// we are element
			} else {
				// we are attribute
			}

			var dropdown = new dropdownFactory.createDropdown({searchable: true});
			//dropdown.setData(data);

			// override dropdown select functionality
			dropdown.onSelected = function(index) {
				commitChange(index);
				this.hide();
			};
			wrapper.append(dropdown.getDropdownElement());

			var buttonsHolder = angular.element('<div class="psui-buttons-holder"></div>');
			wrapper.append(buttonsHolder);
			var buttonShowDropdown = angular.element('<button type="button" class="btn psui-icon-chevron-down"></button>');
			buttonShowDropdown.attr('tabindex', '-1');
			buttonsHolder.append(buttonShowDropdown);
			buttonShowDropdown.on('click', function(evt) {
				if (dropdown.isVisible()) {
					dropdown.hide();
				} else {
					dropdown.show();
					dropdown.setData(data);
				}
			});

			elm.on('keydown', function(evt) {
				switch (evt.keyCode) {
					case 40: // key down
						if (!dropdown.isVisible()) {
							dropdown.show();
							dropdown.setData(data);
						}
						evt.preventDefault();
						break;
					case 38: // key up
						evt.preventDefault();
						break;
					case 13: // key enter
						if (!dropdown.isVisible()) {
							dropdown.show();
							dropdown.setData(data);
						}
						evt.preventDefault();
						break;
				}
				// any other key
			});

			buttonShowDropdown.on('keydown', function(evt) {
				switch (evt.keyCode) {
					case 40: // key down
						if (!dropdown.isVisible()) {
							dropdown.show();
							dropdown.setData(data);
						}
						evt.preventDefault();
						break;
					case 38: // key up
						evt.preventDefault();
						break;
					case 13: // key enter
						if (!dropdown.isVisible()) {
							dropdown.show();
							dropdown.setData(data);
						}
						evt.preventDefault();
						break;
				}
				// any other key
			});

			buttonShowDropdown.on('focus', function(evt){
				dropdown.cancelTimeout();
			})

			// if there is psui-form-ctrl bind active component change and close dropdown
			var psuiFormCtrl;
			if (ctrls[1]) {
				var psuiFormCtrl = ctrls[1];

				scope.$watch(
					psuiFormCtrl.getActiveControl,
					function(newVal, oldVal) {
						if (newVal !== elm && oldVal === elm) {
							dropdown.hide();
						}
					}
				);
			}
		}
	}
}])
