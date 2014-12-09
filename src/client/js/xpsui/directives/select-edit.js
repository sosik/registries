(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiSelectEdit', ['xpsui:logging','$parse', 'xpsui:DropdownFactory', 'xpsui:SelectboxFactory','xpsui:SelectDataFactory', function(log, $parse, dropdownFactory, selectboxFactory, datafactory) {
		return {
			restrict: 'A',
			require: ['ngModel', '?^xpsuiFormControl', 'xpsuiSelectEdit'],
			controller: function($scope, $element, $attrs) {
				this.setup = function(){
					this.$input = angular.element('<input></input>');
				}
				
				this.getInput = function(){
					return this.$input;
				}

				this.$input = null;
				this.setup();
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('String edit Link');

				var ngModel = ctrls[0];
				var formControl = ctrls[1] || {};
				var selfControl = ctrls[2];
				var input = selfControl.getInput();
				var schemaFragment = elm.data('schemaFragment');

				elm.addClass('x-control');
				elm.addClass('x-select-edit');

				ngModel.$render = function() {
					input.val(ngModel.$viewValue || '');
					formControl.oldValue = ngModel.$modelValue;
				};

				elm.append(input);

				input.on('change', function(evt) {
					scope.$apply(function() {
						ngModel.$setViewValue(input.val());
					});
				});

				elm.bind('focus', function(evt) {
					input[0].focus();
				});

				// dropdown
				var dropdown = dropdownFactory.create(elm);
				dropdown.setInput(selfControl.getInput())
					.render()
				;

				// selectbox
				var selectbox = selectboxFactory.create(elm, {
					onSelected: function(value){
						input.val(value.v);
						console.log('onSelected');
						console.log(arguments);
					}
				});
				selectbox.setInput(selfControl.getInput());
				selectbox.setDropdown(dropdown);

				// store
				var dataset = datafactory.createArrayDataset(
					schemaFragment.enum, 
					schemaFragment.enumTransCodes
				);
				selectbox.setDataset(dataset);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));