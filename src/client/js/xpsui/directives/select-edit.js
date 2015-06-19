(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
		.directive('xpsuiSelectEdit', [
			'xpsui:logging',
			'$parse', 
			'xpsui:DropdownFactory',
			'xpsui:SelectboxFactory',
			'xpsui:SelectDataFactory',
			'$timeout',
			'xpsui:RemoveButtonFactory',
		function(log, $parse, dropdownFactory, selectboxFactory, datafactory, $timeout, removeButtonFactory) {
		return {
			restrict: 'A',
			require: ['ngModel', '?^xpsuiFormControl', 'xpsuiSelectEdit'],
			controller: function($scope, $element, $attrs) {
				this.setup = function(){
					this.$input = angular.element('<input></input>');
					//this.$input = angular.element('<div tabindex="0"></div>');
					this.$input.addClass('x-input');
				}
				
				this.getInput = function(){
					return this.$input;
				}

				this.$input = null;
				this.setup();
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('Select edit Link');

				var ngModel = ctrls[0];
				var formControl = ctrls[1] || {};
				var selfControl = ctrls[2];
				var input = selfControl.getInput();
				//scope.$eval(attrs.xpsuiSchema)
				var parseSchemaFragment = $parse(attrs.xpsuiSchema);
				var schemaFragment = parseSchemaFragment(scope);

				elm.addClass('x-control');
				elm.addClass('x-select-edit');

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
				var dropdown = dropdownFactory.create(elm,{
					titleTransCode: schemaFragment.transCode
				});
				
				dropdown.setInput(selfControl.getInput())
					.render();
				
				var removeButton = removeButtonFactory.create(elm,{
					enabled: !!!schemaFragment.required,
					input: input,
					onClear: function(){
						input.val('');
						scope.$apply(function() {
							ngModel.$setViewValue('');
						});
					}
				});

				// selectbox
				var selectbox = selectboxFactory.create(elm, {
					// useSearchInput: false,
					// freeTextMode: true,
					onSelected: function(value){
						input.val(value.v);
						scope.$apply(function() {
							ngModel.$setViewValue(
								value.k ? value.k : value.v
							);
							removeButton.show();
						});
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

				ngModel.$render = function() {
					input.val(dataset.store.getValueByKey(ngModel.$viewValue) || ngModel.$viewValue || '');
					formControl.oldValue = ngModel.$modelValue;
					
				};
				
				function render(data) {
					input.empty();

					if (data) {
						// get fields schema fragments
						schemaUtil.getFieldsSchemaFragment(
							schemaFragment.objectLink2.schema, 
							schemaFragment.objectLink2.fields, 
							function(fields) {
								objectlink2Factory.renderElement(
									input,
									fields,
									data
								);
							}
						);
					}
				}

				// input.on('keypress',function(){
				// 	$timeout(function(){
				// 		dropdown.open();
				// 		selectbox.actionFilter(input.val());
				// 	}, 300);
				// });

				log.groupEnd();
			}
		};
	}]);

}(window.angular));