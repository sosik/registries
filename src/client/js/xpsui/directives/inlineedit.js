(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiInlineedit', ['xpsui:logging', 'xpsui:FormGenerator', '$compile', '$timeout', '$parse', function(log, formGenerator, $compile, $timeout, $parse) {
		return {
			restrict: 'A',
			require: ['^xpsuiFormControl','xpsuiInlineedit'],

			controller: function() {
				this.setCommitButton = function(button){
					this.comitButton = button;
				}
				
				this.showCommitButton = function(){
					this.comitButton.removeClass('x-hidden');
				}

				this.hideCommitButton = function(){
					this.comitButton.addClass('x-hidden');
				}
				
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('Inlineedit Link');

				var formControl = ctrls[0];
				var selfCtrl = ctrls[1];

				var modelPath = attrs.xpsuiModel;
				var schemaPath = attrs.xpsuiSchema;
				var oldValue = null;

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

				var buttonsElm = angular.element('<div class="x-inlineedit-buttons x-hidden"></div>');
				var commitButton = angular.element('<button class="x-component-button x-inlineedit-commit-button"><i class="fa fa-check"></i><span>Uložiť</span></button>');
				var rollbackButton = angular.element('<button class="x-component-button x-inlineedit-rollback-button"><i class="fa fa-remove"></i><span>Zrušiť</span></button>');
				selfCtrl.setCommitButton(commitButton);
				
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

					oldValue = scope.$eval(modelPath);
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
					scope.$emit('xpsui:model_changed');

					return true;
				}
				
				var commitClickHandler = function(evt) {
					evt.stopPropagation();

					if (commit()) {
						formControl.releaseFocus(elm);
					}

					formControl.releaseFocus(elm);

					return false;
				};

				commitButton.on('click', commitClickHandler);

				function rollback() {
					enterViewMode();

					scope.$apply(function() {
						$parse(modelPath).assign(scope, oldValue); 
					});

					formControl.releaseFocus(elm);
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

