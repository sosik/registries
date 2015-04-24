(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiStringEdit', ['xpsui:logging', function(log) {
		return {
			restrict: 'A',
			require: ['ngModel', '?^xpsuiFormControl','xpsuiStringEdit'],
			controller: function($scope, $element, $attrs) {
				this.setup = function(){
					this.$input = angular.element('<input></input>');
				}
				
				this.getInput = function(){
					return this.$input;
				}

				this.$input = null;
				this.setup();
				
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('String edit Link');

				var ngModel = ctrls[0];
				var formControl = ctrls[1] || {};
				var selfControl = ctrls[2] || {};

				var input = selfControl.getInput();

				elm.addClass('x-control');
				elm.addClass('x-string-edit');

				ngModel.$render = function() {
					console.log('rendering..');
					input.val(ngModel.$viewValue || '');
					formControl.oldValue = ngModel.$modelValue;
				};

				elm.append(input);

				input.on('keyup', function(evt) {
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

