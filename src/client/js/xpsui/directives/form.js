(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiForm', [
		'$compile', '$parse', 'xpsui:logging', 'xpsui:FormGenerator', 'xpsui:Calculator', '$translate',
		function($compile, $parse, log, formGenerator, calculator, $translate) {
			return {
				restrict: 'A',
				require: '^form',
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

					var formCtrl = ctrls;

					formCtrl.xpsui = formCtrl.xpsui || {
						submitPrepare: false,
						prepareForSubmit: function() {
							formCtrl.xpsui.submitPrepare = true;
						}
					};

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


						// ACTIONS
						if ( "viewedit"===mode && schema.clientActions ) {
							var contentActionsHolder = angular.element('<div class="content-actions pull-right"></div>');
							elm.append(contentActionsHolder);

							for (var actionIndex in schema.clientActions) {
								var action = schema.clientActions[actionIndex];

								var actionElm;
								console.log('xxxxxxx'+action.__DIRECTIVE__);
								switch (action.__DIRECTIVE__){
									case 'action-link':
										actionElm = angular.element('<a xpsui-form-action-link psui-options="schemaFormOptions.schema.clientActions.'+actionIndex+'" psui-model="'+attrs.xpsuiModel+'" class="btn-primary"></a>');
										$compile(actionElm)(scope);
										contentActionsHolder.append(actionElm);
									break;
									case 'generate-action-link':
										actionElm = angular.element('<a xpsui-form-generate-action-link psui-options="schemaFormOptions.schema.clientActions.'+actionIndex+'" psui-model="'+attrs.xpsuiModel+'" class="btn-primary"></a>');
										$compile(actionElm)(scope);
										contentActionsHolder.append(actionElm);
									break;
									default:
									console.error('Unknown directive value',action.__DIRECTIVE__);
									break;
								}

							}
						}

						if(schema.properties){
							elm.append('<div class="x-form-title">'
								+ (schema.transCode ? $translate.instant(schema.transCode) : schema.title)
								+ '</div>'
							);
							formGenerator.generateForm(scope, elm, schema, attrs.xpsuiSchema, attrs.xpsuiModel, mode || formGenerator.MODE.VIEW);
						} else {
							log.info('xpsuiForm schema does not exist');
						}


					});

					log.timeEnd('xpsuiForm Link');
					log.groupEnd();
				}
			};
		}
	]);


}(window.angular));
