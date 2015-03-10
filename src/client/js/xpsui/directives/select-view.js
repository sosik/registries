(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiSelectView', ['xpsui:logging','$translate','xpsui:SelectDataFactory', function(log, $translate, datafactory) {
		return {
			restrict: 'A',
			require: ['^ngModel'],
			link: function(scope, elm, attrs, ctrls) {
				var schemaFragment = null;
				var data = [];

				elm.addClass('x-select-view');

				if (attrs.xpsuiSchema) {
					schemaFragment = scope.$eval(attrs.xpsuiSchema);

					// store
					var dataset = datafactory.createArrayDataset(
						schemaFragment.enum, 
						schemaFragment.enumTransCodes
					);
					

					if (!schemaFragment.enum) {
						throw "Schema fragment does not contain enum field";
					}
				}

				var ngModel = ctrls[0];

				ngModel.$render = function() {
					if (ngModel.$viewValue) {
						elm.text(dataset.store.getValueByKey(ngModel.$viewValue) || ngModel.$viewValue || '');
					} else {
						elm.text('');
					}
				};
			}
		};
	}]);

}(window.angular));