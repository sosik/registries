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
			var buttonOL = angular.element('<button>OL</button>');
			var buttonUL = angular.element('<button>UL</button>');
			var buttonOutdent = angular.element('<button>Outdent</button>');
			var buttonIndent = angular.element('<button>Indent</button>');
			var buttonTable = angular.element('<button>Table</button>');

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
			buttonsHolder.append(buttonOL);
			buttonsHolder.append(buttonUL);
			buttonsHolder.append(buttonOutdent);
			buttonsHolder.append(buttonIndent);
			buttonsHolder.append(buttonTable);

			buttonCenter.on('click', function(evt) {
				document.execCommand('justifyCenter', false, null);
			});
			
			buttonLeft.on('click', function(evt) {
				document.execCommand('justifyLeft', false, null);
				//var htmlNodes = rangy.getSelection().getRangeAt(0).getNodes([1]);
				
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
			
			buttonOL.on('click', function(evt) {
				document.execCommand('insertOrderedList', false, null)
			});
			
			buttonUL.on('click', function(evt) {
				document.execCommand('insertUnorderedList', false, null)
			});
			
			buttonOutdent.on('click', function(evt) {
				document.execCommand('outdent', false, null)
			});
			
			buttonIndent.on('click', function(evt) {
				document.execCommand('indent', false, null)
			});
			
			buttonTable.on('click', function(evt) {
				var rowstext = prompt("enter rows");
				var colstext = prompt("enter cols");
				var rows = parseInt(rowstext);
				var cols = parseInt(colstext);
				var table,tbody,tr,td,br;
				if ((rows > 0) && (cols > 0)) {
					table = angular.element("<table></table>");
					tbody = angular.element("<tbody></tbody>");
					for (var i = 0; i < rows; i++) {
						tr = angular.element("<tr></tr>");
						for (var j = 0; j < cols; j++) {
							td = angular.element("<td></td>");
							br = angular.element("</br>");
							td.append(br);
							tr.append(td);
						}
						tbody.append(tr);
					}
					table.append(tbody);
					//TODO create table at cursor position
					elm.append(table);
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
			
			elm.on('mouseup keyup', function(evt){
				var ua = window.navigator.userAgent;
				var msie = ua.indexOf('MSIE ');
				var trident = ua.indexOf('Trident/');
				if (!(msie > 0 || trident > 0)){
					var htmlNodes = rangy.getSelection();
					
					var htmlElements = [];
					if (!htmlNodes.containsNode(elm[0],false)){
						htmlNodes = htmlNodes.getAllRanges();
						if (htmlNodes.length > 0){
							htmlNodes = htmlNodes[0].startContainer;
							while (htmlNodes != elm[0] && htmlNodes.parentElement != elm[0]){
								htmlNodes = htmlNodes.parentElement;
								if (htmlNodes.getAttribute('align')){
									htmlElements.push(htmlNodes.getAttribute('align'));
									
								}else{
									htmlElements.push(htmlNodes.nodeName);
								}
							}
						}
						
						var htmlNodes = rangy.getSelection().getAllRanges();
						var htmlElements2 = [];
						if (htmlNodes.length > 0){
							htmlNodes = htmlNodes[0].endContainer;
							while (htmlNodes != elm[0] && htmlNodes.parentElement != elm[0]){
								htmlNodes = htmlNodes.parentElement;
								if (htmlNodes.getAttribute('align')){
									htmlElements.push(htmlNodes.getAttribute('align'));
									
								}else{
								htmlElements2.push(htmlNodes.nodeName);
								}
							}
						}
						
						htmlElements = htmlElements.concat(htmlElements2);
					}
					
					
					var isBold = false;
					var isItalic = false;
					var isH1 = false;
					var isH2 = false;
					var isH3 = false;
					var align = 0;
					var isOL = false;
					var isUL = false;
					var isTable = false;
					
					for (var i = 0; i < htmlElements.length; i++){
						
						if (htmlElements[i] == "B") {
							isBold = true;
						}
						if (htmlElements[i] == "I") {
							isItalic = true;
						}
						if (htmlElements[i] == "H1") {
							isH1 = true;
						}
						if (htmlElements[i] == "H2") {
							isH2 = true;
						}
						if (htmlElements[i] == "H3") {
							isH3 = true;
						}
						if (htmlElements[i] == "left") {
							align = 0;
						}
						if (htmlElements[i] == "right") {
							align = 1;
						}
						if (htmlElements[i] == "center") {
							align = 2;
						}
						if (htmlElements[i] == "justify") {
							align = 3;
						}
						if (htmlElements[i] == "OL") {
							isOL = true;
						}
						if (htmlElements[i] == "UL") {
							isUL = true;
						}
						if (htmlElements[i] == "TABLE") {
							isTable = true;
						}
					}
					
					if(isBold){
						buttonBold.addClass("chosen");
					}else{
						buttonBold.removeClass("chosen");
					}
					
					if(isItalic){
						buttonItalic.addClass("chosen");
					}else{
						buttonItalic.removeClass("chosen");
					}
					
					if(isH1){
						buttonH1.addClass("chosen");
					}else{
						buttonH1.removeClass("chosen");
					}
					
					if(isH2){
						buttonH2.addClass("chosen");
					}else{
						buttonH2.removeClass("chosen");
					}
					
					if(isH3){
						buttonH3.addClass("chosen");
					}else{
						buttonH3.removeClass("chosen");
					}
					
					if(align == 0){
						buttonLeft.addClass("chosen");
					}else{
						buttonLeft.removeClass("chosen");
					}
					
					if(align == 1){
						buttonRight.addClass("chosen");
					}else{
						buttonRight.removeClass("chosen");
					}
					
					if(align == 2){
						buttonCenter.addClass("chosen");
					}else{
						buttonCenter.removeClass("chosen");
					}
					
					if(align == 3){
						buttonJustify.addClass("chosen");
					}else{
						buttonJustify.removeClass("chosen");
					}
					
					if(isOL){
						buttonOL.addClass("chosen");
					}else{
						buttonOL.removeClass("chosen");
					}
					
					if(isUL){
						buttonUL.addClass("chosen");
					}else{
						buttonUL.removeClass("chosen");
					}
					
					if(isTable){
						buttonTable.addClass("chosen");
					}else{
						buttonTable.removeClass("chosen");
					}
				}	
			});
			
			commitData();
		}
	};
}]);
