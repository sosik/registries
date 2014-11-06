(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiFormControl', ['xpsui:logging', 'xpsui:FormGenerator', '$compile', function(log, formGenerator, $compile) {
		return {
			restrict: 'A',
			controller: function() {
				this.form = null;
				this.focusedElm = null;
				this.oldValue = null;

				this.acquireFocus = function(e) {
					return this.form.acquireFocus(e);
				};

				this.releaseFocus = function(e) {
					this.form.releaseFocus(e);
				};

				this.commit = function() {
				};

				this.rollback = function() {
				};

			},
			require: ['xpsuiFormControl', '^xpsuiForm', '?ngModel'],
			link: function(scope, elm, attrs, ctrls) {
				var formControl = ctrls[0];
				var form = ctrls[1];
				var ngModel = ctrls[2];

				formControl.form = form;
			}
		};
	}]);

}(window.angular));


