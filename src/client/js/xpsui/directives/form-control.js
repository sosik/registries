(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiFormControl', ['xpsui:logging', function(log) {
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

				// Check if this field is calculation
				var schema = scope.$eval(attrs.xpsuiSchema);
				if (schema.calculation && form) {
					log.debug("Registering calculation");
					// Register calculation using the form controller
					var unregister = form.registerCalculation(attrs.xpsuiModel, schema.calculation);
					// Deregister calculation on $destroy
					scope.$on('destroy', unregister);
				}

			}
		};
	}]);

}(window.angular));


