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
	.factory('xpsui:FormGenerator', ['xpsui:logging', '$compile', 'xpsui:ComponentGenerator', '$timeout', '$translate', function(log, $compile, componentGenerator, $timeout, $translate) {
		function FormGenerator() {
		}

		FormGenerator.prototype.MODE = {
			VIEW: 'view',
			EDIT: 'edit',
			VIEWEDIT: 'viewedit'
		};

		FormGenerator.prototype.generateLabel = function(schemaFragment) {
			// TODO translation
			var isRequired = (schemaFragment.required ? ' x-required': '');
			
			return angular.element('<div class="x-fieldset-label ' + isRequired + '" >' 
				+ '<span>' + (schemaFragment.transCode ?
					$translate.instant(schemaFragment.transCode) : schemaFragment.title
				) + '</span>' 
			+ '</div>');
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

				if (schemaFragment.type === 'array') {
					field = angular.element('<div xpsui-array-control-edit></div>');
					field.attr('xpsui-schema', schemaPath);
				} else 
				if(schemaFragment.objectLink2){
					field = angular.element('<div xpsui-objectlink2-edit></div>');
					field.attr('xpsui-schema', schemaPath);
				} else if(schemaFragment.$uploadableImage
					|| (schemaFragment.render && schemaFragment.render.component === 'psui-uploadable-image')){
					field = angular.element('<div xpsui-uploadable-image xpsui-imageresizor /></div>');
					field.attr('xpsui-schema', schemaPath);
					var width = schemaFragment.$uploadableImage ? 
						schemaFragment.$uploadableImage.width : schemaFragment.render.width;
					var height = schemaFragment.$uploadableImage ? 
						schemaFragment.$uploadableImage.height : schemaFragment.render.height;

					field.attr('psui-imageresizor-width', width);
					field.attr('psui-imageresizor-height', height);
					field.attr('style', (width ? 'width:'+ width+'px !important;':'')
						+ (height ? 'height:'+height+'px !important;':'')
					);
				} else if(schemaFragment.type === "date" 
					|| (schemaFragment.render && schemaFragment.render.component === 'psui-datepicker')){
					field = angular.element('<div xpsui-date-edit xpsui-calendar ></div>'); 
					field.attr('xpsui-schema', schemaPath);
				} else if( schemaFragment.type === "string"
					|| schemaFragment.type === "Decimal"
				){
					if(schemaFragment.enum){
						field = angular.element('<div xpsui-select-edit></div>');
						field.attr('xpsui-schema', schemaPath);
					} else {
						field = angular.element('<div xpsui-string-edit></div>');
					}
				}
				
				field.attr('ng-model', modelPath);
				field.attr('xpsui-validity-mark', '');

				// validations
				if (schemaFragment.required) {
					field.attr('required', true);
				}

				if (schemaFragment.unique) {
					console.log('');
					field.attr('xpsui-unique', schemaPath + '.unique');
					// @todo it is replaced with recursive function (from down to up)
					// field.attr('psui-unique-id', options.modelPath+'.id');
				}
				

			} else {

				if (schemaFragment.type === 'array') {
					field = angular.element('<div xpsui-array-control-view></div>');
					field.attr('xpsui-schema', schemaPath);
				} else 
				if(schemaFragment.objectLink2){
					field = angular.element('<div xpsui-objectlink2-view></div>');
					field.attr('xpsui-schema', schemaPath);
				} else if(schemaFragment.$uploadableImage
					|| (schemaFragment.render && schemaFragment.render.component === 'psui-uploadable-image')){
					field = angular.element('<img ng-src="{{' + modelPath + '}}" src="" xpsui-default-src="/img/no_photo.jpg"></img>');
					var width = schemaFragment.$uploadableImage ? 
						schemaFragment.$uploadableImage.width : schemaFragment.render.width;
					var height = schemaFragment.$uploadableImage ? 
						schemaFragment.$uploadableImage.height : schemaFragment.render.height;

					field.attr('width', width);
					field.attr('height', height);
				} else if(schemaFragment.type === "date" 
					|| (schemaFragment.render && schemaFragment.render.component === 'psui-datepicker')){
					field = angular.element('<div xpsui-date-view></div>');
				} else if( schemaFragment.type === "string"
					|| schemaFragment.type === "Decimal"
				){
					if(schemaFragment.enum){
						field = angular.element('<div xpsui-select-view></div>');
						field.attr('xpsui-schema', schemaPath);
					} else {
						field = angular.element('<div xpsui-string-view></div>');
					}
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

			// @todo schema root missing type property
			// if (schemaFragment && schemaFragment.type) {
			if (schemaFragment) {
				// schema fragment has defined type
				// @todo schema root missing type property
				//if (schemaFragment.type === 'object') {
				if (typeof schemaFragment.properties == 'object') {
					for (p in schemaFragment.properties) {
						component = null;
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
							} else if (localFragment.type === 'string' 
								|| localFragment.type === 'date' 
								|| localFragment.type === 'array'
								|| localFragment.type === 'Decimal'
							) {
								component = this.generatePropertyRow(localFragment, localSchemaPath, localModelPath, mode);
							} else {
								log.warn('Local fragment type %s not implemented yet', localFragment.type);
							}
						} else {
							// localFragment has not explicitly defined type
						}
						
						//component = componentGenerator.generate(schemaFragment.properties[p], localSchemaPath, localModelPath, mode || this.MODE.VIEW);
						if(component){
							elm.append(component);
							$compile(component)(scope);
						}

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
