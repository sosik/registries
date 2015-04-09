(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiArrayControlEdit', ['$compile', function($compile) {

		var  objectLinkTemplate='<div ng-repeat="ae in ngModel track by $id(ae)">'
				+ ' <div class="x-array-control-item">'
				+ '  <div  xpsui-objectlink2-edit xpsui-validity-mark xpsui-schema="xpsuiSchema.items" ng-model="ngModel[$index]"></div>'
				+ '  <button ng-click="removeByIndex($index);" class="btn-clear floating">'
				+ '   <i class="icon-minus"></i> {{\'generic.search.remove\' | translate}}'
				+ '  </button>'
				+ ' </div>'
				+ '</div>'
				+ '<div class="pull-right">'
				+ '<button ng-click="appendNew();" class="btn-clear"><i class="icon-add"></i> {{"generic.search.add" | translate}}</button>'
				+ '</div>';

		var uploadablefileTemplate = '<div ng-repeat="ae in ngModel track by $id(ae)" class="xpsui-uploadable-file-edit">'
						+ ' <div class="psui-attachment-remove">'
						+ '  <button ng-click="removeByIndex($index);" class="btn-clear">'
						+ '   <i class="icon-remove"></i> {{\'generic.search.remove\' | translate}}'
						+ '  </button>'
						+ ' </div>'
						+ '<div xpsui-uploadable-file xpsui-validity-mark class="xpsui-uploadable-file-edit-item"'
						+ '     xpsui-schema="xpsuiSchema.items" ng-model="ngModel[$index]"> '
						+ '</div>'
						+ '</div>'
						+ '<div class="pull-right clear">'
						+ '<button ng-click="appendNew();" class="btn-clear"><i class="icon-add"></i> {{"generic.search.add"| translate}}</button>'
						+ '</div>';

		function getTemplate(renderComponent) {
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

				function isEmptyObj(obj) {
					if (!obj) {
						return true;
					}

					for (var key in obj) {
						if (key && key.indexOf('$') != 0
								&& obj.hasOwnProperty(key)) {
							return false;
						}
					}
		            return true;
				}

				scope.appendNew = function() {
					if (!(scope.ngModel instanceof Array)) {
						scope.ngModel = [];
					}
					if ((scope.ngModel instanceof Array)
							&& (scope.ngModel.length == 0 
									|| !isEmptyObj(scope.ngModel[scope.ngModel.length-1]))) {
						scope.ngModel.push({});
					}
				};

			}

		};
	}]);

}(window.angular));
