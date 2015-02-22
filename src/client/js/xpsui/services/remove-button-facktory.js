(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:RemoveButtonFactory', ['xpsui:logging', '$translate',   function(log, $translate) {	
		var keys = {
	            backspace: 8,
	            del: 	  46
	   };

		function RemoveButton($element, options){
			this.$element = $element;

			this.options = angular.extend({}, RemoveButton.DEFAULTS, options || {} );
		};
		
		RemoveButton.DEFAULTS = {
			input: null,
			enabled: true,
			onClear: function(){}
		};

		RemoveButton.prototype.show = function(){
			this.render();
			if(this.$actionEl){
				this.$actionEl.addClass('x-show');
			}
		};
		
		RemoveButton.prototype.hide = function(){
			if(this.$actionEl){
				this.$actionEl.removeClass('x-show');
			}
		};

		RemoveButton.prototype._handleKeyDown = function() {
			var self = this;

			// bind a keydown handler
			if(this.options.input){
				this.options.input.on('keydown', function(event) {
					switch (event.keyCode) {
						case keys.backspace:
						//case keys.del:
							event.preventDefault();
							self._onClear();
							event.stopPropagation();
							break;
					}
				});
			}
		};

		RemoveButton.prototype._onClear = function(){
			this.options.onClear();
			this.hide();
		}

		RemoveButton.prototype.renderInit = function(){
			var self = this;
			if(!this.$actionEl && this.options.enabled){
				this.$actionEl = angular.element('<div class="x-remove-button-action"><span>' + $translate.instant('RemoveButton.remove') + '</span></div>');
				this.$actionEl.on('click', function(){
					self._onClear();
				});

				self._handleKeyDown();
				this.$element.append(this.$actionEl);
				this.$element.addClass("x-remove-button");
			}
		};

		RemoveButton.prototype.render = function(){
			this.renderInit();
		};


		return {
			controller: RemoveButton,
			create: function(element, options) {
				return new RemoveButton(element, options);
			}
		}
	
	}]);
}(window.angular));