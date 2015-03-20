(function(angular) {
	'use strict';

	angular.module('xpsui:directives')

	/**
	 * Renders and manages block of form components. Mainly used for schema render.
	 *
	 * @module client
	 * @submodule directives
	 * @class xpsui-fieldset
	 */
	.directive('xpsuiFieldset', ['xpsui:logging', 'xpsui:FormGenerator', '$compile', function(log, formGenerator, $compile) {
		return {
			restrict: 'A',
			link: function(scope, elm, attrs, ctrls) {
				log.group('FieldSet Link');

				/**
				 * NgModel binding for fieldset
				 * @default false
				 * @required true
				 * @attribute xpsui-model
				 */
				var modelPath = attrs.xpsuiModel;

				/**
				 * Options used for directive processing. It can consume schema fragment
				 * @default false
				 * @required true
				 * @attribute xpsui-options
				 */
				var options = attrs.xpsuiOptions;

				elm.addClass('x-fieldset');

				if (modelPath && options) {
				} else {
					log.warn('Attributes xpsui-model and xpsui-options have to be set, skipping fieldset generation');
					log.groupEnd();
					return;
				}

				var schema = scope.$eval(options);
				var mode = attrs.xpsuiFieldset;

				if (schema && schema.transCode) {
					var titleElm = angular.element('<div class="x-fieldset-title">{{\'' + schema.transCode + '\'|translate}}</div>');
					//elm.append(titleElm);
					elm.append($compile(titleElm)(scope));
				} else if (schema && schema.title) {
					elm.append('<div class="x-fieldset-title">' + schema.title + '</div>');
				} else {
					elm.append('<div class="x-fieldset-title"></div>');
				}

				var content = angular.element('<div class="x-fieldset-content"></div>');
				elm.append(content);
				formGenerator.generateForm(scope, content, schema, options, modelPath, mode || formGenerator.MODE.VIEW);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));
