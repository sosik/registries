'use strict';

angular.module('psui-selectbox', ['psui'])
.directive('psuiSelectbox', ['psui.dropdownFactory', function (dropdownFactory) {
	return {
		restrict: 'EA',
		scope: {
			psuiOptions: "=?",
			ngModel: "=?"
		},
		require: ['?psuiOptions', '?ngModel'],
		link: function(scope, elm, attrs, ctrls) {
			var data = ['ano', 'nie', 'Fero', 'Jozo', 'Jano', 'Gregor', 'Slniecko', 'Mesiacik', 'Domcek', 'Stromcek'];
			var wrapper;
			var isDropdownVisible = false;

			elm[0].readOnly = true;
			elm.addClass('psui-selectbox');

			// create base html elements
			if (elm.parent().hasClass('psui-wrapper')) {
				// element is wrapped, we are going to use this wrapper
				wrapper = elm.parent;
			} else {
				// there is no wrapper, we have to create one
				wrapper = angular.element('<div class="psui-wrapper"></div>');
				elm.wrap(wrapper);
			}

			if (!attrs.tabindex) {
				attrs.$set('tabindex', 0);
			}

			if (elm.nodeName === "psui-selectbox") {
				// we are element
			} else {
				// we are attribute
			}

			var dropdown = new dropdownFactory.PsuiDropdown(wrapper);
			dropdown.setData(data);

			var buttonsHolder = angular.element('<div class="psui-buttons-holder"></div>');
			wrapper.append(buttonsHolder);
			var buttonShowDropdown = angular.element('<button><b>v</b></button>');
			buttonShowDropdown.attr('tabindex', '-1');
			buttonsHolder.append(buttonShowDropdown);
			buttonShowDropdown.on('click', function(evt) {
				if (dropdown.isVisible()) {
					dropdown.hide();
				} else {
					dropdown.show();
				}
			});

			// handle ng-model
			var updateViewValue = function(val) {
				elm.val(val);
			}

			var commitChange = function(val) {
			};

			if (ctrls[1]) {
				var ngModelCtrl = ctrls[1];
				//ng-model controller is there
				
				var commitChange = function(index) {
					var val = data[index];
					scope.$apply(function() {
						ngModelCtrl.$setViewValue(val);
					});
				};

				ngModelCtrl.$render = function() {
					elm.val(ngModelCtrl.$viewValue || '');
				}
			}

			elm.on('keypress', function(evt) {
				switch (evt.key) {
					case 'Down': // key down
						if (dropdown.isVisible()) {
							dropdown.change(+1, true);
						}
						dropdown.show();
						evt.preventDefault();
						break;
					case 'Up': // key down
						if (dropdown.isVisible()) {
							dropdown.change(-1, true);
						}
						dropdown.show();
						evt.preventDefault();
						break;
					case 'Enter': // key enter
						if (dropdown.selected() > -1) {
							commitChange(dropdown.selected());
							dropdown.hide();
							elm.text(data[dropdown.selected()]);
							evt.preventDefault();
						}
						break;
				}
				// any other key
			});

			dropdown.on('psui:changed', function(evt) {
				elm[0].focus();
			});

			dropdown.on('psui:confirmed', function(evt) {
				elm.text(data[evt.index]);
				commitChange(dropdown.selected());
				dropdown.hide();
			});
		}
	}
}])
