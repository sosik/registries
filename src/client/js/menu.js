angular.module('psui', [])
.directive('psuiAccordionElement', [function() {
	return {
		restrict: 'A',
		scope: true,
		compile: function(elm, attrs) {
			var titleHolder = angular.element('<a href="#" ng-click="titleClick()"></a>');
			if (attrs.title) {
				titleHolder.prepend('<span>' + attrs.title + '</span>');
			}

			if (attrs.iconClass) {
				titleHolder.prepend('<i class="'+attrs.iconClass+'"></i>');
			}

			elm.prepend(titleHolder);

			return function(scope, elm) {
				scope.accordion = {};
				scope.accordion.active = false;

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

