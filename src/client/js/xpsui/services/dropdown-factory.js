(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:DropdownFactory', ['xpsui:logging', '$timeout', '$translate',  function(log, $timeout, $translate) {	
		function Dropdown($element){
			this.$element = $element;
			
			this.options = Dropdown.DEFAULTS;
			
			this.closeTimeout = null;
		};
		
		Dropdown.DEFAULTS = {
			closingTime: 150,
			clsOpen: 'x-open'
		};
		
		Dropdown.prototype.getElement =  function(){
			return this.$element;
		};
		
		Dropdown.prototype.getContentElement =  function(){
			return this.$contentEl;
		};
		
		Dropdown.prototype.setInput = function(input){
			var self = this;
			this.$inputElement = input;
			
			this.$inputElement.on('keydown', function(evt) {
				switch (evt.keyCode) {
					case 40: // key down
					case 13: // key enter
						self.open();
						break;
				}
			});

			return this;
		};
		
		Dropdown.prototype.renderInit = function(){
			var self = this;
			if(!this.$actionEl){
				this.$actionEl = angular.element('<div class="x-dropdown-action"><span>' + $translate.instant('Dropdown.toggle') + '</span></div>');
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
		
		Dropdown.prototype.setOptions = function(options){
			angular.extend(this.options, options || {});
		};
		
		Dropdown.prototype.toggle = function(){
			if(this.$element.hasClass(this.options.clsOpen)){
				this.close();
			} else {
				this.open();
			}
		};
		
		Dropdown.prototype.close = function(waiting){
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
		
		Dropdown.prototype.afterClose =  function(){};
		
		Dropdown.prototype.open = function(){
			this.$element.addClass(this.options.clsOpen);
			this.afterOpen();
		};
		
		Dropdown.prototype.afterOpen = function(){};
		
		Dropdown.prototype.cancelClosing = function(){
			this.closeTimeout && $timeout.cancel(this.closeTimeout);
		};
			
		Dropdown.prototype.render = function(){
			this.renderInit();
			this.$element.addClass('x-dropdown');
		};

		return {
			create : function(element) {
				return new Dropdown(element);
			}
		}
	
	}]);
}(window.angular));