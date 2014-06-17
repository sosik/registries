'use strict';

angular.module('psui-imageresizor', ['psui'])
.directive('psuiImageresizor', [function () {
	return {
		restrict: 'A',
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
			
			var imgWidth = 60;
			var imgHeight = 70;
			var resize = 1;
			var width = imgWidth*3;
			var height = imgHeight*3;
			var state = 0;
			var pomer;
			var x,y;
			var tmp;
			var difX = 0;
			var difY = 0;
			elm.attr('width',width);
			elm.attr('height',height);
			
			var img = document.getElementById("img");
			
			var imgAng = angular.element(img);
			
			var canvasResult = angular.element('<canvas id="canvas-result" width="' + imgWidth + '" height="' + imgHeight + '"></canvas>');
			wrapper.append(canvasResult);
			
			var buttonsHolder = angular.element('<div class="psui-buttons-holder"></div>');
			wrapper.append(buttonsHolder);
			
			var buttonShow = angular.element('<button><b>Show</b></button>');
			buttonsHolder.append(buttonShow);
			//buttonShow.addClass('psui-hidden');
			
			
			//opravit chrome stale nechodi
			//imgAng.on('load',function(evt){
			//	buttonShow.removeClass('psui-hidden');
			//})
			
			
			var buttonRotate = angular.element('<button><b>Rotate</b></button>');
			buttonsHolder.append(buttonRotate);
			
			var numberOfRot = 0;
			var originImgWidth = img.clientWidth;
			var originImgHeight = img.clientHeight;
			
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
			
			var context = elm[0].getContext("2d");
			var context2 = canvasResult[0].getContext("2d");
			context.translate(width/2,height/2);
			
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
				
				if (numberOfRot % 2 == 1){
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
				
				if (numberOfRot % 2 == 1){
					tmp = difX;
					difX = difY;
					difY = tmp;
				}
				
				ctx.drawImage(img,- (img.clientWidth * resize * pomer)/2 + difX,- (img.clientHeight * resize * pomer)/2 + difY,img.clientWidth * pomer * resize,img.clientHeight * pomer * resize);
				
				ctx.rotate(-(Math.PI/2)* numberOfRot);
				ctx2.drawImage(elm[0],(width - imgWidth)/2,(height - imgHeight)/2,imgWidth,imgHeight,0,0,imgWidth,imgHeight);
				ctx.fillStyle = 'rgba(0,0,0,0.5)';
				ctx.fillRect(- width/2,- height/2,(width - imgWidth)/2,height);
				ctx.fillRect(- width/2 + (width - imgWidth)/2,- height/2,imgWidth,(height - imgHeight)/2);
				ctx.fillRect(- width/2 + (width - imgWidth)/2,- height/2 + (height - imgHeight)/2 + imgHeight,imgWidth,(height - imgHeight)/2);
				ctx.fillRect(- width/2 + (width - imgWidth)/2 + imgWidth,- height/2,(width - imgWidth)/2,height);
				
				
			}
			
			
			buttonShow.on('click',function(evt){
				draw(context,context2);
			})
			
			elm.on('mousewheel', function(evt){
				evt.preventDefault();
				if (evt.wheelDelta > 0){
					resize = resize + 0.1;
				} else {
					resize = resize - 0.1;	
				}
				draw(context,context2);
				
				
				
			})
			
			elm.on('DOMMouseScroll', function(evt){
				evt.preventDefault();
				if (evt.detail < 0){
					resize = resize + 0.1;
				} else {
					resize = resize - 0.1;
				}
				draw(context,context2);
				
			})
			
			elm.on('mousedown',function(evt){
				
				state = 1;
				
			})
			
			elm.on('mouseup mouseleave',function(evt){
			
				state = 0;
			
			})
			
			elm.on('mousemove',function(evt){
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
			
			