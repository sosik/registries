(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiArrayControlView', ['$compile', function($compile) {
		return {
			restrict: 'A',
			scope: {
				'ngModel' : '=',
				'xpsuiSchema' : '='
			},
			template: '<div ng-repeat="ae in ngModel">' 
				+ '<div psui-objectlink2-view ng-model="ae" xpsui-schema="xpsuiSchema.items"></div>' 
				//+ '<svf-special-note ng-model="ae"> </svf-special-note>' + 
			+ '</div>',
			link: function(scope, element, attrs, controller) {

			}
		};
	}]);

}(window.angular));