angular.module('psui.form-ctrl', [])
.directive('psuiFormCtrl', [function() {
	return {
		restrict: 'A',
		require: ['^form'],
		controller: function() {
			var activeControl = {};

			this.getActiveControl = function() {
				return activeControl;
			};

			this.setActiveControl = function(elm) {
				activeControl = elm;
			};
		},
		link: function(scope, elm, attrs, ctrls) {
			var formController = ctrls[0];

			formController.psui = formController.psui || {
				submitPrepare: false,
				prepareForSubmit: function() {
					formController.psui.submitPrepare = true;
				}
			};

/*
			// name is defined, so lets create psui structure in scope
			if (attrs.name) {
				scope[attrs.name] = scope[attrs.name] || {};
				scope.name.psui = scope.name.psui || {};
				scope.name.psui.submitPrepare = scope.psui.submitPrepare || false;

				scope.$watch(scope.name.psui.submitPrepare, function(newVal, oldVal) {
					if (newVal === true) {
						formController.psui.prepareForSubmit();
					}
				});
			}
*/		}
	};
}]);
