(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiBySchemaFieldView', ['xpsui:logging', 'xpsui:FormGenerator', '$compile', function(log, formGenerator, $compile) {
		return {
			restrict: 'A',
			require: [],
			link: function(scope, elm, attrs, ctrls) {
				log.group('By Schema Field view Link');

				var modelPath = attrs.xpsuiModel;

				attrs.$observe('xpsuiSchema', function(v) {
					console.log(v);
					if (v) {
						regenerateField();
					}
				});

				function regenerateField() {
					var schemaPath = attrs.xpsuiSchema;
					var schemaFragment = scope.$eval(schemaPath);
					var modelPath = attrs.xpsuiModel;

					var field = formGenerator.generateField(schemaFragment, schemaPath, modelPath, formGenerator.MODE.VIEW);

					elm.empty();

					elm.append(field);
					$compile(field)(scope);
				}
				log.groupEnd();
			}
		};
	}]);

}(window.angular));

