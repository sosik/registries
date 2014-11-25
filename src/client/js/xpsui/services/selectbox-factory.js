(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:SelectboxFactory', ['xpsui:logging', '$timeout', '$translate',  function(log, $timeout, $translate) {	
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

		function Selectbox($element, options){
			this.$element = $element;
			this.$inputElement  = null;
			this.dataset = null;
			this.isRendered = false;
			this.$searchInput = null;
			this.itemsIndex = [];
			this.selected = null;

			this.options = angular.extend({}, Selectbox.DEFAULTS, options || {} );
		};
		
		Selectbox.DEFAULTS = {
			// show search input
			useSearchInput: true,
			// shearch input keydown - waiting time
			filterTimeout: 20,
			// callback
			onSelected: function(index, key, value){}
		};
		
		Selectbox.prototype.getElement =  function(){
			return this.$element;
		};
		
		Selectbox.prototype.setOptions = function(options){
			angular.extend(this.options, options || {});
		};

		Selectbox.prototype.setInput = function(element){
			var self = this;
			this.$inputElement = element;
			
			this.$inputElement.on('keydown', function(event) {
				if( event.keyCode >= 48 ){
					event.preventDefault();
					self.dropdown && self.dropdown.open();

					if(self.$searchInput){
						self.$searchInput.val(String.fromCharCode(event.keyCode));
						self.actionFilter(self.$searchInput.val());
						self.$searchInput[0].blur();
						self.$searchInput[0].focus();
					}
				}
			});
			
			return this;
		};

		Selectbox.prototype.getInput = function(){	
			return this.$inputElement;
		};

		Selectbox.prototype.setDataset = function(dataset){
			this.dataset = dataset;
			this.resetItems();

			return this;
		}

		Selectbox.prototype.getDataset = function(dataset){
			return this.dataset ;
		}

		Selectbox.prototype.setDropdown = function(dropdown){
			var self = this;
			this.dropdown = dropdown;
			
			dropdown.afterOpen = function(){
				self.open();
			};
		};

		// open selectbox
		Selectbox.prototype.open = function(){
			var isRendered = this.isRendered;

			this.renderTo(this.dropdown.getContentElement());

			if(this.options.useSearchInput && this.$searchInput.val()){
				this.$searchInput.val('');
				this.resetItems();
				this.renderItems();

			}

			if(this.options.useSearchInput){
				this.$searchInput[0].focus();
			} else {
				this.$selectboxElement[0].focus();
			}
							
			this.$itemsElement[0].scrollTop = 0;
			this.$itemsElement[0].scrollLeft = 0;	
			this.unselectItem();
		};

		Selectbox.prototype.unselectItem = function(){
			angular.element(
				this.$element[0].querySelector('.x-selected')
			).removeClass('x-selected');

			this.selected = null;
		};

		Selectbox.prototype.selectItem = function($el){
			this.unselectItem();
			this.selected = $el.data('index');
			$el.addClass('x-selected');
		};


		Selectbox.prototype.resetItems = function(){
			this.itemsIndex = Array.apply(null, {length: this.dataset.data.length})
				.map(Number.call, Number)
			;
		}

		// container where selectbox is rendered. 
		// e.g. dropdown popup
		Selectbox.prototype.setRootElement = function(element){
			return this.$rootElement = element;
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

				this.renderItems();

				this.getRootElement().append(this.$selectboxElement);
			}
		};

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

		Selectbox.prototype.renderItems = function(){
			this.$itemsElement.empty();
			this.unselectItem();

			if (this.itemsIndex.length < 1) {
				return;
			}
			
			var self = this;
			
			for (var i = 0; i < this.itemsIndex.length; i++) {
				var $item = this.generateElement(this.itemsIndex[i]);
				$item.addClass('x-item');
				$item.data('index', i);
				$item.attr('tabindex', -1);
				
				this.$itemsElement.append($item);
				this._bindEventHandlers($item);
			}

		};

		Selectbox.prototype.generateElement = function(index) {
			var itemData = this.dataset.data[index];

			if (typeof itemData === 'string') {
				return angular.element('<div>' + itemData + '</div>');
			} else if ((typeof itemData === 'object') && (typeof itemData.k !== 'undefined') && (typeof itemData.v !== 'undefined')) {
				return angular.element('<div>'+ itemData.v + ' - ' + itemData.k + '</div>');
			}
		};

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

		Selectbox.prototype._handleFocus = function($el, event){
			this.dropdown && this.dropdown.cancelClosing();
			if($el.hasClass('x-item')){
				this.selectItem($el);
			}
		};
		
		Selectbox.prototype._handleBlur = function($el, event){
			this.dropdown && this.dropdown.close();
		};

		Selectbox.prototype._handleMouseover = function($el, event){
			if($el.hasClass('x-item')){
				this.selectItem($el);
			}
		};

		Selectbox.prototype._handleClick = function($el, event){
			if($el.hasClass('x-item')){
				this.selectItem($el);
				this.actionSelected();
			}
			event.stopPropagation();
		};

		Selectbox.prototype._fixScoller = function($el){
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
		}

		Selectbox.prototype._handleKeyDown = function($el, event){
			var self = this;

			switch (event.keyCode) {
				case keys.up:
					event.preventDefault();

					if(this.selected === null) {
						this.selected = this.itemsIndex.length;
					} else if(this.selected <= 0 ){
						return "";
					}

					var $selectedItem = angular.element(this.$itemsElement.children()[this.selected - 1]);
					this.selectItem($selectedItem);
					this._fixScoller($selectedItem);

					event.stopPropagation();
					break;
				case keys.down: //keys.down
					event.preventDefault();

					if(this.selected === null) {
						this.selected = -1;
					} else if(this.selected + 1 >= this.itemsIndex.length ){
						return "";
					}

					var $selectedItem = angular.element(this.$itemsElement.children()[this.selected + 1]);
					this.selectItem($selectedItem);
					this._fixScoller($selectedItem);

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
						//event.preventDefault();
					}
			}
		};

		Selectbox.prototype.actionFilter = function(value){
			this.itemsIndex = [];
			var regExp = new RegExp('^' + value,'i');
			for (var i = 0; i < this.dataset.data.length; ++i) {
				if (typeof this.dataset.data[i] === 'string') {
					if (regExp.test(this.dataset.data[i]))	 {
						this.itemsIndex.push(i);
					}
				} else if (typeof this.dataset.data[i] === 'object' && this.dataset.data[i].k && this.dataset.data[i].v) {
					if (regExp.test(this.dataset.data[i].v)) {
						this.itemsIndex.push(i);
					}
				} else {
					this.itemsIndex.push(i);
				}
			}

			this.renderItems();
		}


		// the item is selected
		Selectbox.prototype.actionSelected = function(){
			if(this.selected !== null){
				var val = this.dataset.data[this.itemsIndex[this.selected]];
				this.options.onSelected(this.selected, val.v, val.k);
			}
			
			this.$inputElement[0].focus();
		};

		Selectbox.prototype.renderTo = function(element){
			this.setRootElement(element);
			this.render();
		};
			
		Selectbox.prototype.render = function(){
			this.renderInit();
		};

		/**
		 * Dataset
		 */

		function Dataset(){
			this.data = [];
		}

		Dataset.prototype.setData = function(data, translateCode){
			if (translateCode) {
				// there are transCodes
				for (var i = 0; i < data.length; i++) {
					this.data.push({
						v: $translate.instant(translateCode[i]),
						k: data.enum[i]
					})
				}
			} else {
				for (var i = 0; i < data.length; i++) {
					this.data.push({
						v: data[i],
						k: data[i]
					})
				}
			}
		}


		return {
			create : function(element, options) {
				return new Selectbox(element, options);
			},
			createDataset: function(){
				return new Dataset();
			}
		}
	
	}]);
}(window.angular));