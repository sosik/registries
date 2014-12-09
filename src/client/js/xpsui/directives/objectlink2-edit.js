(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiObjectlink2Edit', ['xpsui:logging','$parse', 'xpsui:DropdownFactory', 'xpsui:Objectlink2Factory','xpsui:SelectDataFactory',
	function(log, $parse, dropdownFactory, objectlink2Factory, dataFactory) {
		return {
			restrict: 'A',
			require: ['ngModel', '?^xpsuiFormControl', 'xpsuiObjectlink2Edit'],
			controller: function($scope, $element, $attrs) {
				this.setup = function(){
					this.$input = angular.element('<div tabindex="0"></div>');
					this.$input.addClass('x-input');
				}
				
				this.getInput = function(){
					return this.$input;
				}

				this.$input = null;
				this.setup();
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('String edit Link');

				var ngModel = ctrls[0],
					formControl = ctrls[1] || {},
					selfControl = ctrls[2],
					input = selfControl.getInput(),
					schemaFragment = elm.data('schemaFragment')
				;

				elm.addClass('x-control');
				elm.addClass('x-select-edit x-objectlink2-edit');

				ngModel.$render = function() {
					input.empty();

					if (ngModel.$viewValue) {
						render(ngModel.$viewValue);

						// if (ngModel.$viewValue.refdata) {
						// 	for (var i in ngModel.$viewValue.refdata) {
						// 		var fieldSchemaFragment = dataFactory.getFieldSchemaFragment(
						// 				schemaFragment.objectlink2.schema, schemaFragment.objectlink2.fields[i], scope
						// 			),
						// 			type = fieldSchemaFragment.type,
						// 			label = fieldSchemaFragment.title,
						// 			value = ngModel.$viewValue.refdata[i]
						// 		;

						// 		input.append(
						// 			angular.element('<span title="' + label + '">' 
						// 				+ objectlink2Factory.getFormatedValue(type,value) 
						// 				+ '</span>'
						// 			)
						// 		);
						// 	}
						// }
					}
				};

				function render(data){
					input.empty();

					for (var i in data.refdata) {
						var fieldSchemaFragment = dataFactory.getFieldSchemaFragment(
								schemaFragment.objectlink2.schema, schemaFragment.objectlink2.fields[i], scope
							),
							type = fieldSchemaFragment.type,
							label = fieldSchemaFragment.title,
							value = data.refdata[i]
						;

						input.append(
							angular.element('<span title="' + label + '">' 
								+ objectlink2Factory.getFormatedValue(type,value) 
								+ '</span>'
							)
						);
					}
				}

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

				// selectobx
				var selectbox = objectlink2Factory.create(elm, {
					onSelected: function(value){
						render(value);
						console.log('onSelected');
						console.log(arguments);
					}
				});
				selectbox.setInput(selfControl.getInput());
				selectbox.setDropdown(dropdown);

				// store
				var dataset = dataFactory.createTestDataset(scope, schemaFragment, 6000);
				selectbox.setDataset(dataset);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));

