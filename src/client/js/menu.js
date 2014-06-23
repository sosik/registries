angular.module('psui', [])
.directive('psuiAccordionElement', [function() {

	return {
		restrict: 'A',
		scope: true,
		compile: function(elm, attrs) {
			var titleHolder = angular.element('<a href="#" ng-click="titleClick()"></a>');

			var titleElm = angular.element('<span></span>');

			if (attrs.title) {
				titleHolder.prepend(titleElm);
			}

			if (attrs.iconClass) {
				titleHolder.prepend('<i class="'+attrs.iconClass+'"></i>');
			}

			elm.prepend(titleHolder);

			return function(scope, elm, attrs) {
				scope.accordion = {};
				scope.accordion.active = false;

				if (attrs.title) {
					titleElm.text(attrs.title);
					attrs.$observe('title', function(newVal) {
						titleElm.text(newVal);
					});
				}

				var toggleActivity = function() {
					if (scope.accordion.active) {
						elm.removeClass('psui-accordion-active');
						scope.accordion.active = false;
					} else {
						elm.addClass('psui-accordion-active');
						scope.accordion.active = true;
					}
				};

				if (scope.accordion.active) {
						elm.addClass('psui-accordion-active');
				}

				scope.titleClick = function(evt) {
					toggleActivity();
					evt.preventDefault();
				};
			};
		},
	};
}]);

