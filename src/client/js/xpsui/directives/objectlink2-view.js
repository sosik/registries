(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiObjectlink2View', ['xpsui:logging', 'xpsui:Objectlink2Factory','xpsui:SelectDataFactory', 
	function(log, objectlink2Factory, selectDataFactory) {
		return {
			restrict: 'A',
			require: ['ngModel'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('String view Link');

				var ngModel = ctrls[0],
					view = angular.element('<div></div>'),
					schemaFragment = elm.data('schemaFragment')
				;

				elm.addClass('x-control');
				elm.addClass('x-objectlink2-view');

				elm.append(view);
				
				ngModel.$render = function() {
					view.empty();

					if (ngModel.$viewValue) {

						if (ngModel.$viewValue.refdata) {
							for (var i in ngModel.$viewValue.refdata) {
								var fieldSchemaFragment = selectDataFactory.getFieldSchemaFragment(
										schemaFragment.objectlink2.schema, schemaFragment.objectlink2.fields[i], scope
									),
									type = fieldSchemaFragment.type,
									label = fieldSchemaFragment.title,
									value = ngModel.$viewValue.refdata[i]
								;

								view.append(
									angular.element('<span title="' + label + '">' 
										+ objectlink2Factory.getFormatedValue(type,value) 
										+ '</span>'
									)
								);
							}
						}
					}
				};
			}
		};
	}]);

}(window.angular));
