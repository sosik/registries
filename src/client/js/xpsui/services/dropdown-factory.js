(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	/**
	 * Dropdow component for generate and manage dropdow button and pop-up (dropdown).
	 * Dropdow button is usually arrow where the pop-up is opened after click .
	 *
	 * Example:
	 * 
	 *     var dropdown = dropdownFactory.create(inputWrapper,{
	 *         showDropdownAction: false,
	 *         titleTransCode: schemaFragment.transCode
	 *     });
	 *     dropdown.setInput(xpsuiTextInputCtrl.getInput())
	 *         .render();
	 *     dropdown.afterOpen = function(){
	 *         dropdown.getContentElement().append('hello');
	 *     }
	 *
	 * @class xpsui:DropdownFactory
	 * @module client
	 * @submodule services
	 */
	.factory('xpsui:DropdownFactory', ['xpsui:logging', '$timeout', '$translate',  function(log, $timeout, $translate) {	
		/**
		 * Constructor
		 * 
		 * @method Dropdown
		 * @param {angular.element} $element directive element
		 * @param {Object} options  look on attributes
		 * @private
		 * @constructor
		 */
		function Dropdown($element,options){

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
			this.options = angular.extend({}, Dropdown.DEFAULTS, options || {} );
			
			this.closeTimeout = null;
		};
		
		/**
		 * Dropdow defaul settings. Setting can be rewrite by constructor options param 
		 *
		 * @property DEFAULTS
		 * @static
		 * @type {Object}
		 * 
		 */
		Dropdown.DEFAULTS = {
			/**
			 * Set close time of the pop-up
			 *
			 * @attribute closingTime
			 * @default 150
			 * @type {Number}
			 */
			closingTime: 150,
			/**
			 * Class name when the dropdow in opened. It is applied to the Dropdown.$element
			 *
			 * @attribute clsOpen
			 * @default 'x-open'
			 * @type {String}
			 */
			clsOpen: 'x-open',
			/**
			 * Class name is applied to the html body. Set full screen mode for tabled and mobile
			 * 
			 * @attribute bodyClsOpen
			 * @default 'x-dropdown-open-sm'
			 * @type {String}
			 */
			bodyClsOpen: 'x-dropdown-open-sm',
			/**
			 * Use for test purpose. If false then the dropdown will never close
			 *
			 * @attribute allowClose
			 * @default true
			 * @type {Boolean}
			 */
			allowClose: true,
			/**
			 * Whether show dropdow button. E.g. autocompleter do not need this the button. 
			 *
			 * @attribute showDropdownAction
			 * @default true
			 * @type {Boolean}
			 */
			showDropdownAction: true,
			/**
			 * Translation code of label
			 *
			 * @attribute titleTransCode
			 * @default null
			 * @type {String}
			 */
			titleTransCode: null
		};
		
		/**
		 * Get directive element
		 *
		 * @method getElement
		 * @return {angular.element}
		 */
		Dropdown.prototype.getElement =  function(){
			return this.$element;
		};
		

		/**
		 * Get content/body pop-up element which is shwon when dropdown is opened
		 *
		 * @example
		 * render component layout into the dropdown content element
		 * 
		 *     self.renderTo(dropdown.getContentElement());
		 *     
		 * @method getContentElement
		 * @return {angular.element} php-up content element
		 */
		Dropdown.prototype.getContentElement =  function(){
			return this.$bodyEl;
		};
		
		/**
		 * Set directive input and bind key down (ArrowDown | Enter) events
		 *
		 * @method setInput
		 * @param {angular.element} input directive's input element
		 * @return {object} this
		 */
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
		
		/**
		 * Init render
		 *
		 * @method renderInit
		 * @private
		 */
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

		/**
		 * Init render dropdown button
		 *
		 * @method initDropdownAtion
		 * @private
		 */
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
		
		/**
		 * Set option settings
		 * 
		 * @method setOptions
		 * @param {object} options Dropdown.DEFAULTS
		 */
		Dropdown.prototype.setOptions = function(options){
			angular.extend(this.options, options || {});
		};
		
		/**
		 * Display or hide dropdown pop-up
		 *
		 * @method toggle
		 */
		Dropdown.prototype.toggle = function(){
			if(this.$element.hasClass(this.options.clsOpen)){
				this.close();
			} else {
				this.open();
			}
		};
		
		/**
		 * Hide dropdown pop-up
		 *
		 * @method close
		 * @param  {boolean} waiting [Default: true] if waiting to cancel. Defaut is true. You can use dropdown.cancelClosing() method.
		 */
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
		
		/**
		 * Method is called after close the dropdown. The method can be override.
		 *
		 * @method afterClose
		 * @abstract
		 */
		Dropdown.prototype.afterClose =  function(){};
		
		/**
		 * Display dropdwon pop-up
		 *
		 * @method open
		 */
		Dropdown.prototype.open = function(){
			if(!this.$element.hasClass(this.options.clsOpen)){
				this.$element.addClass(this.options.clsOpen);
				this.afterOpen();
				document.querySelector('body').classList.add(this.options.bodyClsOpen);
			}
		};
		
		/**
		 * Method is called after open. The method can be override.
		 * The method is usefull when pop-up content should be genereated after open  the pop-up.
		 *
		 * @example
		 * Calendar diredtive
		 * 
		 *     dropdown.afterOpen = function(){
		 *         self.renderTo(dropdown.getContentElement());
		 *         self.setFocus(self.$element);
		 *     };
		 * 
		 *
		 * @method afterOpen
		 * @abstract
		 */
		Dropdown.prototype.afterOpen = function(){};
		
		Dropdown.prototype.cancelClosing = function(){
			this.closeTimeout && $timeout.cancel(this.closeTimeout);
		};
			
		/**
		 * Render layout
		 *
		 * @method render
		 */
		Dropdown.prototype.render = function(){
			this.renderInit();
			this.$element.addClass('x-dropdown');
		};

		return {
			/**
			 * Create the dropdown
			 *
			 * @method create
			 * @param  {angular.element} element
			 * @param  {Object} options
			 * @return {Dropdown}
			 */
			create : function(element, options) {
				return new Dropdown(element, options);
			}
		}
	
	}]);
}(window.angular));