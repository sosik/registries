(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiFieldset', ['xpsui:logging', 'xpsui:FormGenerator', function(log, formGenerator) {
		return {
			restrict: 'A',
			link: function(scope, elm, attrs, ctrls) {
				log.group('FieldSet Link');

				var modelPath = attrs.xpsuiModel;
				var schemaPath = attrs.xpsuiSchema;

				elm.addClass('x-fieldset');

				if (modelPath && schemaPath) {
				} else {
					log.warn('Attributes xpsui-model and xpsui-schema have to be set, skipping fieldset generation');
					log.groupEnd();
					return;
				}

				var schema = scope.$eval(schemaPath);
				var mode = attrs.xpsuiFieldset;

				if (schema && schema.title) {
					// TODO translation
					elm.append('<div class="x-fieldset-title">' + schema.title + '</div>');
				}

				var content = angular.element('<div class="x-fieldset-content"></div>');
				elm.append(content);
				formGenerator.generateForm(scope, content, schema, schemaPath, modelPath, mode || formGenerator.MODE.VIEW);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));
