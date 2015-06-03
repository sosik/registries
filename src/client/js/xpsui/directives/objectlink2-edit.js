(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiObjectlink2Edit', [
		'xpsui:logging',
		'$parse', 
		'xpsui:DropdownFactory', 
		'xpsui:Objectlink2Factory',
		'xpsui:SelectDataFactory', 
		'xpsui:SchemaUtil',
		'xpsui:RemoveButtonFactory',
	function(log, $parse, dropdownFactory, objectlink2Factory, dataFactory, schemaUtil, removeButtonFactory) {
		return {
			restrict: 'A',
			require: ['ngModel', '?^xpsuiFormControl', 'xpsuiObjectlink2Edit'],
			controller: function($scope, $element, $attrs) {
				this.setup = function(){
					this.$input = angular.element('<div tabindex="0"></div>');
					this.$input.addClass('x-input');
				};
				
				this.getInput = function(){
					return this.$input;
				};

				this.$input = null;
				this.setup();
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('ObjectLink2 edit Link');

				var ngModel = ctrls[0],
					formControl = ctrls[1] || {},
					selfControl = ctrls[2],
					input = selfControl.getInput(),
					parseSchemaFragment = $parse(attrs.xpsuiSchema),
					schemaFragment = parseSchemaFragment(scope)
				;

				var removeButton = removeButtonFactory.create(elm,{
					enabled: !!!schemaFragment.required,
					input: input,
					onClear: function(){
						input.empty();
						scope.$apply(function() {
							ngModel.$modelValue = {};
						});
					}
				});

				elm.addClass('x-control');
				elm.addClass('x-select-edit x-objectlink2-edit');

				ngModel.$render = function() {
					if(!angular.equals({},ngModel.$viewValue)) {
						// get data from schema or model and render it
						render(dataFactory.getObjectLinkData(
							schemaFragment.objectLink2, ngModel.$modelValue
						));
					} else {
						input.empty();
					}
				};

				function render(data) {
					input.empty();

					if (data) {
						removeButton.show();
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

				elm.append(input);


				elm.bind('focus', function(evt) {
					input[0].focus();
				});

				// dropdown
				var dropdown = dropdownFactory.create(elm, {
					titleTransCode: schemaFragment.transCode
				});
				
				dropdown.setInput(selfControl.getInput())
					.render()
				;

				// selectobx
				var selectbox = objectlink2Factory.create(elm, {
					onSelected: function(value){
						
						scope.$apply(function() {
							ngModel.$setViewValue(
								value
							);
						});

						render(value);
						console.log('onSelected');
						console.log(arguments);
					}
				});
				selectbox.setInput(selfControl.getInput());
				selectbox.setDropdown(dropdown);

				// store
				var dataset = dataFactory.createObjectDataset(schemaFragment);
				selectbox.setDataset(dataset);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));

