(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiDropdown', ['xpsui:logging', '$timeout', '$translate',  function(log, $timeout, $translate) {		
		return {
			restrict: 'A',
			require: ['?ngModel','xpsuiDropdown','xpsuiDateEdit'],
			controller: function(){
				
				this.setElement = function($element){
					this.$element = $element;

					return this;
				};

				this.getElement =  function(){
					return this.$element;
				};
				
				this.getContentElement =  function(){
					return this.$contentEl;
				};
				
				this.setInput = function(input){
					var self = this;
					this.$inputElement = input;
					
					this.$inputElement.on('keydown', function(evt) {
						switch (evt.keyCode) {
							case 40: // key down
								self.open();
								break;
						}
					});

					return this;
				};
				
				this.renderInit = function(){
					var self = this;
					if(!this.$actionEl){
						this.$actionEl = angular.element('<div class="x-dropdown-action"><span>' + $translate.instant('dropdown.toggle') + '</span></div>');
						this.$contentEl = angular.element('<div class="x-dropdown-content"></div>');
						this.$element.append(this.$actionEl);
						this.$element.append(this.$contentEl);
						
						this.$actionEl.on('click', function(event){
							if(self.$element.hasClass(self.options.clsOpen)){
								self.close(false);
							} else {
								self.open();
							}
							event.stopPropagation();
						});
					}
				};
				
				this.setOptions = function(options){
					angular.extend(this.options, options || {});
				};
				
				this.toggle = function(){
					if(this.$element.hasClass(this.options.clsOpen)){
						this.close();
					} else {
						this.open();
					}
				};
				
				this.close = function(waiting){
					var self = this;
					
					if (waiting === undefined ) {
						waiting = true;
					}
					
					if (waiting) {
						this.closeTimeout = $timeout(function(){
							self.close(false);
						}, this.options.closingTime);
						return true;
					}
					
					this.$element.removeClass(this.options.clsOpen);
					
					this.afterClose();
				};
				
				this.afterClose =  function(){};
				
				this.open = function(){
					this.$element.addClass(this.options.clsOpen);
					this.afterOpen();
				};
				
				this.afterOpen = function(){};
				
				this.cancelClosing = function(){
					this.closeTimeout && $timeout.cancel(this.closeTimeout);
				};
					
				this.render = function(){
					this.renderInit();
				};

				// this.$element = $element;
				this.$element = null;
				
				this.options = {
					closingTime: 150,
					clsOpen: 'x-open'
				};
				
				this.closeTimeout = null;
			},
			link: function(scope, elm, attrs, ctrls) {
				var self = ctrls[1],
					xpsuiTextInputCtrl = ctrls[2]
				;
				
				elm.addClass('x-dropdown');

				self.setElement(elm).setInput(xpsuiTextInputCtrl.getInput())
					.render()
				;
			}
		};
	}]);
}(window.angular));