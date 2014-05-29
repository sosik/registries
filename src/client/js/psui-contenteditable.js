'use strict';

angular.module('psui-contenteditable', [])
.directive('psuiContenteditable', ['$timeout', function ($timeout) {
	return {
		restrict: 'AE',
		require: ['?ngModel'],
		link: function(scope, elm, attrs, ctrls) {

			var ngModel = null;
			if (ctrls && ctrls[0]) {
				ngModel = ctrls[0];
			}

			// use empty function to commit data, it will be overriden if there is ngModel
			var commitData = function() {
			}

			if (ngModel) {
				ngModel.$render = function() {
					elm.html(ngModel.$viewValue || '');
				};

				commitData = function() {
					ngModel.$setViewValue(elm.html());
				}
			}

			var wrapper;

			// create base html elements
			if (elm.parent().hasClass('psui-wrapper')) {
				// element is wrapped, we are going to use this wrapper
				wrapper = elm.parent;
			} else {
				// there is no wrapper, we have to create one
				wrapper = angular.element('<div class="psui-wrapper"></div>');
				elm.wrap(wrapper);
			}

			elm.addClass('psui-contenteditable');
			elm.attr('contenteditable', '');

			var buttonsHolder = angular.element('<div class="psui-buttons-holder"></div>');
			wrapper.append(buttonsHolder);

			var buttonBold = angular.element('<button><b>Bold</b></button>');
			var buttonItalic = angular.element('<button><i>Italic</i></button>');
			var buttonRemoveFormat = angular.element('<button>Remove format</button>');
			var buttonLink = angular.element('<button>Link</button>');
			var buttonImage = angular.element('<button>Image</button>');

			buttonsHolder.append(buttonBold);
			buttonsHolder.append(buttonItalic);
			buttonsHolder.append(buttonRemoveFormat);
			buttonsHolder.append(buttonLink);
			buttonsHolder.append(buttonImage);

			buttonBold.on('click', function(evt) {
				document.execCommand('bold', false, null);
			});

			buttonItalic.on('click', function(evt) {
				document.execCommand('italic', false, null);
			});

			buttonRemoveFormat.on('click', function(evt) {
				document.execCommand('removeFormat', false, null);
			});

			buttonImage.on('click', function(evt) {
				//TODO propper image url selection dialog
				//TODO handle if image is already selected, we should edit it instead inserting one
				var url = prompt('Please enter URL');

				if (url) {
					document.execCommand('insertImage', false, url);
				}
			});

			buttonLink.on('click', function(evt) {
				//TODO proper link url selection dialog
				//TODO handle if link is already selected, we should edit it instead inserting one
				var url = prompt('Please enter URL');

				if (url) {
					document.execCommand('createLink', false, url);
				}
			});

			var buttonsHide = function() {
				buttonsHolder.addClass('psui-hidden');
			};

			var buttonsShow = function() {
				buttonsHolder.removeClass('psui-hidden');
			};

			var buttonsHideTimeout = $timeout(buttonsHide, 5000, false);

			elm.on('mousemove', function(evt) {
				$timeout.cancel(buttonsHideTimeout);
				buttonsHideTimeout = null;
				buttonsHolder.removeClass('psui-hidden');
				buttonsHideTimeout = $timeout(buttonsHide, 5000, false);
			});

			elm.on('blur keyup', function(evt) {
				scope.$apply(commitData);
			});

			commitData();
		}
	};
}]);
