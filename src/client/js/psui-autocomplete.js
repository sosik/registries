'use strict';

angular.module('psui-autocomplete', [])
/**
 * Default for psui-autocomplete directive
 */
.factory('psuiAutocompleteDefaultsFactory', [function(){
	return {
		/**
		 * @function
		 * Function used as default autocomplete value handler.
		 * Simply extracts data with similar prefix
		 */
		defaultOnChange: function(text, data) {
			var result = [];
			var re = new RegExp('^' + text, 'i');
			for (var i = 0; i < data.length; i++) {
				if (re.test(data[i])) {
					result.push(data[i]);
				}
			}

			return result;
		},
		/**
		 * @function
		 * Default function to render value.
		 * It simply creates div with whole data
		 */
		defaultRender: function(text, data) {
			return '<div>'+data+'</div>'
		},
		/**
		 * @function
		 * Default function to parse data.
		 * It simply returns original data.
		 */
		defaultParseValue: function(data) {
			return data;
		}
	}
}])
.directive('psuiOptions', [function () {
	return {
		restrict: 'A',
		controller: function($scope, $element, $attrs, $transclude) {
			var optionsArg = $attrs.psuiOptions;
			this.getPsuiOptions = function() {
				return $scope[optionsArg];
			};
		}
	};
}])
.directive('psuiAutocomplete', ['psuiAutocompleteDefaultsFactory', "$parse", function (psuiAutocompleteDefaultsFactory, $parse) {
	var DEFUALT_OPTIONS = {
		onChange: psuiAutocompleteDefaultsFactory.defaultOnChange,
		render: psuiAutocompleteDefaultsFactory.defaultRender,
		parseValue: psuiAutocompleteDefaultsFactory.defaultParseValue,
		data: []
	}
	return {
		restrict: 'AE',
		scope: {
			psuiOptions: "=?",
			psuiAutocompleteData: "=?",
			psuiAutocompleteOnChange: "=?",
			psuiAutocompleteRender: "=?",
			psuiAutocompleteParseValue: "=?",
			ngModel: "=?"
		},
		require: ['?psuiOptions', '?ngModel'],
		link: function(scope, elm, attrs, ctrls) {
			var wrapper;
			var isDropdownVisible = false;

			// create base html elements
			if (elm.parent().hasClass('psui-wrapper')) {
				// element is wrapped, we are going to use this wrapper
				wrapper = elm.parent;
			} else {
				// there is no wrapper, we have to create one
				wrapper = angular.element('<div class="psui-wrapper"></div>');
				elm.wrap(wrapper);
			}

			if (elm.nodeName === "psui-autocomplete") {
				// we are element
			} else {
				// we are attribute
			}

			var dropdown = angular.element('<div class="psui-dropdown psui-hidden"></div>');
			wrapper.append(dropdown);

			// handle ng-model
			var updateViewValue = function(val) {
				elm.val(val);
			}

			var commitDropdownSellection = function(val) {
			}

			if (ctrls[1]) {
				var ngModelCtrl = ctrls[1];
				//ng-model controller is there
				
				// redefine function to handle ng-model
				commitDropdownSellection = function(val) {
					//TODO set caret position to the end of input
					scope.$apply(
						ngModelCtrl.$setViewValue(elm.val())
					);
				}

				ngModelCtrl.$render = function() {
					elm.val(ngModelCtrl.viewValue() || '')
				}
			}
			if (typeof(scope.psuiOptions) === 'undefined') {
				// options are intentionally disconnected from parent scope
				scope.psuiOptions = DEFUALT_OPTIONS;
			} else {
				scope.psuiOptions.onChange = scope.psuiOptions.onChange || DEFUALT_OPTIONS.onChange;
				scope.psuiOptions.render = scope.psuiOptions.render || DEFUALT_OPTIONS.render;
				scope.psuiOptions.parseValue = scope.psuiOptions.parseValue || DEFUALT_OPTIONS.parseValue;
				scope.psuiOptions.data = scope.psuiOptions.data || DEFUALT_OPTIONS.data;
			}

			$parse('data').assign(scope, scope.psuiAutocompleteData || scope.psuiOptions.data);
			$parse('onChange').assign(scope, scope.psuiAutocompleteOnChange || scope.psuiOptions.onChange);
			$parse('render').assign(scope, scope.psuiAutocompleteRender || scope.psuiOptions.render);
			$parse('parseValue').assign(scope, scope.psuiAutocompleteParseValue || scope.psuiOptions.parseValue);

			scope.dropdownData = [];
			scope.$watch('data', function(newVal, oldVal) {
				//TODO do dynamic data change handling
			}, true);

			var showDropdown = function() {
				dropdown.removeClass('psui-hidden');
				isDropdownVisible = true;
			};

			var hideDropdown = function() {
				dropdown.addClass('psui-hidden');
				isDropdownVisible = false;
			};

			var blurFunc = function(evt) {
				hideDropdown();
			};

			var enableBlur = function() {
				elm.on('blur', blurFunc);
			};

			var disableBlur = function() {
				elm.off('blur', blurFunc);
			};

			var unselectAllInDropdown = function() {
				dropdown.children().removeClass('psui-selected');
			}
			// actual keyboard selected index
			var keyboardSelected = -1;
			// keypress event is used only for special keys
			elm.on('keypress', function(evt) {
				var children = dropdown.children();
				switch (evt.keyCode) {
					case 13:// enter
						elm[0].selectionStart = elm[0].selectionEnd = -1;
						updateViewValue(scope.parseValue(scope.dropdownData[keyboardSelected]));
						commitDropdownSellection();
						keyboardSelected = -1;
						hideDropdown();
						break;
					case 38: // arrow up
						if (keyboardSelected > -1) {
							if (keyboardSelected > 0) {
								keyboardSelected--;
							}
						} else {
							if (children.length > 0) {
								keyboardSelected = 0;
							}
						}
						break;
					case 40: // arrow down
						if (!isDropdownVisible) {
							// there is no dropdown visible yet
							drawDropdown();
						}
						if (keyboardSelected > -1) {
							if (children.length > (keyboardSelected + 1)) {
								keyboardSelected++;
							}
						} else {
							if (children.length > 0) {
								keyboardSelected = 0;
							}
						}
						break;
				}

				if (keyboardSelected > -1) {
					unselectAllInDropdown();
					angular.element(children[keyboardSelected]).addClass('psui-selected');
					updateViewValue(scope.parseValue(scope.dropdownData[keyboardSelected]));
					elm[0].select();

					// calculate scroll
					var heightToCurrent = 0;
					for (var i = 0; i < keyboardSelected; i++) {
						heightToCurrent += children[keyboardSelected].offsetHeight;
					}

					if (heightToCurrent < dropdown[0].scrollTop) {
						dropdown[0].scrollTop = heightToCurrent;
					} else if (heightToCurrent + children[keyboardSelected].offsetHeight > dropdown[0].scrollTop + dropdown[0].offsetHeight) {
						dropdown[0].scrollTop += children[keyboardSelected].offsetHeight;
					}

				}
			});

			var drawDropdown = function() {
				scope.dropdownData = scope.onChange(elm.val(), scope.data);
				keyboardSelected = -1;
				dropdown.empty();
				dropdown.scrollTop = 0;
				
				if (scope.dropdownData.length < 1) {
					hideDropdown();
					return;
				}

				for (var i = 0; i< scope.dropdownData.length; i++) {
					var rendered = angular.element(scope.render(elm.val(), scope.dropdownData[i]));
					rendered.data("dataIndex", i);
					rendered.on('click', function(evt) {
						updateViewValue(scope.parseValue(scope.dropdownData[angular.element(evt.target).data("dataIndex")]));
						commitDropdownSellection();
						hideDropdown();
						elm[0].focus();
					});
					rendered.on('mouseenter', function(evt) {
						unselectAllInDropdown();
						keyboardSelected = -1;
						angular.element(evt.target).addClass('psui-selected');;
					});
					rendered.on('mouseleave', function(evt) {
						angular.element(evt.target).removeClass('psui-selected');;
					});
					dropdown.append(rendered);
					
				}
				showDropdown();
			};

			elm.on('keyup', function(evt) {
				if ([13,38,40].indexOf(evt.keyCode) > -1) {
					return;
				}
				// any other key
				drawDropdown();
			});

			dropdown.on('mouseenter', disableBlur);
			dropdown.on('mouseleave', enableBlur);
			enableBlur();
		}
	}
}]);
