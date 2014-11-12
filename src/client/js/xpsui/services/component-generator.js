(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:ComponentGenerator', ['xpsui:logging', function(log) {
		var EDIT_MODE = 'EDIT_MODE';
		var VIEW_MODE = 'VIEW_MODE';
		var EDITVIEW_MODE = 'EDITVIEW_MODE';

		function isPrimitiveProperty(schemaFragment) {
			if (schemaFragment.type && (schemaFragment.type === 'string' || schemaFragment.type === 'number')) {
				return true;
			}

			return false;
		}

		function generatePrimitiveViewControl(schemaFragment, schemaPath, modelPath) {
			var control = angular.element('<div xpsui-string-view></div>');
			control.attr('ng-model', modelPath);

			return control;
		}

		// @todo add datapicker
		function generatePrimitiveEditControl(schemaFragment, schemaPath, modelPath) {
			var control = angular.element('<div xpsui-string-edit></div>');
			control.attr('ng-model', modelPath);

			return control;
		}

		function generateStandardPrimitivePropertyPair(schemaFragment, schemaPath, modelPath, mode) {
			var propContainer = angular.element('<div class="x-standard-prop-pair"></div>');
			var label = angular.element('<div class="x-label"></div>');

			propContainer.append(label);
			if (schemaFragment && schemaFragment.title) {
				label.text(schemaFragment.title);
			}

			var control;
			if (mode === 'EDIT_MODE') {
				control = generatePrimitiveEditControl(schemaFragment, schemaPath, modelPath);
			} else if (mode === 'VIEW_MODE') {
				control = generatePrimitiveViewControl(schemaFragment, schemaPath, modelPath);
			} else if (mode === 'EDITVIEW_MODE') {
			} else {
				log.error('Unknown mode');
				return null;
			}
			propContainer.append(control);
			return propContainer;
		}

		function generate(schemaFragment, schemaPath, modelPath, mode) {
			/*
			 * Known modes EDIT, VIEW, EDITVIEW
			 */
			var result;
			if (!schemaFragment) {
				log.error('No schemaFragment provided, cannot generate component');
				return;
			}

			// identify base component to use
			if (schemaFragment.type && schemaFragment.type === 'array') {
				result = angular.element('<xpsui-array></xpsui-array>');
				result.attr('xpsui-schema', schemaPath);
				result.attr('xpsui-model', modelPath);

				return result;
			} else if (isPrimitiveProperty(schemaFragment)) {
				return generateStandardPrimitivePropertyPair(schemaFragment, schemaPath, modelPath, mode || VIEW_MODE);
			} else {
				result = angular.element('<div xpsui-fieldset></div>');
				result.attr('xpsui-schema', schemaPath);
				result.attr('xpsui-model', modelPath);

				return result;
			}

			if (schemaFragment.transient) {
				log.debug('transient');
				result.attr('xpsui-model', modelPath);
			} else {
				log.debug('not transient, setting ng-model to "%s"', modelPath);
				result.attr('ng-model', modelPath);
			}

			if (schemaFragment.readOnly) {
				log.debug('readOnly, setting xpsui-text-view');
				result.attr('xpsui-text-view', '');
			} else {
				log.debug('not readOnly, setting xpsui-text-input');
				result.attr('xpsui-text-input', '');
			}

			if (schemaPath) {
				log.debug('schemaPath is defined, setting xpsui-options to "%s"', schemaPath);
				result.attr('xpsui-options', schemaPath);
			}

			return result;
		}

		return {
			generate: generate
		};
	}]);

}(window.angular));
