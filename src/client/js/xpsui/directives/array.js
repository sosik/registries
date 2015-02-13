(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiArray', ['xpsui:log', 'xpsui:ComponentGenerator', '$compile', function(log, componentGenerator, $compile) {
		return {
			restrict: 'E',
			link: function(scope, elm, attrs, ctrls) {
				log.group('xpsui-array Link');

				var modelPath = attrs.xpsuiModel;
				var schemaPath = attrs.xpsuiSchema;


				if (modelPath && schemaPath) {
				} else {
					log.warn('Attributes xpsui-model and xpsui-schema have to be set, skipping fieldset generation');
					log.groupEnd();
					return;
				}

				var itemsHolder = angular.element('<div></div>');

				elm.append(itemsHolder);
				function generateArrayElements() {
					itemsHolder.empty();

					var schema = scope.$eval(schemaPath.concat('.items'));
					angular.forEach(scope.$eval(modelPath), function(val, key) {
						var arrayItem = angular.element('<div></div>');
						angular.forEach(schema.properties, function(v, k) {
							var component = componentGenerator.generate(schema.properties[k], schemaPath.concat('.items.properties.', k), modelPath.concat('.',key, '.', k));
							arrayItem.append(component);
						});
						itemsHolder.append(arrayItem);
						$compile(arrayItem)(scope);
					});
				}

				generateArrayElements();
				log.groupEnd();
			}
		};
	}]);

}(window.angular));