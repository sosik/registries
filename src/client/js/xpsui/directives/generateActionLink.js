(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiFormGenerateActionLink', ['xpsui:SchemaUtil',
			function(schemaUtilFactory) {
		return {
			restrict: 'A',
			link: function(scope, elm, attrs, ctrls) {
				var options = scope.$eval(attrs.psuiOptions);
				var modelPath = scope.$eval(attrs.psuiModel);

				elm.append('<span>'+(options.title)+'</span>');

				scope.$watch(attrs.psuiModel+'.id', function(nv, ov) {
					if (nv) {
						attrs.$set('href', '/#/registry/generated/' + schemaUtilFactory.encodeUri(options.schemaFrom)+ '/' +nv+ '/' +options.generateBy+'/'+options.template);
					}
				});

			}
		};
	}]);

}(window.angular));
