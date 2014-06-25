angular.module('psui-validity-mark', [])
.directive('psuiValidityMark', ['$compile', function($compile) {
	return {
		restrict: 'A',
		require: ['^ngModel', '^form'],
		link: function(scope, elm, attrs, controller) {
			var wrapper;

			var ngModel = null;
			if (controller[0]) {
				ngModel = controller[0];
			}

			// create base html elements
			if (elm.parent().hasClass('psui-wrapper')) {
				// element is wrapped, we are going to use this wrapper
				wrapper = elm.parent();
			} else {
				// there is no wrapper, we have to create one
				wrapper = angular.element('<span class="psui-wrapper"></span>');
				elm.wrap(wrapper);
			}

			// check it there is psui-buttons-holder
			var wrapperChildren = wrapper.children();
			var actionsHolder = null;
			for (var i = 0; i<wrapperChildren.length; i++) {
				if (angular.element(wrapperChildren[i]).hasClass('psui-actions-holder')) {
					actionsHolder = wrapperChildren[i];
				}
			}

			if (!actionsHolder) {
				console.log('No button holder');
				actionsHolder = angular.element('<span class="psui-actions-holder"></span>');
				wrapper.append(actionsHolder);
			}

			var validationMark = angular.element('<span class="psui-btn psui-validation-mark"><i></i><span>error</span></span>');
			validationMark.addClass('psui-hidden');

			wrapper.prepend(validationMark);

			var errors = angular.element('<div class="psui-errors"><div>');
			errors.addClass('psui-hidden');
			validationMark.append(errors);
			validationMark.on('mouseover', function(evt) {
				errors.removeClass('psui-hidden');
			});
			validationMark.on('mouseleave', function(evt) {
				errors.addClass('psui-hidden');
			});

			if (ngModel) {
				scope.$watch(function(scope) {return ngModel.$invalid;}, function(nv, ov) {
					if (nv) {
						validationMark.addClass('ng-invalid');
						validationMark.removeClass('psui-hidden');
					} else {
						validationMark.removeClass('ng-invalid');
						validationMark.addClass('psui-hidden');
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
					errors.empty();
					for (e in nv) {
						if (nv[e]) {
							errors.append('<div class="psui-error">{{\'errors.validation.'+e+'\'|translate}}</div>');
						}
					}

					$compile(errors)(scope);
				});
			}

			if (controller[1]) {
				var form = controller[1];

				scope.$watch(function() {return form.psui.submitPrepare}, function(newVal) {
					if (newVal === true) {
						ngModel.$setViewValue(ngModel.$modelValue);
					}
				});
			}
		}
	}
}])
