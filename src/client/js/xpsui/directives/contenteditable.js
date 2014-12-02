(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiContenteditable', ['xpsui:logging', '$compile', '$animate', '$timeout', function(log, $compile, $animate, $timeout) {
		return {
			restrict: 'A',
			require: ['ngModel'],
			link: function(scope, elm, attrs, ctrls) {
				log.group('contenteditable Link');
				var ngModel = ctrls[0];

				elm.addClass('x-contenteditable');

				var buttonsHolder = angular.element('<div class="x-contenteditable-buttons-holder x-zero-height"></div>');
				var content = angular.element('<div class="x-contenteditable-content" contenteditable="true"><div>');

				ngModel.$render = function() {
					if (typeof ngModel.$viewValue === 'string' ) {	
						content.html(ngModel.$viewValue || '');
					} else {
						content.html('');
					}
				};

				var commitData = function() {
					ngModel.$setViewValue(content.html());
				};

				
				elm.append(buttonsHolder);
				elm.append(content);


				var buttonLeft = angular.element('<button class="x-contenteditable-left"></button>');
				var buttonCenter = angular.element('<button class="x-contenteditable-center"></button>');
				var buttonRight = angular.element('<button class="x-contenteditable-right"></button>');
				var buttonJustify = angular.element('<button class="x-contenteditable-justify"></button>');
				var buttonBold = angular.element('<button class="x-contenteditable-bold"></button>');
				var buttonItalic = angular.element('<button class="x-contenteditable-italic"></button>');
				var buttonRemoveFormat = angular.element('<button class="x-contenteditable-remove-format"></button>');

				var buttonLink = angular.element('<button class="x-contenteditable-link"></button>');
				var buttonImage = angular.element('<button class="x-contenteditable-image"></button>');
				var buttonUndo = angular.element('<button class="x-contenteditable-undo"></button>');
				var buttonRedo = angular.element('<button class="x-contenteditable-redo"></button>');
				var buttonRemoveHeading = angular.element('<button class="x-contenteditable-h">0</button>');
				var buttonH1 = angular.element('<button class="x-contenteditable-h">1</button>');
				var buttonH2 = angular.element('<button class="x-contenteditable-h">2</button>');
				var buttonH3 = angular.element('<button class="x-contenteditable-h">3</button>');
				var buttonOL = angular.element('<button class="x-contenteditable-ol"></button>');
				var buttonUL = angular.element('<button class="x-contenteditable-ul"></button>');
				var buttonOutdent = angular.element('<button class="x-contenteditable-outdent"></button>');
				var buttonIndent = angular.element('<button class="x-contenteditable-indent"></button>');
				var buttonTable = angular.element('<button class="x-contenteditable-table"></button>');

				buttonsHolder.append(buttonLeft);
				buttonsHolder.append(buttonCenter);
				buttonsHolder.append(buttonRight);
				buttonsHolder.append(buttonJustify);
				buttonsHolder.append(buttonBold);
				buttonsHolder.append(buttonItalic);
				buttonsHolder.append(buttonRemoveFormat);

				buttonsHolder.append(buttonLink);
				buttonsHolder.append(buttonImage);
				buttonsHolder.append(buttonUndo);
				buttonsHolder.append(buttonRedo);
				buttonsHolder.append(buttonRemoveHeading);
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
						document.execCommand('insertHTML', false, '<img xpsui-contenteditable/>');
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
					document.execCommand('undo', false, null);
				});

				buttonRedo.on('click', function(evt) {
					document.execCommand('redo', false, null);
				});

				buttonH1.on('click', function(evt) {
					document.execCommand('formatBlock', false, "H1");
				});

				buttonH2.on('click', function(evt) {
					document.execCommand('formatBlock', false, "H2");
				});

				buttonH3.on('click', function(evt) {
					document.execCommand('formatBlock', false, "H3");
				});

				buttonOL.on('click', function(evt) {
					document.execCommand('insertOrderedList', false, null);
				});

				buttonUL.on('click', function(evt) {
					document.execCommand('insertUnorderedList', false, null);
				});

				buttonOutdent.on('click', function(evt) {
					document.execCommand('outdent', false, null);
				});

				buttonIndent.on('click', function(evt) {
					document.execCommand('indent', false, null);
				});

				function pasteHtmlAtCaret(html, selectPastedContent) {
					var sel, range;
					if (window.getSelection) {
						// IE9 and non-IE
						sel = window.getSelection();
						if (sel.getRangeAt && sel.rangeCount) {
							range = sel.getRangeAt(0);
							range.deleteContents();

							// Range.createContextualFragment() would be useful here but is
							// only relatively recently standardized and is not supported in
							// some browsers (IE9, for one)
							var el = document.createElement("div");
							el.innerHTML = html;
							var frag = document.createDocumentFragment(), node, lastNode;
							while ( (node = el.firstChild) ) {
								lastNode = frag.appendChild(node);
							}
							var firstNode = frag.firstChild;
							range.insertNode(frag);

							// Preserve the selection
							if (lastNode) {
								range = range.cloneRange();
								range.setStartAfter(lastNode);
								if (selectPastedContent) {
									range.setStartBefore(firstNode);
								} else {
									range.collapse(true);
								}
								sel.removeAllRanges();
								sel.addRange(range);
							}
						}
					} else if ( (sel = document.selection) && sel.type != "Control") {
						// IE < 9
						var originalRange = sel.createRange();
						originalRange.collapse(true);
						sel.createRange().pasteHTML(html);
						if (selectPastedContent) {
							range = sel.createRange();
							range.setEndPoint("StartToStart", originalRange);
							range.select();
						}
					}
				}

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


						pasteHtmlAtCaret(table[0].outerHTML, content);

					}
				});

				var buttonsHide = function() {
					buttonsHolder.addClass('x-zero-height');
					console.log('dddd');
				};

				var buttonsShow = function() {
					buttonsHolder.removeClass('x-zero-height');
				};

				var buttonsHideTimeout = $timeout(buttonsHide, 5000, false);

				elm.on('mousemove', function(evt) {
					$timeout.cancel(buttonsHideTimeout);
					buttonsHideTimeout = null;
					buttonsHolder.removeClass('x-zero-height');
					buttonsHideTimeout = $timeout(buttonsHide, 5000, false);
				});

				content.on('blur keyup', function(evt) {
					scope.$apply(commitData);
				});

				content.on('mouseup keyup', function(evt){
					var ua = window.navigator.userAgent;
					var msie = ua.indexOf('MSIE ');
					var trident = ua.indexOf('Trident/');
					if (!(msie > 0 || trident > 0)) {
						var htmlNodes = rangy.getSelection();

						var htmlElements = [];
						if (!htmlNodes.containsNode(content[0],false)){
							htmlNodes = htmlNodes.getAllRanges();
							if (htmlNodes.length > 0){
								htmlNodes = htmlNodes[0].startContainer;
								while (htmlNodes != content[0] && htmlNodes.parentElement != content[0]){
									htmlNodes = htmlNodes.parentElement;
									if (htmlNodes.getAttribute('align')){
										htmlElements.push(htmlNodes.getAttribute('align'));

									}else{
										htmlElements.push(htmlNodes.nodeName);
									}
								}
							}

							htmlNodes = rangy.getSelection().getAllRanges();
							var htmlElements2 = [];
							if (htmlNodes.length > 0){
								htmlNodes = htmlNodes[0].endContainer;
								while (htmlNodes != content[0] && htmlNodes.parentElement != content[0]){
									htmlNodes = htmlNodes.parentElement;
									if (htmlNodes.getAttribute('align')){
										htmlElements.push(htmlNodes.getAttribute('align'));

									}else if(getComputedStyle(htmlNodes).getPropertyValue('text-align')){

										htmlElements.push(getComputedStyle(htmlNodes).getPropertyValue('text-align'));

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

						if (isBold) {
							buttonBold.addClass("chosen");
						} else {
							buttonBold.removeClass("chosen");
						}

						if (isItalic) {
							buttonItalic.addClass("chosen");
						} else {
							buttonItalic.removeClass("chosen");
						}

						if (isH1) {
							buttonH1.addClass("chosen");
						} else {
							buttonH1.removeClass("chosen");
						}

						if (isH2) {
							buttonH2.addClass("chosen");
						} else {
							buttonH2.removeClass("chosen");
						}

						if (isH3) {
							buttonH3.addClass("chosen");
						} else {
							buttonH3.removeClass("chosen");
						}

						if (align === 0) {
							buttonLeft.addClass("chosen");
						} else {
							buttonLeft.removeClass("chosen");
						}

						if (align === 1) {
							buttonRight.addClass("chosen");
						} else {
							buttonRight.removeClass("chosen");
						}

						if (align === 2) {
							buttonCenter.addClass("chosen");
						} else {
							buttonCenter.removeClass("chosen");
						}

						if (align === 3) {
							buttonJustify.addClass("chosen");
						} else {
							buttonJustify.removeClass("chosen");
						}

						if (isOL) {
							buttonOL.addClass("chosen");
						} else {
							buttonOL.removeClass("chosen");
						}

						if (isUL) {
							buttonUL.addClass("chosen");
						} else {
							buttonUL.removeClass("chosen");
						}

						if (isTable) {
							buttonTable.addClass("chosen");
						} else {
							buttonTable.removeClass("chosen");
						}
					}
				});

				//commitData();

				log.groupEnd();
			}
		};
	}]);
}(window.angular));
