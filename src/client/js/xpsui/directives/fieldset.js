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
	.directive('xpsuiFieldset', ['xpsui:logging', 'xpsui:FormGenerator', '$translate', 
		function(log, formGenerator, $translate) {
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

					if (schema) {
						/**
						 * full screen render
						 */
						if (schema.render && schema.render.width) {
							switch (schema.render.width) {
								case 'full': 
									elm.addClass('x-fieldset-full');
								break;
							}
						}

					}

					if (schema && (schema.title || schema.transCode)) {
						// TODO translation
						elm.append('<div class="x-fieldset-title">' 
							+ (schema.transCode ? $translate.instant(schema.transCode) : schema.title)
							+ '</div>'
						);

					} else {
						elm.append('<div class="x-fieldset-title"></div>');
					}

					var content = angular.element('<div class="x-fieldset-content"></div>');
					elm.append(content);
					formGenerator.generateForm(scope, content, schema, options, modelPath, mode || formGenerator.MODE.VIEW);

					log.groupEnd();
				}
			};
		}
	]);

}(window.angular));
