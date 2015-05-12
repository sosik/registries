(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiRecordAction', ['xpsui:logging', 'xpsui:SchemaUtil', '$parse', '$injector', 'xpsui:NavigationService',
	function(log, schemaUtil, $parse, $injector, navS) {
		return {
			restrict: 'A',
			link: function(scope, elm, attrs, ctrls) {
				log.group('Record Action');

				var schemaParser = $parse(attrs.xpsuiSchema);
				var modelParser = $parse(attrs.xpsuiModel);

				//TODO observe attributes and update parsers

				elm.addClass('x-control');
				elm.addClass('x-record-action');

				elm.on('click', function(evt) {
					var schemaFragment = schemaParser(scope);
					var modelFragment = modelParser(scope);
				
					var ctx = {
						schema: schemaFragment,
						model: modelFragment
					};

					$injector.invoke(['xpsui:NavigationService', "$interpolate", '$location', function(navS, $interpolate, $location) {
						return function execute(ctx) {
							var navPath = $interpolate(ctx.schema.params.path)(ctx);
							navS.navigateToPath(navPath);
							attrs.$set('href', '/#' + navPath);
					   };
					}]) (ctx);

					scope.$apply();
				});

				log.groupEnd();
			}
		};
	}]);

}(window.angular));

