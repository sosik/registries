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
			
			var width = imgWidth*3;
			var height = imgHeight*3;
			
			
			var x,y;
			var difX = 0;
			var difY = 0;
			
			elm.attr('width',width);
			elm.attr('height',height);
			
			var img = document.getElementById("img");
			
			var canvasResult = angular.element('<canvas id="canvas-result" width="' + imgWidth + '" height="' + imgHeight + '"></canvas>');
			wrapper.append(canvasResult);
			
			var buttonsHolder = angular.element('<div class="psui-buttons-holder"></div>');
			wrapper.append(buttonsHolder);
			
			var buttonShow = angular.element('<button><b>Show</b></button>');
			buttonsHolder.append(buttonShow);
			
			var buttonRotate = angular.element('<button><b>Rotate</b></button>');
			buttonsHolder.append(buttonRotate);
			
			buttonRotate.on('click', function(evt){
				
				//img.rotate(90);
				
			})
			
			var ctx = elm[0].getContext("2d");
			var ctx2 = canvasResult[0].getContext("2d");
			buttonShow.on('click',function(evt){
			
				
			
				ctx.fillStyle = 'rgba(0,0,0,1)';
				ctx.fillRect(0,0,width,height);	
				//ctx.translate(width/2,height/2);
				//ctx.rotate(Math.PI /2);
				var pomer;
				if((img.clientHeight / img.clientWidth) > (height / width)){
					pomer = height / img.clientHeight;
					if (height * resize <= imgHeight || img.clientWidth * pomer * resize <= imgWidth){
						resize = imgWidth / (img.clientWidth * pomer);
						
					}
					
					if(((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2) < difX){
						difX = ((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2);
					}
					
					if(((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2 + img.clientWidth * pomer *resize - img.clientWidth * pomer)< (-1)*difX){
						difX = -((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2 + img.clientWidth * pomer *resize - img.clientWidth * pomer);
					}
						
					if(((height - imgHeight)/2 < difY)){
						difY = (height - imgHeight)/2;
					}
					
					if(((height - imgHeight)/2 + height * (resize - 1)< (-1)*difY)){
						difY = -((height - imgHeight)/2 + height * (resize - 1));
					}
					
					
					ctx.drawImage(img,(width - img.clientWidth * pomer)/2 + difX,0 + difY,img.clientWidth * pomer * resize,height * resize);
				} else {
					pomer = width / img.clientWidth;
					if (width * resize <= imgWidth || img.clientHeight * pomer * resize <= imgHeight){
						resize = imgHeight / (img.clientHeight * pomer);
					}
					
					if(((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2) < difY){
						difY = ((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2);
					}
					
					if(((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2 + img.clientHeight * pomer * resize - img.clientHeight * pomer) < (-1)*difY){
						difY = -((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2 + img.clientHeight * pomer * resize - img.clientHeight * pomer);
					}
						
					if(((width - imgWidth)/2 < difX)){
						difX = (width - imgWidth)/2;
					}
					
					if(((width - imgWidth)/2 + width * (resize - 1)< (-1)*difX)){
						difX = -((width - imgWidth)/2 + width * (resize - 1));
					}
					
					
					
					ctx.drawImage(img,0 + difX,(height - img.clientHeight * pomer)/2 + difY,width * resize,img.clientHeight * pomer * resize);
				}
				
				ctx2.drawImage(elm[0],(width - imgWidth)/2,(height - imgHeight)/2,imgWidth,imgHeight,0,0,imgWidth,imgHeight);
				ctx.fillStyle = 'rgba(0,0,0,0.5)';
				ctx.fillRect(0,0,(width - imgWidth)/2,height);
				ctx.fillRect((width - imgWidth)/2,0,imgWidth,(height - imgHeight)/2);
				ctx.fillRect((width - imgWidth)/2,(height - imgHeight)/2 + imgHeight,imgWidth,(height - imgHeight)/2);
				ctx.fillRect((width - imgWidth)/2 + imgWidth,0,(width - imgWidth)/2,height);
			
			
			})
			
			var resize = 1;
			elm.on('mousewheel', function(evt){
				evt.preventDefault();
				if (evt.wheelDelta > 0){
					resize = resize + 0.1;
				} else {
					resize = resize - 0.1;
					
				}
				
				ctx.fillStyle = 'rgba(0,0,0,1)';
				ctx.fillRect(0,0,width,height);
				
				var img = document.getElementById("img");
				var pomer;
				if((img.clientHeight / img.clientWidth) > (height / width)){
					pomer = height / img.clientHeight;
					if (height * resize <= imgHeight || img.clientWidth * pomer * resize <= imgWidth){
						resize = imgWidth / (img.clientWidth * pomer);
						
					}
					
					if(((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2) < difX){
						difX = ((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2);
					}
					
					if(((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2 + img.clientWidth * pomer *resize - img.clientWidth * pomer)< (-1)*difX){
						difX = -((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2 + img.clientWidth * pomer *resize - img.clientWidth * pomer);
					}
						
					if(((height - imgHeight)/2 < difY)){
						difY = (height - imgHeight)/2;
					}
					
					if(((height - imgHeight)/2 + height * (resize - 1)< (-1)*difY)){
						difY = -((height - imgHeight)/2 + height * (resize - 1));
					}
					
					
					ctx.drawImage(img,(width - img.clientWidth * pomer)/2 + difX,0 + difY,img.clientWidth * pomer * resize,height * resize);
					
				} else {
					pomer = width / img.clientWidth;
					if (width * resize <= imgWidth || img.clientHeight * pomer * resize <= imgHeight){
						resize = imgHeight / (img.clientHeight * pomer);
					}
					
					if(((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2) < difY){
						difY = ((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2);
					}
					
					if(((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2 + img.clientHeight * pomer * resize - img.clientHeight * pomer) < (-1)*difY){
						difY = -((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2 + img.clientHeight * pomer * resize - img.clientHeight * pomer);
					}
						
					if(((width - imgWidth)/2 < difX)){
						difX = (width - imgWidth)/2;
					}
					
					if(((width - imgWidth)/2 + width * (resize - 1)< (-1)*difX)){
						difX = -((width - imgWidth)/2 + width * (resize - 1));
					}
					
					
					ctx.drawImage(img,0 + difX,(height - img.clientHeight * pomer)/2 + difY,width * resize,img.clientHeight * pomer * resize);
				}
				
				ctx2.drawImage(elm[0],(width - imgWidth)/2,(height - imgHeight)/2,imgWidth,imgHeight,0,0,imgWidth,imgHeight);
				ctx.fillStyle = 'rgba(0,0,0,0.5)';
				ctx.fillRect(0,0,(width - imgWidth)/2,height);
				ctx.fillRect((width - imgWidth)/2,0,imgWidth,(height - imgHeight)/2);
				ctx.fillRect((width - imgWidth)/2,(height - imgHeight)/2 + imgHeight,imgWidth,(height - imgHeight)/2);
				ctx.fillRect((width - imgWidth)/2 + imgWidth,0,(width - imgWidth)/2,height);
			});
			
			elm.on('DOMMouseScroll', function(evt){
				evt.preventDefault();
				if (evt.detail < 0){
					resize = resize + 0.1;
				} else {
					resize = resize - 0.1;
				}
				
				
				ctx.fillStyle = 'rgba(0,0,0,1)';
				ctx.fillRect(0,0,width,height);
				
				var img = document.getElementById("img");
				var pomer;
				if((img.clientHeight / img.clientWidth) > (height / width)){
					pomer = height / img.clientHeight;
					if (height * resize <= imgHeight || img.clientWidth * pomer * resize <= imgWidth){
						resize = imgWidth / (img.clientWidth * pomer);
						
					}
					
					
					if(((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2) < difX){
						difX = ((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2);
					}
					
					if(((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2 + img.clientWidth * pomer *resize - img.clientWidth * pomer)< (-1)*difX){
						difX = -((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2 + img.clientWidth * pomer *resize - img.clientWidth * pomer);
					}
						
					if(((height - imgHeight)/2 < difY)){
						difY = (height - imgHeight)/2;
					}
					
					if(((height - imgHeight)/2 + height * (resize - 1)< (-1)*difY)){
						difY = -((height - imgHeight)/2 + height * (resize - 1));
					}
					
					
					
					ctx.drawImage(img,(width - img.clientWidth * pomer)/2 + difX,0 + difY,img.clientWidth * pomer * resize,height * resize);
					
				} else {
					pomer = width / img.clientWidth;
					if (width * resize <= imgWidth || img.clientHeight * pomer * resize <= imgHeight){
						resize = imgHeight / (img.clientHeight * pomer);
					}
					
					if(((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2) < difY){
						difY = ((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2);
					}
					
					if(((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2 + img.clientHeight * pomer * resize - img.clientHeight * pomer) < (-1)*difY){
						difY = -((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2 + img.clientHeight * pomer * resize - img.clientHeight * pomer);
					}
						
					if(((width - imgWidth)/2 < difX)){
						difX = (width - imgWidth)/2;
					}
					
					if(((width - imgWidth)/2 + width * (resize - 1)< (-1)*difX)){
						difX = -((width - imgWidth)/2 + width * (resize - 1));
					}
					
					
					ctx.drawImage(img,0 + difX,(height - img.clientHeight * pomer)/2 + difY,width * resize,img.clientHeight * pomer * resize);
				}
				
				ctx2.drawImage(elm[0],(width - imgWidth)/2,(height - imgHeight)/2,imgWidth,imgHeight,0,0,imgWidth,imgHeight);
				ctx.fillStyle = 'rgba(0,0,0,0.5)';
				ctx.fillRect(0,0,(width - imgWidth)/2,height);
				ctx.fillRect((width - imgWidth)/2,0,imgWidth,(height - imgHeight)/2);
				ctx.fillRect((width - imgWidth)/2,(height - imgHeight)/2 + imgHeight,imgWidth,(height - imgHeight)/2);
				ctx.fillRect((width - imgWidth)/2 + imgWidth,0,(width - imgWidth)/2,height);
			})
			
			
			
			var state = 0;
			
			elm.on('mousedown',function(evt){
				
				state = 1;
				
			})
			
			elm.on('mouseup mouseleave',function(evt){
			
				state = 0;
			
			})
			
			
			elm.on('mousemove',function(evt){
				
				if (state == 1){
				
					difX = difX + evt.clientX - x;
					difY = difY + evt.clientY - y;
					
					ctx.fillStyle = 'rgba(0,0,0,1)';
					ctx.fillRect(0,0,width,height);
					
					
					
					var img = document.getElementById("img");
					var pomer;
					if((img.clientHeight / img.clientWidth) > (width / height)){
						pomer = height / img.clientHeight;
						
						if(((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2) < difX){
							difX = ((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2);
						}
					
						if(((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2 + img.clientWidth * pomer *resize - img.clientWidth * pomer)< (-1)*difX){
							difX = -((width - imgWidth)/2 - (width - img.clientWidth * pomer)/2 + img.clientWidth * pomer *resize - img.clientWidth * pomer);
						}
						
						if(((height - imgHeight)/2 < difY)){
							difY = (height - imgHeight)/2;
						}
					
						if(((height - imgHeight)/2 + height * (resize - 1)< (-1)*difY)){
							difY = -((height - imgHeight)/2 + height * (resize - 1));
						}
						
						
						ctx.drawImage(img,(width - img.clientWidth * pomer)/2 + difX,0 + difY,img.clientWidth * pomer * resize,height * resize);
					} else {
						pomer = width / img.clientWidth;
						
						if(((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2) < difY){
							difY = ((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2);
						}
					
						if(((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2 + img.clientHeight * pomer * resize - img.clientHeight * pomer) < (-1)*difY){
							difY = -((height - imgHeight)/2 - (height - img.clientHeight * pomer)/2 + img.clientHeight * pomer * resize - img.clientHeight * pomer);
						}
						
						if(((width - imgWidth)/2 < difX)){
							difX = (width - imgWidth)/2;
						}
					
						if(((width - imgWidth)/2 + width * (resize - 1)< (-1)*difX)){
							difX = -((width - imgWidth)/2 + width * (resize - 1));
						}
						
						
						
						
						
						
						ctx.drawImage(img,0 + difX,(height - img.clientHeight * pomer)/2 + difY,width * resize,img.clientHeight * pomer * resize);
					}
					
					ctx2.drawImage(elm[0],(width - imgWidth)/2,(height - imgHeight)/2,imgWidth,imgHeight,0,0,imgWidth,imgHeight);
					ctx.fillStyle = 'rgba(0,0,0,0.5)';
					ctx.fillRect(0,0,(width - imgWidth)/2,height);
					ctx.fillRect((width - imgWidth)/2,0,imgWidth,(height - imgHeight)/2);
					ctx.fillRect((width - imgWidth)/2,(height - imgHeight)/2 + imgHeight,imgWidth,(height - imgHeight)/2);
					ctx.fillRect((width - imgWidth)/2 + imgWidth,0,(width - imgWidth)/2,height);
					
					
				}
				x = evt.clientX;
				y = evt.clientY;
			
			})
			
		}
	}
}])