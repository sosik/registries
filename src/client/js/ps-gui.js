angular.module('ps-gui', [])
.directive('psGuiButton', ['$http', function($http) {
	return {
		restrict: 'E',
		link: function($scope, $element, $attrs, controller) {
			if ($attrs.psGuiIcon) {
				$http({method: 'GET', url: $attrs.psGuiIcon})
				.success(function(data, status, headers, config) {
						$element.prepend('<span class="ps-gui-button-glyph">' + data + '</span>');
						$element.addClass('ps-gui ps-gui-button');
				});
			}
		}
	};
}])
.directive('psGuiSelectable', ['$http', function($http) {
	return {
		restrict: 'A',
		scope: {
			selected: '=psGuiSelectable',
			onToggle: '=psGuiOnToggle'
			},
		link: function($scope, $element, $attrs, controller) {
			var doToggle = function() {
				if ($scope.selected) {
					$element.removeClass('ps-gui-selected');
					$scope.selected = false;
				} else {
					$element.addClass('ps-gui-selected');
					$scope.selected = true;
				}
				($scope.onToggle || angular.noop)();
			};

			$element.on('click', doToggle);
			$scope.$on('$destroy', function(evt) {
				$element.off('click', doToggle);
			});
		}
	};
}])
.directive('psGuiInplaceEdit', ['$compile', '$timeout', function($compile, $timeout) {
	return {
		restrict: 'A',
		scope: {
			'mode': '=psGuiInplaceEdit',
			'ngBind': '@',
			'ngModel': '@'
		},
		link: function(scope, element, attrs, controller) {
			element.wrap('<div class="ps-gui ps-gui-inplace-edit-wrapper"></div>');
			var buttonsPlaceholder = angular.element('<div class="ps-gui-inplace-edit-buttons-placeholder"></div>');
			element.parent().append(buttonsPlaceholder);
			var buttonsHolder = angular.element('<div class="ps-gui-inplace-edit-buttons-holder"></div>');
			buttonsPlaceholder.append(buttonsHolder);

			var editButton = angular.element('<ps-gui-button class="ps-gui-inplace-edit-button ps-gui-inplace-edit-buttons ps-gui-hidden" ps-gui-icon="img/iconmonstr-pencil-9-icon.svg"></ps-gui-button>');
			var okButton = angular.element('<ps-gui-button class="ps-gui-inplace-edit-button ps-gui-inplace-edit-buttons ps-gui-hidden" ps-gui-icon="img/iconmonstr-check-mark-6-icon.svg"></ps-gui-button>');
			var cancelButton = angular.element('<ps-gui-button class="ps-gui-inplace-edit-button ps-gui-inplace-edit-buttons ps-gui-hidden" ps-gui-icon="img/iconmonstr-x-mark-5-icon.svg"></ps-gui-button>');
			$compile(editButton)(scope);
			$compile(okButton)(scope);
			$compile(cancelButton)(scope);
			buttonsHolder.append(editButton).append(okButton).append(cancelButton);

			var editHideTimeout;
			var editOn = function(evt) {
				$timeout.cancel(editHideTimeout);
				editButton.removeClass('ps-gui-hidden');
				element.addClass('on-edit');
			};

			var editOff = function(evt) {
				$timeout.cancel(editHideTimeout);
				editHideTimeout = $timeout(function() {
					editButton.addClass('ps-gui-hidden');
					element.removeClass('on-edit');
				},1000);
			};

			element.on('mouseenter', editOn);
			element.on('mouseleave', editOff);
			editButton.on('mouseenter', editOn);
			editButton.on('mouseleave', editOff);

		}
	};
}]);
