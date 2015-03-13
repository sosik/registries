(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiArrayControlEdit', ['$compile', function($compile) {
		return {
			restrict: 'A',
			scope: {
				'ngModel' : '=',
				'xpsuiSchema' : '='
			},
			template: '<div ng-repeat="ae in ngModel track by $id(ae)">'
				+ '<button class="btn-clear btn-floating" ng-click="removeByIndex($index);" >' 
					+ '<i class="icon-minus"></i> {{\'generic.search.remove\' | translate}}'
				+ '</button>' 
				+ '<div class="cancel-button-space-left">'
					+ '<div xpsui-objectlink2-edit xpsui-validity-mark xpsui-schema="xpsuiSchema.items" ng-model="ngModel[$index]"></div>'
				+ '</div>'
			+ '</div>'
			+ '<div class="pull-right">'
				+ '<button ng-click="appendNew();" class="btn-clear"><i class="icon-add"></i> {{\'generic.search.add\' | translate}}</button>'
			+ '</div>',
			link: function(scope, element, attrs, controller) {
				console.log(scope.psuiModel);
				console.log(scope.xpsuiSchema);

				var modelChanged = function() {
					console.log('model changed', scope.ngModel);
				};

				scope.$watchCollection('ngModel', modelChanged);

				scope.removeByIndex = function(idx) {
					scope.ngModel.splice(idx,1);
				};

				scope.appendNew = function() {
					if(!(scope.ngModel instanceof Array)){
						scope.ngModel = [];
					}
					scope.ngModel.push({});
				};

			}
		};
	}]);

}(window.angular));