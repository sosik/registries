(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	/**
	 *
	 * Factory used for generation of forms by schema definitions.
	 *
	 * @class FormGenerator
	 * @module client
	 * @submodule services
	 */
	.factory('xpsui:FormGenerator', ['xpsui:logging', '$compile', 'xpsui:ComponentGenerator', '$timeout', function(log, $compile, componentGenerator, $timeout) {
		function FormGenerator() {
		}

		FormGenerator.prototype.MODE = {
			VIEW: 'view',
			EDIT: 'edit',
			VIEWEDIT: 'viewedit'
		};

		FormGenerator.prototype.generateLabel = function(schemaFragment) {
			// TODO translation
			return angular.element('<div class="x-fieldset-label"><span>' + schemaFragment.title + '</span></div>');
		};

		FormGenerator.prototype.generateField = function(schemaFragment, schemaPath, modelPath, mode) {
			var field;

			if (mode === this.MODE.VIEWEDIT) {
				field = angular.element('<div></div>');
				field.attr('xpsui-form-control', 'x');
				field.attr('xpsui-inlineedit', this.MODE.VIEW);
				field.attr('xpsui-model', modelPath);
				field.attr('xpsui-schema', schemaPath);
			} else if (mode === this.MODE.EDIT) {
				if(schemaFragment.type === "string"){
					field = angular.element('<div xpsui-string-edit></div>');
				}
				if(schemaFragment.type === "date"){
					field = angular.element('<div xpsui-date-edit xpsui-dropdown xpsui-calendar ></div>'); //  
				}
				
				field.attr('ng-model', modelPath);
				

			} else {
				if(schemaFragment.type === "string"){
					field = angular.element('<div xpsui-string-view></div>');
				}
				if(schemaFragment.type === "date"){
					field = angular.element('<div xpsui-date-view></div>');
				}

				field.attr('ng-model', modelPath);
				
			}

			return field;
		};

		FormGenerator.prototype.generatePropertyRow = function(schemaFragment, schemaPath, modelPath, mode) {
			var row = angular.element('<div class="x-fieldset-row"></div>');

			row.append(this.generateLabel(schemaFragment));

			var value = angular.element('<div class="x-fieldset-value"></div>');
			value.append(this.generateField(schemaFragment, schemaPath, modelPath, mode));
			row.append(value);
			
			return row;
		};

		/**
		 * Generates form defined by schema
		 * @method generateForm
		 * @param scope used angular scope
		 * @param elm element to geneerate form elements in
		 * @param schemaFragment {Object} fragment of schema used as form definition
		 * @param schemaPath 
		 * @param modelPath
		 * @param mode
		 */
		FormGenerator.prototype.generateForm = function(scope, elm, schemaFragment, schemaPath, modelPath, mode) {
			var p, localSchemaPath, localModelPath, localFragment, component, labelComponent, fieldComponent;

			if (!schemaFragment) {
				log.warn('Schema fragment not defined, existing');
				return;
			}

			if (schemaFragment && schemaFragment.type) {
				// schema fragment has defined type
				if (schemaFragment.type === 'object') {
					for (p in schemaFragment.properties) {

						localSchemaPath = schemaPath.concat('.properties.', p);
						localModelPath = modelPath.concat('.', p);
						localFragment = schemaFragment.properties[p];

						log.group('Generating element for "%s"', localSchemaPath);

						if (localFragment && localFragment.type) {
							// localFragment has explicitly defined type
							if (localFragment.type === 'object') {
								component = angular.element('<div></div>');
								component.attr('xpsui-options', localSchemaPath);
								component.attr('xpsui-model', localModelPath);
								component.attr('xpsui-fieldset', mode);
							} else if (localFragment.type === 'string' || localFragment.type === 'date') {
								component = this.generatePropertyRow(localFragment, localSchemaPath, localModelPath, mode);
							} else {
								log.warn('Local fragment type %s not implemented yet', localFragment.type);
							}
						} else {
							// localFragment has not explicitly defined type
						}
						
						//component = componentGenerator.generate(schemaFragment.properties[p], localSchemaPath, localModelPath, mode || this.MODE.VIEW);

						elm.append(component);
						$compile(component)(scope);
						
						log.groupEnd();
					}
				} else {
						log.warn('Schema fragment type %s not implemented yet', schemaFragment.type);
				}
			} else {
				log.warn('Schema fragment has not explicit type defined');
			}
		};

		return new FormGenerator();
	}]);

}(window.angular));
