(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	/**
	 * Remove button which is using in objeclink to remove data
	 *
	 * Example:
	 * 
	 *     var removeButton = removeButtonFactory.create(elm,{
	 *         enabled: !!!schemaFragment.required,
	 *         input: input,
	 *         onClear: function(){
	 *             input.empty();
	 *             scope.$apply(function() {
	 *                 ngModel.$setModelValue(
	 *                     {}
	 *                 );
	 *             });
	 *         }
	 *     });
	 *
	 * @class xpsui:DropdownFactory
	 * @module client
	 * @submodule services
	 */
	.factory('xpsui:RemoveButtonFactory', ['xpsui:logging', '$translate',   function(log, $translate) {	
		var keys = {
			backspace: 8,
			del: 	  46
		};

		/**
		 * Constructor
		 * 
		 * @method RemoveButton
		 * @param {angular.element} $element directive element
		 * @param {Object} options  look on RemoveButton.DEFAULTS attributes
		 * @private
		 * @constructor
		 */
		function RemoveButton($element, options){
			/**
			 * Directive element
			 *
			 * @property $element
			 * @type {angular.element}
			 */
			this.$element = $element;

			/**
			 * Object settings
			 *
			 * @property options
			 * @extends {Dropdown.DEFAULTS}
			 * @type {Object}
			 */
			this.options = angular.extend({}, RemoveButton.DEFAULTS, options || {} );
		};
		
		RemoveButton.DEFAULTS = {
			/**
			 * Component imput for handle backspace keydown
			 *
			 * @attribute input
			 * @default null
			 * @type {angular.element}
			 */
			input: null,
			/**
			 * Show/hide the clear button
			 * 
			 * @attribute enabled
			 * @default true
			 * @type {Boolean}
			 */
			enabled: true,
			/**
			 * Function call after click on clear button
			 * 
			 * @attribute onClear
			 * @default function(){}
			 * @type {Function}
			 */
			onClear: function(){}
		};

		/**
		 * Show button
		 * 
		 * @method  show
		 */
		RemoveButton.prototype.show = function(){
			this.render();
			if(this.$actionEl){
				this.$actionEl.addClass('x-show');
			}
		};
		
		/**
		 * Hide button
		 * 
		 * @method  hide
		 */
		RemoveButton.prototype.hide = function(){
			if(this.$actionEl){
				this.$actionEl.removeClass('x-show');
			}
		};

		/**
		 * Key down handler of the this.options.input
		 * 
		 * @method  _handleKeyDown
		 * @private
		 */
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

		/**
		 * Call onClear function
		 * 
		 * @method _onClear
		 * @private
		 */
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

		/**
		 * Render layout
		 *
		 * @method  render
		 */
		RemoveButton.prototype.render = function(){
			this.renderInit();
		};


		return {
			controller: RemoveButton,

			/**
			 * Create the RemoveButton
			 *
			 * @method create
			 * @param  {angular.element} element
			 * @param  {Object} options
			 * @return {RemoveButton}
			 */
			create: function(element, options) {
				return new RemoveButton(element, options);
			}
		}
	
	}]);
}(window.angular));