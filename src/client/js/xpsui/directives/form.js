(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiForm', ['$compile', '$parse', 'xpsui:logging', 'xpsui:FormGenerator', 'xpsui:Calculator', function($compile, $parse, log, formGenerator, calculator) {
		return {
			restrict: 'A',
			require: 'xpsuiForm',
			controller: [ '$scope', '$element', '$attrs', function($scope, $element, $attrs) {
				this.focusedElm = null;

				this.acquireFocus = function(e) {
					if (this.focusedElm === null || this.focusedElm === e) {
						this.focusedElm = e;
						return true;
					}

					return false;
				};

				this.releaseFocus = function(e) {
					if (this.focusedElm === e) {
						this.focusedElm = null;
						return true;
					}

					return false;
				};

				/**
				 * Registers a calculation for the `model` based on the `scheam`
				 *
				 * @param {string} model
				 * @param {object} schema
				 * @returns {function()} Returns a deregistration function for this listener
				 */
				this.registerCalculation = function(model, schema) {
					// Create new Computed property
					var property = calculator.createProperty(schema),
						// getter for the form model
						formModelGetter = $parse($attrs.xpsuiModel),
						// getter for the current model
						modelGetter = $parse(model);

					// Get form model
					var formModel = formModelGetter($scope);

					function calculate() {
						// Get model value
						var modelValue = modelGetter($scope);
						// Check 'onlyEmpty' flag - run calculation only if the this flag is not set or
						// current model value is empty
						// NOTE: Do not use !model because "false" can be allowed value
						if (!schema.onlyEmpty || modelValue === undefined || modelValue === "") {
							// Run first calculation
							property.getter(formModel).then(function (result) {
								modelGetter.assign($scope, result);
							});
						}
					}

					calculate();

					// Register property watcher
					return $scope.$watch(property.watcher(formModel), function(newValue, oldValue) {
						if (newValue != oldValue) {
							calculate();
						}
					}, true); // NOTE: Always use TRUE for computedProperty.watcher
				};
			}],
			link: function(scope, elm, attrs, ctrls) {
				log.group('xpsuiForm Link');
				log.time('xpsuiForm Link');

				elm.addClass('x-form');

				if (attrs.xpsuiModel && attrs.xpsuiSchema) {
				} else {
					log.warn('Attributes xpsui-model and xpsui-schema have to be set, skipping form generation');
					log.timeEnd('xpsuiForm Link');
					log.groupEnd();
					return;
				}

				scope.$watchCollection( attrs.xpsuiSchema, function() {
					log.info('xpsuiForm generate');
					var schema = scope.$eval(attrs.xpsuiSchema);
					var mode = attrs.xpsuiForm;	

					if(schema.properties){
						elm.append('<div class="x-form-title">' + schema.title + '</div>');
						formGenerator.generateForm(scope, elm, schema, attrs.xpsuiSchema, attrs.xpsuiModel, mode || formGenerator.MODE.VIEW);
					} else {
						log.info('xpsuiForm schema does not exist');
					}
					
					
				});

				log.timeEnd('xpsuiForm Link');
				log.groupEnd();
			}
		};
	}]);


}(window.angular));
