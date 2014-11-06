(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiStringEdit', ['xpsui:logging', function(log) {
		return {
			restrict: 'A',
			require: ['ngModel', '?^xpsuiFormControl'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('String edit Link');

				var ngModel = ctrls[0];
				var formControl = ctrls[1] || {};

				var input = angular.element('<input></input>');

				elm.addClass('x-control');
				elm.addClass('x-string-edit');

				ngModel.$render = function() {
					input.val(ngModel.$viewValue || '');
					formControl.oldValue = ngModel.$modelValue;
				};

				elm.append(input);

				input.on('change', function(evt) {
					scope.$apply(function() {
						ngModel.$setViewValue(input.val());
					});
				});

				elm.bind('focus', function(evt) {
					input[0].focus();
				});

				log.groupEnd();
			}
		};
	}]);

}(window.angular));

