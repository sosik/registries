(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiInlineedit', ['xpsui:logging', 'xpsui:FormGenerator', '$compile', '$timeout', function(log, formGenerator, $compile, $timeout) {
		return {
			restrict: 'A',
			require: ['^xpsuiFormControl'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('Inlineedit Link');

				var formControl = ctrls[0];

				var modelPath = attrs.xpsuiModel;
				var schemaPath = attrs.xpsuiSchema;

				elm.addClass('x-inlineedit');

				if (modelPath && schemaPath) {
				} else {
					log.warn('Attributes xpsui-model and xpsui-schema have to be set, skipping inlineedit generation');
					log.groupEnd();
					return;
				}

				var schema = scope.$eval(schemaPath);
				var mode = attrs.xpsuiInlineedit || formGenerator.MODE.VIEW;

				var viewElm = formGenerator.generateField(schema, schemaPath, modelPath, formGenerator.MODE.VIEW);
				var editElm = formGenerator.generateField(schema, schemaPath, modelPath, formGenerator.MODE.EDIT);


				var contentElm = angular.element('<div class="x-inlineedit-content"></div>');
				contentElm.append(viewElm);
				contentElm.append(editElm);

				elm.append(contentElm);

				$compile(viewElm)(scope);
				$compile(editElm)(scope);

				var buttonsElm = angular.element('<div class="x-inlineedit-buttons x-hidden"></button></div>');
				var commitButton = angular.element('<button class="x-component-button x-inlineedit-commit-button"><i class="fa fa-check"></i><span>Uložiť</span></button>');
				var rollbackButton = angular.element('<button class="x-component-button x-inlineedit-rollback-button"><i class="fa fa-remove"></i><span>Zrušiť</span></button>');

				buttonsElm.append(commitButton).append(rollbackButton);

				elm.append(buttonsElm);

				function enterEditMode() {
					mode = formGenerator.MODE.EDIT;
					viewElm.addClass('x-hidden');
					editElm.removeClass('x-hidden');
					buttonsElm.removeClass('x-hidden');
					elm.addClass('x-inlineedit-edit-mode');
					elm.removeClass('x-inlineedit-view-mode');
					editElm.triggerHandler('focus');

					elm.removeClass('x-inlineedit-active');

					elm.off('click', viewModeClickHandler);
				}

				var viewModeClickHandler = function(evt) {
					if (mode === formGenerator.MODE.VIEW && formControl.acquireFocus(elm)) {
						enterEditMode();
					}
				};

				function enterViewMode() {
					mode = formGenerator.MODE.VIEW;
					viewElm.removeClass('x-hidden');
					editElm.addClass('x-hidden');
					buttonsElm.addClass('x-hidden');
					elm.addClass('x-inlineedit-view-mode');
					elm.removeClass('x-inlineedit-edit-mode');
				
					elm.on('click', viewModeClickHandler);
				}

				function commit() {
					enterViewMode();

					return true;
				}
				
				var commitClickHandler = function(evt) {
					evt.stopPropagation();

					if (commit()) {
						formControl.releaseFocus(elm);
					}

					return false;
				};

				commitButton.on('click', commitClickHandler);

				function rollback() {
					enterViewMode();
				}

				var rollbackClickHandler = function(evt) {
					rollback();
					evt.stopPropagation();

					return false;
				};

				rollbackButton.on('click', rollbackClickHandler);

				elm.on('mouseover', function(evt) {
					if (mode !== formGenerator.MODE.EDIT && formControl.acquireFocus(elm)) {
						elm.addClass('x-inlineedit-active');
						
						elm.one('mouseout', function() {
							elm.removeClass('x-inlineedit-active');
							if (mode !== formGenerator.MODE.EDIT) {
								formControl.releaseFocus(elm);
							}
						});
					}
				});
				if (mode === formGenerator.MODE.EDIT) {
					enterEditMode();
				} else {
					enterViewMode();
				}

				log.groupEnd();
			}
		};
	}]);

}(window.angular));

