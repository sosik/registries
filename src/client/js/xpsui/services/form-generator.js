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
			var fieldsetClass = 'x-fieldset-label';

			return angular.element('<div class="' + fieldsetClass + ' ' + isRequired + '" >' 
				+ '<span>' + (schemaFragment.transCode ?
					$translate.instant(schemaFragment.transCode) : schemaFragment.title
				) + '</span>' 
			+ '</div>');
		};

		FormGenerator.prototype.generateValidations = function(field, schemaFragment, schemaPath, modelPath, mode) {
			//validation make sense only in edit mode
			if (mode === this.MODE.EDIT) {

				// validations
				if (schemaFragment.required) {
					field.attr('required', true);
					field.attr('xpsui-validity-mark', '');
				}

				if (schemaFragment.unique) {
					console.log('');
					// FIXME why do i need this definition? whay i cannot simply use whole object options in xpsui-schema
					field.attr('xpsui-unique', schemaPath + '.unique');
					field.attr('xpsui-validity-mark', '');
					// @todo it is replaced with recursive function (from down to up)
					// field.attr('psui-unique-id', options.modelPath+'.id');
				}
			}

			return field;
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
					if (schemaFragment.items && schemaFragment.items.render && schemaFragment.items.render.component ) {
						field = angular.element('<div xpsui-array-control-edit="'+schemaFragment.items.render.component+'"></div>');
					} else {
						field = angular.element('<div xpsui-array-control-edit></div>');
					}
					field.attr('xpsui-schema', schemaPath);
				} else if(schemaFragment.objectLink2) {
					field = angular.element('<div xpsui-objectlink2-edit></div>');
					field.attr('xpsui-schema', schemaPath);
				} else if(schemaFragment.uploadableImage
					|| (schemaFragment.render && schemaFragment.render.component === 'psui-uploadable-image')){
					field = angular.element('<div xpsui-uploadable-image xpsui-imageresizor /></div>');
					field.attr('xpsui-schema', schemaPath);
					var width = schemaFragment.uploadableImage ? 
						schemaFragment.uploadableImage.width : schemaFragment.render.width;
					var height = schemaFragment.uploadableImage ? 
						schemaFragment.uploadableImage.height : schemaFragment.render.height;

					field.attr('psui-width', width);
					field.attr('psui-height', height);

				} else if (schemaFragment.enum) {
					field = angular.element('<div xpsui-select-edit></div>');
					field.attr('xpsui-schema', schemaPath);
				} else if (schemaFragment.render && schemaFragment.render.component  ){
					if ( schemaFragment.render.component=="psui-textarea" ) {
						field = angular.element('<div xpsui-textarea-edit></div>');
					} else if ( schemaFragment.render.component=="psui-datepicker" ) {
						field = angular.element('<div xpsui-date-edit xpsui-calendar ></div>');
					} else if (schemaFragment.render.component=="psui-contenteditable") {
						field = angular.element('<div xpsui-contenteditable></div>');

					} else if (schemaFragment.render.component=="psui-uploadable-file") {
						field = angular.element('<div xpsui-uploadable-file></div>');
					} else {
						field = angular.element('<div>Unsupported render component '+schemaFragment.render.component+'</div>');
					}
				} else {
					field = angular.element('<div xpsui-string-edit ></div>');
				}

				field.attr('xpsui-schema', schemaPath);
				field.attr('ng-model', modelPath);
				field.attr('xpsui-calculable', schemaPath);

			} else {
				if (schemaFragment.type === 'array') {
					if (schemaFragment.items && schemaFragment.items.render && schemaFragment.items.render.component) {
						field = angular.element('<div xpsui-array-control-view="'+schemaFragment.items.render.component+'"></div>');

					} else {
						field = angular.element('<div xpsui-array-control-view></div>');
					}

					field.attr('xpsui-schema', schemaPath);
				} else if (schemaFragment.objectLink2) {
					field = angular.element('<div xpsui-objectlink2-view></div>');
					field.attr('xpsui-schema', schemaPath);
				} else if (schemaFragment.uploadableImage
					|| (schemaFragment.render && schemaFragment.render.component === 'psui-uploadable-image')) {

					field = angular.element('<div xpsui-uploadable-image-view></div>');
					var width = schemaFragment.uploadableImage ? 
							schemaFragment.uploadableImage.width : schemaFragment.render.width;
					var height = schemaFragment.uploadableImage ? 
						schemaFragment.uploadableImage.height : schemaFragment.render.height;
					var style = 'width: 100% !important;'
						+ (height ? 'height:'+height+'px !important;':'height:150px;')
						+ 'background-size: contain;'
						+ 'background-repeat: no-repeat;'
						+ 'background-position: top left;';
					field = angular.element('<div style="' + style + 'background-image: url(\'{{' + modelPath + '?' + modelPath + ':\'/img/no_photo.jpg\'}}\')"></div>');
				} else if(schemaFragment.type === "date"
					|| (schemaFragment.render && schemaFragment.render.component === 'psui-datepicker')) {
					field = angular.element('<div xpsui-date-view></div>');
				} else if (schemaFragment.enum) {
					field = angular.element('<div xpsui-select-view></div>');
					field.attr('xpsui-schema', schemaPath);
				} else {
					field = angular.element('<div xpsui-string-view ></div>');
				}

				field.attr('ng-model', modelPath);
				field.attr('xpsui-calculable', schemaPath);

			}

			return field;
		};

		FormGenerator.prototype.generatePropertyRow = function(schemaFragment, schemaPath, modelPath, mode) {

			if (schemaFragment.type === 'array') {
				var container = angular.element('<div ></div>');
				var row1 = angular.element('<div class="x-fieldset-row"></div>');
				row1.append(this.generateLabel(schemaFragment));

				if (schemaFragment.readOnly) {
					mode = this.MODE.VIEW;
				}
				var row2 = angular.element('<div class="x-fieldset-row"></div>');
				row2.append(this.generateValidations(this.generateField(schemaFragment, schemaPath, modelPath, mode), schemaFragment, schemaPath, modelPath, mode));
				container.append(row1);
				container.append(row2);
				return container;
			}

			var row = angular.element('<div class="x-fieldset-row"></div>');

			row.append(this.generateLabel(schemaFragment));

			var value = angular.element('<div class="x-fieldset-value"></div>');

			if (schemaFragment.readOnly) {
				mode = this.MODE.VIEW;
			}
			value.append(this.generateValidations(this.generateField(schemaFragment, schemaPath, modelPath, mode),schemaFragment, schemaPath, modelPath, mode));
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
								if (localFragment.objectLink2) {
									// objectLink2
									component = this.generatePropertyRow(localFragment, localSchemaPath, localModelPath, mode);
								} else {
									// general object, render as fieldset
									component = angular.element('<div></div>');
									component.attr('xpsui-options', localSchemaPath);
									component.attr('xpsui-model', localModelPath);
									component.attr('xpsui-fieldset', mode);
								}
							} else if (localFragment.type === 'string' ||
								localFragment.type === 'array' ||
								localFragment.type === 'number'
							) {
								component = this.generatePropertyRow(localFragment, localSchemaPath, localModelPath, mode);
							} else {
								log.warn('Local fragment type %s not implemented yet', localFragment.type);
							}
						} else {
							// localFragment has not explicitly defined type
							// we will try to identify types by other means
							if (localFragment.objectLink2) {
								component = this.generatePropertyRow(localFragment, localSchemaPath, localModelPath, mode);
							} else {
								log.warn('Cannot identify type of fragment %s', localSchemaPath);
							}
						}

						//component = componentGenerator.generate(schemaFragment.properties[p], localSchemaPath, localModelPath, mode || this.MODE.VIEW);
						if(component){
							elm.append(component);
							$compile(component)(scope);
						}

						log.groupEnd();
					}
				} else {
						log.warn('Schema fragment type "%s" not implemented yet', schemaFragment.type);
				}
			} else {
				log.warn('Schema fragment has not explicit type defined');
			}
		};

		return new FormGenerator();
	}]);

}(window.angular));
