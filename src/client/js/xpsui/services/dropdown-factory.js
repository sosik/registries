(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:DropdownFactory', ['xpsui:logging', '$timeout', '$translate',  function(log, $timeout, $translate) {	
		function Dropdown($element,options){
			this.$element = $element;
			
			//this.options = Dropdown.DEFAULTS;
			this.options = angular.extend({}, Dropdown.DEFAULTS, options || {} );
			
			this.closeTimeout = null;
		};
		
		Dropdown.DEFAULTS = {
			closingTime: 150,
			clsOpen: 'x-open',
			bodyClsOpen: 'x-dropdown-open-sm',
			allowClose: true,
			showDropdownAction: true,
			titleTransCode: null
		};
		
		Dropdown.prototype.getElement =  function(){
			return this.$element;
		};
		
		Dropdown.prototype.getContentElement =  function(){
			return this.$bodyEl;
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
			if(!this.$contentEl){
				// showDropdownAction
				//this.$actionEl = angular.element('<div class="x-dropdown-action"><span>' + $translate.instant('Dropdown.toggle') + '</span></div>');
				this.initDropdownAtion();
				this.$contentEl = angular.element('<div class="x-dropdown-content"></div>');

				this.$contentInnerEl = angular.element('<div class="x-dropdown-content-inner"></div>');
				this.$contentEl.append(this.$contentInnerEl);

				this.$titleEl = angular.element('<div class="x-dropdown-header">' + this.getTitle() + '</div>');
				this.$contentInnerEl.append(this.$titleEl);
				this.$closeEl = angular.element('<a href="#" class="x-dropdown-close"></a>');
				this.$contentInnerEl.append(this.$closeEl);

				this.$bodyEl = angular.element('<div class="x-dropdown-body"></div>');
				this.$contentInnerEl.append(this.$bodyEl);

				this.$element.append(this.$actionEl);
				this.$element.append(this.$contentEl);
				
				this.$closeEl.on('click', function(event){
					self.onCloseButton(event);
				});
			}
		};

		Dropdown.prototype.initDropdownAtion = function(){
			var self = this;
			if(this.options.showDropdownAction){
				this.$actionEl = angular.element('<div class="x-dropdown-action"><span>' + $translate.instant('Dropdown.toggle') + '</span></div>');
				this.$actionEl.on('click', function(event){
					self.onCloseButton(event);
				});

				this.$element.addClass('x-dropdown-action-enabled');
			}
		};

		Dropdown.prototype.getTitle = function(){
			if(this.options.titleTransCode){
				return $translate.instant(this.options.titleTransCode);
			}
			return '';
		}

		Dropdown.prototype.onCloseButton = function(event){
			if(this.$element.hasClass(this.options.clsOpen)){
				this.close(false);
			} else {
				this.open();
			}
			event.stopPropagation();
			event.preventDefault();
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

			if(this.options.allowClose){
				this.$element.removeClass(this.options.clsOpen);
			
				this.afterClose();
				document.querySelector('body').classList.remove(this.options.bodyClsOpen);
			}
		};
		
		Dropdown.prototype.afterClose =  function(){};
		
		Dropdown.prototype.open = function(){
			if(!this.$element.hasClass(this.options.clsOpen)){
				this.$element.addClass(this.options.clsOpen);
				this.afterOpen();
				document.querySelector('body').classList.add(this.options.bodyClsOpen);
			}
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
			create : function(element, options) {
				return new Dropdown(element, options);
			}
		}
	
	}]);
}(window.angular));