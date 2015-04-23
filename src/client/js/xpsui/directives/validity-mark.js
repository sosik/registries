(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiValidityMark', ['$compile', function($compile) {
		return {
			restrict: 'A',
			require: ['^ngModel', '^form','^?xpsuiInlineedit'],
			link: function(scope, elm, attrs, controller) {
				var wrapper = elm;

				var ngModel = null;
				if (controller[0]) {
					ngModel = controller[0];
				}
				var inlineEditCtrl = controller[2];

				var validationMark = angular.element('<span class="xpsui-btn xpsui-validation-mark"><i></i><span>error</span></span>');
				validationMark.addClass('x-hidden');

				wrapper.prepend(validationMark);

				var errors = angular.element('<div class="xpsui-errors"><div>');
				errors.addClass('x-hidden');
				validationMark.append(errors);
				validationMark.on('mouseover', function(evt) {
					errors.removeClass('x-hidden');
				});
				validationMark.on('mouseleave', function(evt) {
					errors.addClass('x-hidden');
				});

				validationMark.on('touchstart',function(evt){
					errors.removeClass('x-hidden')
					evt.preventDefault();
					return false;
				})
				
				validationMark.on('touchend',function(evt){
					errors.addClass('x-hidden');
					evt.preventDefault();
					return false;
				})


				if (ngModel) {
					scope.$watch(function(scope) {return ngModel.$invalid;}, function(nv, ov) {
						if (nv) {
							validationMark.addClass('ng-invalid');
							validationMark.removeClass('x-hidden');
							inlineEditCtrl && inlineEditCtrl.hideCommitButton();
						} else {
							validationMark.removeClass('ng-invalid');
							validationMark.addClass('x-hidden');
							inlineEditCtrl && inlineEditCtrl.showCommitButton();
						}
					});

					scope.$watch(function(scope) {return ngModel.$pristine;}, function(nv, ov) {
						if (nv) {
							validationMark.addClass('ng-pristine');
						} else {
							validationMark.removeClass('ng-pristine');
						}
					});

					scope.$watchCollection(function(scope) {return ngModel.$error;}, function(nv, ov) {
						var e;
						errors.empty();
						for (e in nv) {
							if (nv[e]) {
								errors.append('<div class="xpsui-error">{{\'errors.validation.'+e+'\'|translate}}</div>');
							}
						}

						$compile(errors)(scope);
					});
				}

				if (controller[1]) {
					var form = controller[1];

					scope.$watch(function() {return form.xpsui.submitPrepare}, function(newVal) {
						if (newVal === true) {
							var ngVal = ngModel.$modelValue;
							if (angular.isObject(ngVal) && Object.getOwnPropertyNames(ngVal).length == 0) {
								ngModel.$setViewValue("");
							} else {
								ngModel.$setViewValue(ngModel.$modelValue);
							}
						}
					});
				}

			}
		}
	}]);

}(window.angular));
