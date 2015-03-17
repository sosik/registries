(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiArrayControlView', ['$compile', function($compile) {

		var  objectLinkTemplate='<div ng-repeat="ae in ngModel track by $id(ae)">'

				+ '<div  xpsui-objectlink2-edit xpsui-validity-mark xpsui-schema="xpsuiSchema.items" ng-model="ngModel[$index]"></div>'
				+ '</div>';
				// + '<button ng-click="appendNew();"><i></i>{{"generic.search.add" | translate}}</button>';

		var  uploadablefileTemplate='<div ng-repeat="ae in ngModel track by $id(ae)" class="xpsui-uploadable-file-view">'
					+ '<div  xpsui-uploadable-file xpsui-validity-mark '
					+ '   xpsui-schema="xpsuiSchema.items" '
					+ '   ng-model="ngModel[$index]"></div>'
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

				element.html(getTemplate(attrs.xpsuiArrayControlView));
				$compile(element.contents())(scope);


				var modelChanged = function() {
					console.log('model changed', scope.ngModel);
				};

				scope.$watchCollection('ngModel', modelChanged);


			}

		};
	}]);

}(window.angular));
