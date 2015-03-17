(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiObjectlink2View', ['xpsui:logging', 'xpsui:Objectlink2Factory','xpsui:SelectDataFactory', 'xpsui:SchemaUtil','$parse',
	function(log, objectlink2Factory, dataFactory, schemaUtil, $parse) {
		return {
			restrict: 'A',
			require: ['ngModel'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('String view Link');

				var ngModel = ctrls[0],
					view = angular.element('<div></div>'),
					parseSchemaFragment = $parse(attrs.xpsuiSchema),
					schemaFragment = parseSchemaFragment(scope)
				;

				elm.addClass('x-control');
				elm.addClass('x-objectlink2-view');

				elm.append(view);
				
				ngModel.$render = function() {
					view.empty();

					if (ngModel.$viewValue && 
						(ngModel.$viewValue.id || ngModel.$viewValue.oid)
					) {
						schemaUtil.getFieldsSchemaFragment(
							schemaFragment.objectLink2.schema, 
							schemaFragment.objectLink2.fields, 
							function(fields){
								objectlink2Factory.renderElement(
									view, 
									fields, 
									dataFactory.getObjectLinkData(
										schemaFragment.objectLink2, ngModel.$viewValue
									)
								);
							}
						);
					}
				};
			}
		};
	}]);

}(window.angular));
