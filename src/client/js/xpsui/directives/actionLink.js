(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiFormActionLink', ['xpsui:SchemaUtil',
			function(schemaUtilFactory) {
		return {
			restrict: 'A',
			link: function(scope, elm, attrs, ctrls) {
				var options = scope.$eval(attrs.psuiOptions);
				var modelPath = scope.$eval(attrs.psuiModel);

				elm.append('<span>'+(options.title)+'</span>');

				scope.$watch(attrs.psuiModel+'.id', function(nv, ov) {
					if (nv) {
						attrs.$set('href', '/#/registry/custom/' + options.template + '/' + schemaUtilFactory.encodeUri(options.schema) + '/' +nv);
					}
				});

			}
		};
	}]);

}(window.angular));
