(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiImageresizor', ['$compile', '$translate', function ($compile, $translate) {
		return {
			restrict: 'A',
			require: ['?xpsuiUploadableImage'],
			link: function(scope, elm, attrs, ctrls) {
				var wrapper = elm;
				
				// // create base html elements
				// if (elm.parent().hasClass('psui-wrapper')) {
				// 	// element is wrapped, we are going to use this wrapper
				// 	wrapper = elm.parent();
				// } else {
				// 	// there is no wrapper, we have to create one
				// 	wrapper = angular.element('<div class="psui-wrapper"></div>');
				// 	elm.wrap(wrapper);
				// }
				
				elm.addClass('xpsui-imageresizor');
				
				var imgCtrl = ctrls[0];

				var resultImgWidth = attrs.psuiWidth || 0;
				var resultImgHeight = attrs.psuiHeight || 0;

				var imgWidth = attrs.psuiWidth || 0;
				var imgHeight = attrs.psuiHeight || 0;
				var resize = 1;
				var width = imgWidth*2;
				var height = imgHeight*2;
				var state = 0;
				var pomer;
				var x,y;
				var tmp;
				var difX = 0;
				var difY = 0;
				var originImgWidth;
				var originImgHeight;

				if (window.innerWidth < width) {
					var resizeRatio = (window.innerWidth/width);
					height = Math.round(height * resizeRatio);
					width = window.innerWidth;
					imgWidth = (attrs.psuiWidth || 0) * resizeRatio;
					imgHeight = (attrs.psuiHeight || 0) * resizeRatio;
				}
				console.log('Imageresizor width: ' + width + ' height: ' + height);

				var modalEl = angular.element('<div class="xpsui-imageresizor-resizor" ></div>');
				modalEl.addClass('x-modalview');
				wrapper.append(modalEl);
				
				var modalContentWrapperEl =  angular.element('<div></div>');
				modalContentWrapperEl.addClass('x-modalview-window');
				modalEl.append(modalContentWrapperEl);
				var modalWidth = width + 40;
				if (window.innerWidth < modalWidth) {
					modalWidth = width;
					height = height * ((width - 40) / width);
					width = width - 40;
				}
				modalContentWrapperEl.css('width', '' + modalWidth + 'px');

				
				var labelTranslated = '';
				if (attrs.xpsuiSchema) {
					$translate.instant(scope.$eval(attrs.xpsuiSchema.concat('.transCode')));
				}
				var modalHeader = $compile(angular.element('<div class="x-modalview-header"><span>' + labelTranslated + '</span></div>'))(scope);
				modalContentWrapperEl.append(modalHeader);
				
				var modalContentEl =  angular.element('<div></div>');
				modalContentEl.addClass('x-modalview-body');
				modalContentWrapperEl.append(modalContentEl);

				var canvasContainer = angular.element('<div class="xpsui-uploadable-canvas-container"></div>')
				var resizorCanvas = angular.element('<canvas ></canvas>');
				resizorCanvas.attr('width', width);
				resizorCanvas.attr('height', height);
				canvasContainer.append(resizorCanvas);
				modalContentEl.append(canvasContainer);
				
				var canvasResult = angular.element('<canvas class="xpsui-imageresizor-result" width="' + resultImgWidth + '" height="' + resultImgHeight + '"></canvas>');
				canvasResult.addClass('x-hidden');
				wrapper.append(canvasResult);
				
				var buttonsHolder = angular.element('<div class="xpsui-buttons-holder"></div>');
				modalContentEl.append(buttonsHolder);

				var buttonRotate = $compile(angular.element('<button type="button" class="btn btn-edit xpsui-icon-rotate"><icon class="icon-rotate"></icon> <span>{{\'psui.imageresizor.rotate\' | translate}}</span></button>'))(scope);
				buttonsHolder.append(buttonRotate);
				
				var buttonOk = $compile(angular.element('<button type="button" class="btn btn-edit xpsui-icon-ok"><icon class="icon-check"></icon> <span>{{\'psui.imageresizor.ok\' | translate}}</span></button>'))(scope);
				buttonsHolder.append(buttonOk);
				
				var buttonClose = angular.element('<div class="x-modalview-close"></div>');
				modalHeader.append(buttonClose);

				var numberOfRot = 0;
				
				buttonRotate.on('click', function(evt){
					numberOfRot = numberOfRot + 1;
					numberOfRot = numberOfRot % 4;
					tmp = originImgHeight;
					originImgHeight = originImgWidth;
					originImgWidth = tmp;
					difX = 0;
					difY = 0;
					resize = 1;
					
					draw(context,context2);
					evt.stopPropagation();
					return false;
				})
				
				var context = resizorCanvas[0].getContext("2d");
				var context2 = canvasResult[0].getContext("2d");
				// this moves 0,0 coordinates into center of canvas
				context.translate(width/2,height/2);
				
				var img = new Image();

				var draw=function(ctx,ctx2){
					ctx.fillStyle = 'rgba(0,0,0,1)';
					ctx.fillRect(-width/2,-height/2,width,height);
					ctx.rotate((Math.PI /2)* numberOfRot);
					
					if((originImgHeight / originImgWidth) > (height / width)){
						pomer = height / originImgHeight;
					} else {
						pomer = width / originImgWidth;
					}
						
					if (originImgHeight * pomer * resize <= imgHeight || originImgWidth * pomer * resize <= imgWidth){
						if((originImgHeight / originImgWidth) > (height / width)){
							resize = imgWidth / (originImgWidth * pomer);
						} else {
							resize = imgHeight / (originImgHeight * pomer);
						}
					}
					
					if (numberOfRot % 2 === 1){
						tmp = difX;
						difX = difY;
						difY = tmp;
					}
					
					if (difX > (originImgWidth * resize * pomer - imgWidth)/2){
						difX = (originImgWidth * resize * pomer - imgWidth)/2;
					}
						
					if (-difX > (originImgWidth * resize * pomer - imgWidth)/2){
						difX = -(originImgWidth * resize * pomer - imgWidth)/2;
					}
						
					if (difY > (originImgHeight * resize * pomer - imgHeight)/2){
						difY = (originImgHeight * resize * pomer - imgHeight)/2;
					}
					
					if (-difY > (originImgHeight * resize * pomer - imgHeight)/2){
						difY = -(originImgHeight * resize * pomer - imgHeight)/2;
					}
					
					if (numberOfRot % 2 === 1){
						tmp = difX;
						difX = difY;
						difY = tmp;
					}
					
					ctx.drawImage(img,
						-(img.width * resize * pomer)/2 + difX,
						-(img.height * resize * pomer)/2 + difY,
						img.width * pomer * resize,
						img.height * pomer * resize
					);
					
					ctx.rotate(-(Math.PI/2)* numberOfRot);
					ctx2.drawImage(resizorCanvas[0],(width - imgWidth)/2,(height - imgHeight)/2,imgWidth,imgHeight,0,0,resultImgWidth,resultImgHeight);
					ctx.fillStyle = 'rgba(1,1,1,0.7)';
					// left bar
					ctx.fillRect(- width/2,- height/2,(width - imgWidth)/2,height);
					// top bar
					ctx.fillRect(- width/2 + (width - imgWidth)/2,- height/2,imgWidth,(height - imgHeight)/2);
					// right bar
					ctx.fillRect(imgWidth/2,-height/2,(width-imgWidth)/2,height);
					// bottom bar
					ctx.fillRect(- width/2 + (width - imgWidth)/2, imgHeight/2,imgWidth,(height - imgHeight)/2);
				}
				
				
				img.onload =  function() {
					console.log('loaded');
					originImgWidth = img.width;
					originImgHeight = img.height;
					canvasResult.removeClass('x-hidden');
					document.querySelector('body').classList.add('x-dropdown-open');
					modalEl.addClass('x-open');
					draw(context,context2);
				};

				if (imgCtrl) {
					imgCtrl.srcElm = img;
				}

				modalEl.on('click', function(evt) {
					evt.stopPropagation();
					return false;
				});

				buttonOk.on('click', function(evt) {
					if (canvasResult[0].toBlob) {
						canvasResult[0].toBlob(imgCtrl.imageProcessed, 'image/jpeg');
					} else {
						// dirty workarround for chrome
						//take apart data URL
						var parts = canvasResult[0].toDataURL().match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);

						//assume base64 encoding
						var binStr = atob(parts[3]);

						//convert to binary in ArrayBuffer
						var buf = new ArrayBuffer(binStr.length);
						var view = new Uint8Array(buf);
						for(var i = 0; i < view.length; i++)
						  view[i] = binStr.charCodeAt(i);

						var blob = new Blob([view], {'type': parts[1]});
						imgCtrl.imageProcessed(blob);
					}

					canvasResult.addClass('x-hidden');
					document.querySelector('body').classList.remove('x-dropdown-open');
					modalEl.removeClass('x-open');
					evt.stopPropagation();
					return false;
				});
					
				buttonClose.on('click', function(evt) {
					canvasResult.addClass('x-hidden');
					document.querySelector('body').classList.remove('x-dropdown-open');
					modalEl.removeClass('x-open');
					evt.stopPropagation();
					return false;
				});

				resizorCanvas.on('mousewheel', function(evt){
					evt.preventDefault();
					if (evt.wheelDelta > 0){
						resize = resize + 0.1;
					} else {
						resize = resize - 0.1;	
					}
					draw(context,context2);
				})
				
				resizorCanvas.on('DOMMouseScroll', function(evt){
					evt.preventDefault();
					if (evt.detail < 0){
						resize = resize + 0.1;
					} else {
						resize = resize - 0.1;
					}
					draw(context,context2);
					
				})
				
				function moveImg(clientX, clientY){
					if (state == 1){
						if (numberOfRot == 0){
							difX = difX + clientX - x;
							difY = difY + clientY - y;
						} else if (numberOfRot == 1){
							difX = difX + clientY - y;
							difY = difY - clientX + x;
						} else if (numberOfRot == 2){
							difX = difX - clientX + x;
							difY = difY - clientY + y;
						} else if (numberOfRot == 3){
							difX = difX - clientY + y;
							difY = difY + clientX - x;
						}
						
						draw(context,context2);
					}
					x = clientX;
					y = clientY;
				}
				
				resizorCanvas.on('click',function(evt){
					evt.stopPropagation();
					return false;
				})

				resizorCanvas.on('mousedown',function(evt){
					state = 1;
					evt.stopPropagation();
					return false;
				})
				
				resizorCanvas.on('mouseup mouseleave',function(evt){
					state = 0;
					evt.stopPropagation();
					return false;
				})
				
				resizorCanvas.on('mousemove',function(evt){
					moveImg(evt.clientX, evt.clientY);
					evt.stopPropagation();
					return false;
				})
				
			
				var zoomTouch = [];
				
				resizorCanvas.on('touchstart',function(evt){
					state = 1;
					
					if (evt.targetTouches.length === 1) {
						x = evt.targetTouches[0].clientX;
						y = evt.targetTouches[0].clientY;
					} else if(evt.targetTouches.length === 2){
						zoomTouch = [
							getVector(evt.targetTouches[0]),
							getVector(evt.targetTouches[1])
						];
					}
					evt.preventDefault();
				})
				
				resizorCanvas.on('touchend',function(evt){
					state = 0;
					evt.preventDefault();
				})
				
				resizorCanvas.on('touchmove',function(evt){
					if (evt.targetTouches.length === 1) {
						moveImg(
							evt.targetTouches[0].clientX, 
							evt.targetTouches[0].clientY
						);
					} else if(evt.targetTouches.length === 2){
						var currentZoomTouch = [
								getVector(evt.targetTouches[0]),
								getVector(evt.targetTouches[1])
							]
						;
						
						resize = resize + 
								(
									vectorLength(currentZoomTouch[0],currentZoomTouch[1]) -
									vectorLength(zoomTouch[0],zoomTouch[1])
								) / 100
						;
						

						draw(context,context2);
						zoomTouch = currentZoomTouch;
					}
					
					evt.preventDefault();
				})
				
				function getVector(vec){
					return {
						x: vec.clientX,
						y: vec.clientY
					};
				}
				
				function vectorLength(vec1, vec2){
					var x = Math.abs(vec1.x-vec2.x),
						y = Math.abs(vec1.y-vec2.y)
					;
					return Math.sqrt(
						x*x + y*y 
					);
				}
				
			}
		}
	}]);

}(window.angular));