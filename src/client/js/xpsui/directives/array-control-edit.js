(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiArrayControlEdit', ['$compile', function($compile) {

		var  objectLinkTemplate='<div ng-repeat="ae in ngModel track by $id(ae)">'
				+ '<button ng-click="removeByIndex($index);">'
				+ '<i class="icon-minus"></i>{{\'generic.search.remove\' | translate}}'
				+ '</button>'
				+ '<div  xpsui-objectlink2-edit xpsui-validity-mark xpsui-schema="xpsuiSchema.items" ng-model="ngModel[$index]"></div>'
				+ '</div>'
				+ '<div class="pull-right">'
				+ '<button ng-click="appendNew();"><i class="icon-add"></i>{{"generic.search.add" | translate}}</button>'
				+ '</div>';

		var  uploadablefileTemplate='<div ng-repeat="ae in ngModel track by $id(ae)">'
						+ '<button ng-click="removeByIndex($index);">'
						+ '<i></i>{{\'generic.search.remove\' | translate}}'
						+ '</button>'
						+ '<div  xpsui-uploadable-file xpsui-validity-mark xpsui-schema="xpsuiSchema.items" ng-model="ngModel[$index]"></div>'
						+ '</div>'
						+ '<div class="pull-right">'
						+ '<button ng-click="appendNew();"><i class="icon-add"></i>{{"generic.search.add"| translate}}</button>'
						+ '</div>';

		function getTemplate(renderComponent){
			return (renderComponent==="xpsui-uploadable-file")?uploadablefileTemplate:objectLinkTemplate;
		}

		return {
			restrict: 'A',
			scope: {
				'ngModel' : '=',
				'xpsuiSchema' : '='
			},

				link: function(scope, element, attrs, controller) {
				console.log(scope.psuiModel);
				console.log(scope.xpsuiSchema);

				element.html(getTemplate(attrs.xpsuiArrayControlEdit));
				$compile(element.contents())(scope);


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
