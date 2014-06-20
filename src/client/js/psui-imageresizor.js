'use strict';

angular.module('psui-imageresizor', [])
.directive('psuiImageresizor', [function () {
	return {
		restrict: 'A',
		require: ['?psuiUploadableImage'],
		link: function(scope, elm, attrs, ctrls) {
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
			
			elm.addClass('psui-imageresizor');
			
			var imgCtrl = ctrls[0];

			var imgWidth = attrs.psuiImageresizorWidth || 0;
			var imgHeight = attrs.psuiImageresizorHeight || 0;
			var resize = 1;
			var width = imgWidth*3;
			var height = imgHeight*3;
			var state = 0;
			var pomer;
			var x,y;
			var tmp;
			var difX = 0;
			var difY = 0;
			var originImgWidth;
			var originImgHeight;
			
			var resizorCanvas = angular.element('<canvas class="psui-imageresizor-resizor" ></canvas>');
			resizorCanvas.attr('width',width);
			resizorCanvas.attr('height',height);
			resizorCanvas.addClass('psui-hidden');
			wrapper.append(resizorCanvas);
			
			var canvasResult = angular.element('<canvas class="psui-imageresizor-result" width="' + imgWidth + '" height="' + imgHeight + '"></canvas>');
			canvasResult.addClass('psui-hidden');
			wrapper.append(canvasResult);
			
			var buttonsHolder = angular.element('<div class="psui-buttons-holder"></div>');
			buttonsHolder.addClass('psui-hidden');
			wrapper.append(buttonsHolder);
			
			var buttonRotate = angular.element('<button><b>Rotate</b></button>');
			buttonsHolder.append(buttonRotate);
			
			var buttonOk = angular.element('<button><b>OK</b></button>');
			buttonsHolder.append(buttonOk);

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
				ctx2.drawImage(resizorCanvas[0],(width - imgWidth)/2,(height - imgHeight)/2,imgWidth,imgHeight,0,0,imgWidth,imgHeight);
				ctx.fillStyle = 'rgba(1,1,1,0.7)';
				// left bar
				ctx.fillRect(- width/2,- height/2,(width - imgWidth)/2,height);
				// top bar
				ctx.fillRect(- width/2 + (width - imgWidth)/2,- height/2,imgWidth,(height - imgHeight)/2);
				// right bar
				ctx.fillRect(imgWidth/2,-height/2,(width-imgWidth)/2,height);
				// bottom bar
				ctx.fillRect(- width/2 + (width - imgWidth)/2, imgHeight/2,imgWidth,(height - imgHeight)/2);
				//ctx.fillRect(- width/2 + (width - imgWidth)/2,- height/2 + (height - imgHeight)/2 + imgHeight,imgWidth,(height - imgHeight)/2);
				//ctx.fillRect(- width/2 + (width - imgWidth)/2 + imgWidth,- height/2,(width - imgWidth)/2,height);
			}
			
			
			img.onload =  function() {
				console.log('loaded');
				originImgWidth = img.width;
				originImgHeight = img.height;
				canvasResult.removeClass('psui-hidden');
				resizorCanvas.removeClass('psui-hidden');
				buttonsHolder.removeClass('psui-hidden');
				draw(context,context2);
			};

			if (imgCtrl) {
				imgCtrl.srcElm = img;
			}

			buttonOk.on('click', function() {
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

				canvasResult.addClass('psui-hidden');
				resizorCanvas.addClass('psui-hidden');
				buttonsHolder.addClass('psui-hidden');
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
			
			resizorCanvas.on('mousedown',function(evt){
				
				state = 1;
				
			})
			
			resizorCanvas.on('mouseup mouseleave',function(evt){
			
				state = 0;
			
			})
			
			resizorCanvas.on('mousemove',function(evt){
				if (state == 1){
					if (numberOfRot == 0){
						difX = difX + evt.clientX - x;
						difY = difY + evt.clientY - y;
					} else if (numberOfRot == 1){
						difX = difX + evt.clientY - y;
						difY = difY - evt.clientX + x;
					} else if (numberOfRot == 2){
						difX = difX - evt.clientX + x;
						difY = difY - evt.clientY + y;
					} else if (numberOfRot == 3){
						difX = difX - evt.clientY + y;
						difY = difY + evt.clientX - x;
					}
					
					draw(context,context2);
				}
				x = evt.clientX;
				y = evt.clientY;
				
			})
			
		}
	}
}])
			
			
