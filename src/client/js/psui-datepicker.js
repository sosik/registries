'use strict';

angular.module('psui-datepicker', ['psui'])
.directive('psuiDatepicker', ['psui.dropdownFactory', function (dropdownFactory) {
	return {
		restrict: 'A',
		scope: {
			psuiOptions: "=?",
			ngModel: "=?"
		},
		require: ['?psuiOptions', '?ngModel'],
		link: function(scope, elm, attrs, ctrls) {
			console.log(elm);
		}
	}
}])