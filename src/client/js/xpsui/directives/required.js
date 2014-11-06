(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiRequired', ['xpsui:logging', 'xpsui:FormGenerator', '$compile', function(log, formGenerator, $compile) {
		return {
			restrict: 'A',
			link: function(scope, elm, attrs, ctrls) {
				log.group('Required Link');

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
				var mode = attrs.xpsuiInlineedit;

				var viewElm = formGenerator.generateField(schema, schemaPath, modelPath, formGenerator.MODE.VIEW);
				var editElm = formGenerator.generateField(schema, schemaPath, modelPath, formGenerator.MODE.EDIT);

				$compile(viewElm)(scope);
				$compile(editElm)(scope);
				elm.append(viewElm);
				elm.append(editElm);

				log.groupEnd();
			}
		};
	}]);

}(window.angular));


