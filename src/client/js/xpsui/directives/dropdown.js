(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiDropdown', ['xpsui:log', 'xpsui:ComponentGenerator', '$timeout', '$translate',  function(log, componentGenerator, $timeout, $translate) {		
		return {
			restrict: 'A',
			require: ['?xpsuiCtrl', '?ngModel','xpsuiDropdown','xpsuiTextInput'],
			controller: function($scope, $element){
				
				function dropdown($element){
					this.$element = $element;
					
					this.options = dropdown.DEFAULTS;
					
					this.closeTimeout = null;
				};
				
				dropdown.DEFAULTS = {
					closingTime: 150,
					clsOpen: 'x-open'
				};
				
				dropdown.prototype.getElement =  function(){
					return this.$element;
				};
				
				dropdown.prototype.getContentElement =  function(){
					return this.$contentEl;
				};
				
				dropdown.prototype.setInput = function(input){
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
				
				dropdown.prototype.renderInit = function(){
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
				
				dropdown.prototype.setOptions = function(options){
					angular.extend(this.options, options || {});
				};
				
				dropdown.prototype.toggle = function(){
					if(this.$element.hasClass(this.options.clsOpen)){
						this.close();
					} else {
						this.open();
					}
				};
				
				dropdown.prototype.close = function(waiting){
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
				
				dropdown.prototype.afterClose =  function(){};
				
				dropdown.prototype.open = function(){
					this.$element.addClass(this.options.clsOpen);
					this.afterOpen();
				};
				
				dropdown.prototype.afterOpen = function(){};
				
				dropdown.prototype.cancelClosing = function(){
					this.closeTimeout && $timeout.cancel(this.closeTimeout);
				};
					
				dropdown.prototype.render = function(){
					this.renderInit();
				};
				
				return new dropdown($element);
			},
			link: function(scope, elm, attrs, ctrls) {
				var self = ctrls[2],
					xpsuiTextInputCtrl = ctrls[3]
				;
				
				elm.addClass('x-dropdown');

				self.setInput(xpsuiTextInputCtrl.getInput())
					.render()
				;
			}
		};
	}]);
}(window.angular));