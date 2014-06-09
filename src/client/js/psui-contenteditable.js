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

			var buttonCenter = angular.element('<button>Center</button>');
			var buttonLeft = angular.element('<button>Left</button>');
			var buttonRight = angular.element('<button>Right</button>');
			var buttonJustify = angular.element('<button>Justify</button>');
			var buttonBold = angular.element('<button><b>Bold</b></button>');
			var buttonItalic = angular.element('<button><i>Italic</i></button>');
			var buttonRemoveFormat = angular.element('<button>Remove format</button>');
			var buttonRemoveHeading = angular.element('<button>Remove heading</button>');
			var buttonLink = angular.element('<button>Link</button>');
			var buttonImage = angular.element('<button>Image</button>');
			var buttonUndo = angular.element('<button>Undo</button>');
			var buttonRedo = angular.element('<button>Redo</button>');
			var buttonH1 = angular.element('<button>H1</button>');
			var buttonH2 = angular.element('<button>H2</button>');
			var buttonH3 = angular.element('<button>H3</button>');

			buttonsHolder.append(buttonCenter);
			buttonsHolder.append(buttonLeft);
			buttonsHolder.append(buttonRight);
			buttonsHolder.append(buttonJustify);
			buttonsHolder.append(buttonBold);
			buttonsHolder.append(buttonItalic);
			buttonsHolder.append(buttonRemoveFormat);
			buttonsHolder.append(buttonRemoveHeading);
			buttonsHolder.append(buttonLink);
			buttonsHolder.append(buttonImage);
			buttonsHolder.append(buttonUndo);
			buttonsHolder.append(buttonRedo);
			buttonsHolder.append(buttonH1);
			buttonsHolder.append(buttonH2);
			buttonsHolder.append(buttonH3);

			buttonCenter.on('click', function(evt) {
				document.execCommand('justifyCenter', false, null);
			});
			
			buttonLeft.on('click', function(evt) {
				document.execCommand('justifyLeft', false, null);
				//var htmlNodes = rangy.getSelection().getRangeAt(0).getNodes([1]);
				var htmlNodes = rangy.getSelection().getAllRanges();
				console.log(htmlNodes);
				console.log(rangy.getSelection())
				
			});
			
			buttonRight.on('click', function(evt) {
				document.execCommand('justifyRight', false, null);
			});
			
			buttonJustify.on('click', function(evt) {
				document.execCommand('justifyFull', false, null);
			});
			
			buttonBold.on('click', function(evt) {
				document.execCommand('bold', false, null);
			});

			buttonItalic.on('click', function(evt) {
				document.execCommand('italic', false, null);
			});

			buttonRemoveFormat.on('click', function(evt) {
				document.execCommand('removeFormat', false, null);
			});
			
			buttonRemoveHeading.on('click', function(evt) {
				document.execCommand('formatBlock', false, 'div');
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
			
			buttonUndo.on('click', function(evt) {
				document.execCommand('undo', false, null)
			});
			
			buttonRedo.on('click', function(evt) {
				document.execCommand('redo', false, null)
			});
			
			buttonH1.on('click', function(evt) {
				document.execCommand('formatBlock', false, "H1")
			});
			
			buttonH2.on('click', function(evt) {
				document.execCommand('formatBlock', false, "H2")
			});
			
			buttonH3.on('click', function(evt) {
				document.execCommand('formatBlock', false, "H3")
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
