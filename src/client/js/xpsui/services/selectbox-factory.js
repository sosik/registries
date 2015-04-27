(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	/**
	 * Generate and manage list of selectbox options and search input. 
	 *
	 * Example:
	 * 
	 *     // create and set selectbox
	 *     var selectbox = selectboxFactory.create(elm, {
	 *         useSearchInput: false,
	 *         onSelected: function(value){
	 *             //do something with selected value
	 *         }
	 *     });
	 *     // assign with select input
	 *     selectbox.setInput(selfControl.getInput());
	 *     // assign dropdown where the option list is generated after open the dropdown.
	 *     selectbox.setDropdown(dropdown);
	 * 
	 * @class xpsui:SelectboxFactory
	 * @module client
	 * @submodule services
	 * @requires  xpsui:DataDatasetFactory
	 */
	.factory('xpsui:SelectboxFactory', ['xpsui:logging', '$timeout', '$translate',  
	function (log, $timeout, $translate) {	
		var keys = {
			tab:      9,
			backspace:8,
			enter:    13,
			escape:   27,
			space:    32,
			pageup:   33,
			pagedown: 34,
			end:      35,
			home:     36,
			left:     37,
			up:       38,
			right:    39,
			down:     40,
			del: 	  46, 
			asterisk: 106
		};

		/**
		 * Constructor
		 * 
		 * @method Selectbox
		 * @param {angular.element} $element directive element
		 * @param {Object} options  look on Selectbox.DEFAULTS attributes
		 * @constructor
		 * @protected
		 */
		function Selectbox($element, options){

			/**
			 * Directive element
			 *
			 * @property $element
			 * @type {angular.element}
			 */
			this.$element = $element;

			/**
			 * Directive input element. Use for handle key events.
			 *
			 * @property $inputElement
			 * @type {angular.element}
			 */
			this.$inputElement  = null;
			this.dataset = null;
			this.isRendered = false;

			/**
			 * Search input element
			 *
			 * @property $searchInput
			 * @type {angular.element}
			 */
			this.$searchInput = null;
			
			/**
			 * Paging flat
			 *
			 * @property _startPaging
			 * @type {boolean}
			 * @default false
			 * @private
			 */
			this._startPaging = false;

			/**
			 * Selected value
			 *
			 * @property selected
			 * @type {mixed}
			 */
			this.selected = null;

			/**
			 * Object settings
			 *
			 * @property options
			 * @extends {Dropdown.DEFAULTS}
			 * @type {Object}
			 */
			this.options = angular.extend({}, Selectbox.DEFAULTS, options || {} );
		};
		
		/**
		 * Selectbox defaul settings. Setting can be rewrite.
		 *
		 * @property DEFAULTS
		 * @static
		 * @type {Object}
		 * 
		 */
		Selectbox.DEFAULTS = {
			/**
			 * Display or hide the search input
			 * 
			 * @attribute useSearchInput
			 * @default true
			 * @type {Boolean}
			 */
			useSearchInput: true,
			/**
			 * Timeout for re-render the option list when user type someting in search input.
			 *
			 * @attribute filterTimeout
			 * @default 300
			 * @type {Number}
			 */
			filterTimeout: 300,

			/**
			 * Display or hide the footer.
			 *
			 * @attribute showInfo
			 * @default true
			 * @type {Boolean}
			 */
			showInfo: true,
			/**
			 * Callback funciton is calling after select a option.
			 *
			 * @example
			 *     onSelected: function(value){
			 *         input.val(value.v);
			 *     }
			 *
			 * @attribute onSelected
			 * @default function(value){} 
			 * @type {function}
			 */
			onSelected: function(value){},
			/**
			 * Colse on blur
			 *
			 * @attribute closeOnBlur
			 * @default true
			 * @type {Boolean}
			 */
			closeOnBlur: true,
			/**
			 * paging scroll buffer.
			 *
			 * @attribute pagingScrollBuffer
			 * @default 40
			 * @type {Number}
			 */
			pagingScrollBuffer: 40,
			/**
			 * paging items buffer
			 *
			 * @attribute pagingItemsBuffer
			 * @default 10
			 * @type {Number}
			 */
			pagingItemsBuffer: 10,
			/**
			 * allow type custom free text into the search input
			 *
			 * @attribute freeTextMode
			 * @default false
			 * @type {Boolean}
			 */
			freeTextMode: false
		};
		
		Selectbox.prototype.getElement =  function(){
			return this.$element;
		};
		
		Selectbox.prototype.setOptions = function(options){
			angular.extend(this.options, options || {});
		};

		/**
		 * Set directive input
		 *
		 * @method setInput
		 * @param {angular.element} input directive's input element
		 * @return {object} this
		 */
		Selectbox.prototype.setInput = function(element){
			var self = this;
			this.$inputElement = element;
			
			this._bindInputEventHandlers();

			return this;
		};

		/**
		 * Bind input keypress, keydown events
		 *
		 * @method _bindInputEventHandlers
		 * @private
		 */
		Selectbox.prototype._bindInputEventHandlers = function() {
			var self = this;

			this.$inputElement.on('keypress', function(event) {

				if(!self.options.freeTextMode){
					event.preventDefault();
				}
				
				if( self.options.useSearchInput && event.keyCode >= 48 ){
					self.dropdown && self.dropdown.open();

					if(self.$searchInput){
						var keychar = self.getKeyChar(event);
						keychar && self.$searchInput.val(keychar);
												
						self.actionFilter(self.$searchInput.val());
						self.$searchInput[0].blur();
						self.$searchInput[0].focus();
					}
				}
			});

			this.$inputElement.on('keydown', function(event) {
				if (self.options.useSearchInput && 
					(event.keyCode === keys.backspace
					|| event.keyCode === keys.del)
				) {
					event.preventDefault();
				};
			});
		}

		Selectbox.prototype.getKeyChar = function(event) {
			if (event.which == null) {
				return String.fromCharCode(event.keyCode) // IE
			} else if (event.which!=0 && event.charCode!=0) {
				return String.fromCharCode(event.which)   // the rest
			} else {
				return null // special key
			}
		}


		Selectbox.prototype.getInput = function(){	
			return this.$inputElement;
		};

		/**
		 * Set dataset. Supply selectbox with data from array or http service
		 *
		 * @method setDataset
		 * @param {xpsui:DataDatasetFactory} dataset
		 * @return {Object} this
		 */
		Selectbox.prototype.setDataset = function(dataset){
			var self = this;
			this.dataset = dataset;

			this.dataset.setOptions({
				beforeLoad: function(dataSet){
					self.onBeforeLoad();
				},
				loaded: function(dataSet, newData){
					self.onLoaded(newData);
				},
				reset: function(){
					self.onReset();
				}
			});

			return this;
		};

		/**
		 * Get dataset
		 * @return {xpsui:DataDatasetFactory} 
		 */
		Selectbox.prototype.getDataset = function(){
			return this.dataset ;
		};

		/**
		 * Set dropdown. Selectbox options list is rendered into the dropdown pop-up
		 *
		 * @method setDropdown
		 * @param {xpsui:DropdownFactory} dropdown option list is rendered into the dropdown pop-up
		 */
		Selectbox.prototype.setDropdown = function(dropdown){
			var self = this;

			/**
			 * Dropdown
			 * 
			 * @property dropdown
			 * @type {xpsui:DropdownFactory} 
			 */
			this.dropdown = dropdown;
			
			dropdown.afterOpen = function(){
				self.open();
			};
		};

		/**
		 * Open method is called after the dropdown is opened.
		 *
		 * @method open
		 * @return {[type]} [description]
		 * @private
		 */
		Selectbox.prototype.open = function(){
			var isRendered = this.isRendered;

			this.renderTo(this.dropdown.getContentElement());

			if(this.options.useSearchInput && this.$searchInput.val()){
				this.$searchInput.val('');
				this.doReset();
				this.doLoad();
			}

			if(this.options.useSearchInput){
				this.$searchInput[0].focus();
			} else if(!this.options.freeTextMode) {
				this.$selectboxElement[0].focus();
			}
							
			this.$itemsElement[0].scrollTop = 0;
			this.$itemsElement[0].scrollLeft = 0;	
			this.unselectItem();
		};

		Selectbox.prototype.loading = function(){
			this.dataset.getData();
		};

		/**
		 * Remove selected class from option list
		 *
		 * @method unselectItem
		 */
		Selectbox.prototype.unselectItem = function(){
			angular.element(
				this.$element[0].querySelector('.x-selected')
			).removeClass('x-selected');
		};

		/**
		 * Select and mark the selected item
		 *
		 * @method selectItem
		 * @param  {angular.element} $el otion item
		 * @protected
		 */
		Selectbox.prototype.selectItem = function($el){
			this.unselectItem();
			this.selected = $el.data('index');
			$el.addClass('x-selected');

			if( this.selected >= this.dataset.data.length - this.options.pagingItemsBuffer ){
				this.doPaging();
			} 
		};

		/**
		 * Set element where the option list will be rendered
		 * 
		 * @method setRootElement
		 * @param {angular.element} element
		 */
		Selectbox.prototype.setRootElement = function(element){

			/**
			 * Dropdow pop-up element
			 *
			 * @property $rootElement
			 * @type {angular.element}
			 */
			this.$rootElement = element;

			return this;
		};

		Selectbox.prototype.getRootElement = function(element){
			return this.$rootElement;
		};
		
		Selectbox.prototype.renderInit = function(){
			var self = this;

			if(!this.isRendered){
				this.isRendered = true;
				
				this.$selectboxElement = angular.element('<div class="x-selectbox"></div>');
				this.$selectboxElement.attr('tabindex', -1);
				this._bindEventHandlers(this.$selectboxElement);

				this.renderSearch();

				this.$itemsElement = angular.element('<div class="x-selectbox-items"></section>');
				this.$selectboxElement.append(this.$itemsElement);
				this._handleScrollEvent();

				this.renderInfo();

				this.getRootElement().append(this.$selectboxElement);

				this.doLoad();
			}
		};

		/**
		 * Hendle list item scroll event. It is used for paging.
		 *
		 * @method _handleScrollEvent
		 * @private
		 */
		Selectbox.prototype._handleScrollEvent = function(){
			var self = this;
			this.$itemsElement.on('scroll',function(){
				if (this.scrollHeight - this.scrollTop <= this.offsetHeight + self.options.pagingScrollBuffer) {
					self.doPaging();
				}
			});
		};

		/**
		 * Do and load next batch of data
		 *
		 * @method doPaging
		 * @private
		 */
		Selectbox.prototype.doPaging = function(){
			if(!this._startPaging){
				this._startPaging = true;
				this.doLoad();
			}
		};

		/**
		 * Method call load method of dataset
		 *
		 * @method doLoad
		 * @private
		 */
		Selectbox.prototype.doLoad = function(){
			this.dataset.load();
		};

		/**
		 * Reset data from dataset. Method call rest method of dataset
		 * 
		 * @method doReset
		 * @private
		 */
		Selectbox.prototype.doReset = function(){
			this.dataset.reset();
		};

		/**
		 * Listen on dataset before load event. See this.setDataset()
		 * 
		 * @method onBeforeLoad
		 * @private
		 */
		Selectbox.prototype.onBeforeLoad = function(){
			this.setInfoText($translate.instant('psui.selectbox.loading'));
			this.setInfoNumFromText('');
			this.$element.addClass('x-loading');
		};

		/**
		 * Listen on dataset loaded event. See this.setDataset()
		 * 
		 * @method onLoaded
		 * @param  {Array} newData option values
		 * @private
		 */
		Selectbox.prototype.onLoaded = function(newData){
			this.renderItems(newData);
			this.$element.removeClass('x-loading');
			this.setInfoNum();
			this._startPaging = false;
		};

		/**
		 * Listen on dataset reset event.
		 * 
		 * @method onReset
		 * @private
		 */
		Selectbox.prototype.onReset = function(){
			this.selected = null;
			this._startPaging = false;
			if( this.$itemsElement.length ){
				this.$itemsElement.empty();
			}
		};

		/**
		 * Render search input area
		 * 
		 * @method  renderSearch
		 * @private
		 */
		Selectbox.prototype.renderSearch = function(){
			if(this.options.useSearchInput){
				this.$element.addClass('x-selectobx-search-enabled');
				var $header = angular.element('<header></header>');
				this.$searchInput = angular.element('<input></input>');
				this.$searchInput.attr('tabindex', -1);
				this._bindEventHandlers(this.$searchInput);
				$header.append(this.$searchInput);
				this.$selectboxElement.append($header);
			}
		};

		/**
		 * Render footer info about how many options is actually loaded
		 * 
		 * @method renderInfo
		 * @protected
		 */
		Selectbox.prototype.renderInfo = function(){
			if(this.options.showInfo){
				var $footer= angular.element('<footer></footer>');

				this.$infoTextElement = angular.element('<span></span>');
				$footer.append(this.$infoTextElement);
				this.$infoElement = angular.element('<span></span>');
				$footer.append(this.$infoElement);
				this.$selectboxElement.append($footer);
			}
		};

		Selectbox.prototype.setInfoText = function(text){
			if (this.$infoTextElement) {
				this.$infoTextElement.text(text);
			}
		};

		Selectbox.prototype.setInfoNumFromText = function(value){
			if (this.$infoElement) {
				this.$infoElement.text(value);
			}
		};
		
		Selectbox.prototype.setInfoNum = function(){
			if (this.$infoElement) {
				this.setInfoText($translate.instant('psui.selectbox.rows'));
				this.$infoElement.text(this.dataset.data.length + 
					(!this.dataset.loadDone ? "+" : "")
				);
			}
		};

		/**
		 * Render items 
		 * 
		 * @method  renderItems
		 * @param  {Array} data array of values from dataset
		 * @private
		 */
		Selectbox.prototype.renderItems = function(data){
			var self = this;
			var offset = this.dataset.getOffset();
			for (var i = 0; i < data.length; i++) {
				var $item = this.generateElement(data[i]);
				$item.addClass('x-item');
				$item.data('index', offset++);
				$item.attr('tabindex', -1);
				
				this.$itemsElement.append($item);
				this._bindEventHandlers($item);
			}
		};

		/**
		 * Get option item element
		 * 
		 * @method  generateElement
		 * @param  {Number|String} item  value of one option item
		 * @protected
		 * @return {angular.element} 
		 */
		Selectbox.prototype.generateElement = function(item) {
			if (typeof item === 'string') {
				return angular.element('<div>' + item + '</div>');
			} else if ((typeof item === 'object') && (typeof item.k !== 'undefined') && (typeof item.v !== 'undefined')) {
				return angular.element('<div>'+ item.v + '</div>');
			}
		};

		/**
		 * Handle events as mouseover, click, keydown, focus, blur of each option item
		 * 
		 * @method _bindEventHandlers
		 * @param  {Array} $items array of option item
		 * @private
		 */
		Selectbox.prototype._bindEventHandlers = function($items) {
			var self = this;

			// bind a mouseover handler
			$items.on('mouseover', function(e) {
				return self._handleMouseover(angular.element(this), e);
			});


			// bind a click handler
			$items.on('click', function(e) {
				return self._handleClick(angular.element(this), e);
			});

			// bind a keydown handler
			$items.on('keydown', function(e) {
				return self._handleKeyDown(angular.element(this), e);
			});

			// bind a focus handler
			$items.on('focus', function(e) {
				return self._handleFocus(angular.element(this), e);
			});

			// bind a blur handler
			$items.on('blur', function(e) {
				return self._handleBlur(angular.element(this), e);
			});
		};

		/**
		 * Handle option item focus event
		 * 
		 * @method _handleFocus
		 * @param  {angular.element} $el   option item
		 * @param  {Event} event
		 * @private
		 */
		Selectbox.prototype._handleFocus = function($el, event){
			this.dropdown && this.dropdown.cancelClosing();
			if($el.hasClass('x-item')){
				this.selectItem($el);
			}
		};
		
		/**
		 * Handle option item blur event
		 * 
		 * @method _handleBlur
		 * @param  {angular.element} $el   option item
		 * @param  {Event} event
		 * @private
		 */
		Selectbox.prototype._handleBlur = function($el, event){
			if(this.options.closeOnBlur){
				this.dropdown && this.dropdown.close();	
			}
		};

		/**
		 * Handle option item mouseover event
		 * 
		 * @method _handleMouseover
		 * @param  {angular.element} $el   option item
		 * @param  {Event} event
		 * @private
		 */
		Selectbox.prototype._handleMouseover = function($el, event){
			if($el.hasClass('x-item')){
				//this.selectItem($el);
				$el[0].focus();
			}
		};

		/**
		 * Handle option item click event
		 * 
		 * @method _handleClick
		 * @param  {angular.element} $el   option item
		 * @param  {Event} event
		 * @private
		 */
		Selectbox.prototype._handleClick = function($el, event){
			if($el.hasClass('x-item')){
				this.selectItem($el);
				this.actionSelected();
			}
			event.stopPropagation();
		};

		/**
		 * Set/change position of scroller after move item by key down/up
		 *  
		 * @method _fixScroller
		 * @param  {angular.element} $el actual selected option item
		 * @return {undefined}
		 * @private
		 */
		Selectbox.prototype._fixScroller = function($el){
			var selectedItem = $el[0];
			var itemsElement = this.$itemsElement[0];
			
			// fix from top
			if( selectedItem.offsetTop < itemsElement.scrollTop ) {
				itemsElement.scrollTop = selectedItem.offsetTop;
				return;
			}

			// fix form bottom
			var bottomBorderSelectedItem = selectedItem.offsetTop + selectedItem.offsetHeight;
			var bottomBorderItemsEl = itemsElement.scrollTop + itemsElement.clientHeight;

			if( bottomBorderSelectedItem > bottomBorderItemsEl ) {
				itemsElement.scrollTop += bottomBorderSelectedItem - bottomBorderItemsEl;
			}
		};

		/**
		 * Handle option item keydown event
		 * 
		 * @method _handleClick
		 * @param  {angular.element} $el   option item
		 * @param  {Event} event
		 * @private
		 */
		Selectbox.prototype._handleKeyDown = function($el, event){
			var self = this;

			switch (event.keyCode) {
				case keys.up:
					event.preventDefault();

					if(this.selected === null) {
						this.selected = this.dataset.data.length;
					} else if(this.selected <= 0 ){
						return "";
					}

					var $selectedItem = angular.element(this.$itemsElement.children()[this.selected - 1]);
					this.selectItem($selectedItem);
					this._fixScroller($selectedItem);

					event.stopPropagation();
					break;
				case keys.down: //keys.down
					event.preventDefault();

					if(this.selected === null) {
						this.selected = -1;
					} else if(this.selected + 1 >= this.dataset.data.length ){
						return "";
					}

					var $selectedItem = angular.element(this.$itemsElement.children()[this.selected + 1]);
					this.selectItem($selectedItem);
					this._fixScroller($selectedItem);

					event.stopPropagation();
					break;
				case keys.enter: 
					this.actionSelected();
					event.stopPropagation();
					break
				case keys.escape:
					this.getInput()[0].focus();
					event.stopPropagation();
					break;
				default:
					if(this.$searchInput && $el[0] === this.$searchInput[0]) {
						this.__filterTimeout && $timeout.cancel(this.__filterTimeout);

						this.__filterTimeout = $timeout(function(){
							self.actionFilter(self.$searchInput.val());
						}, this.options.filterTimeout);
						event.stopPropagation();
					}
			}
		};

		/**
		 * Action filter is filter data by value and re-render options
		 *
		 * @method actionFilter
		 * @param  {String} value string to filtered
		 */
		Selectbox.prototype.actionFilter = function(value){
			this.dataset.setSearchValue(value);
			this.doLoad();
		};


		/**
		 * Called after item is selected by user. 
		 * Method call callback this.options.onSelected()
		 * 
		 * @method actionSelected
		 * @private
		 */
		Selectbox.prototype.actionSelected = function(){
			if(this.selected !== null){
				var val = this.dataset.data[this.selected];
				this.options.onSelected(val);
			}
			
			this.$inputElement[0].focus();
		};

		/**
		 * Render the option list into the element. 
		 * 
		 * @method renderTo
		 * @param  {angular.element} element container element
		 */
		Selectbox.prototype.renderTo = function(element){
			this.setRootElement(element);
			this.render();
		};
		
		/**
		 * Render option item list. this.$rootElement have to be set before.
		 *
		 * @example
		 *     selectobx.setRootElement(element);
		 *     selectobx.render()
		 *
		 * @method render 
		 */
		Selectbox.prototype.render = function(){
			this.renderInit();
		};
		

		return {
			/**
			 * Return controller
			 * 
			 * @property controller
			 * @type {Selectbox}
			 */
			controller: Selectbox,

			/**
			 * Create the selectobx option list
			 *
			 * @method create
			 * @param  {angular.element} element
			 * @param  {Object} options
			 * @return {Selectbox}
			 */
			create : function(element, options) {
				return new Selectbox(element, options);
			}
		}
	
	}]);
}(window.angular));