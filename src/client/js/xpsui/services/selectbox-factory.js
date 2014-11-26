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
			this.selected = null;

			this.options = angular.extend({}, Selectbox.DEFAULTS, options || {} );
		};
		
		Selectbox.DEFAULTS = {
			// show search input
			useSearchInput: true,
			// shearch input keydown - waiting time
			filterTimeout: 300,
			// info line:
			showInfo: true,
			// callback
			onSelected: function(index, key, value){},
			// onBlur close
			closeOnBlur: true,
			// scroll bufer
			scrollBuffer: 40
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

			return this;
		}

		Selectbox.prototype.setStore = function(store){
			var self = this;

			this.setDataset( new DataSet(store, {
				beforeLoad: function(dataSet){
					self.onBeforeLoad();
				},
				loaded: function(dataSet, newData){
					self.onLoaded(newData);
				},
				reset: function(){
					self.onReset();
				}
			}));
			
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
				this.doReset();
				this.doLoad();
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

		Selectbox.prototype.loading = function(){
			this.dataset.getData();
		};


		Selectbox.prototype.unselectItem = function(){
			angular.element(
				this.$element[0].querySelector('.x-selected')
			).removeClass('x-selected');
		};

		Selectbox.prototype.selectItem = function($el){
			this.unselectItem();
			this.selected = $el.data('index');
			$el.addClass('x-selected');
		};

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
				this._handleScrollEvent();

				this.renderInfo();

				this.getRootElement().append(this.$selectboxElement);

				this.doLoad();
			}
		};

		Selectbox.prototype._handleScrollEvent = function(){
			var self = this;
			this.$itemsElement.on('scroll',function(){
				if (this.scrollHeight - this.scrollTop <= this.offsetHeight + self.options.scrollBuffer) {
		    		self.doLoad();
		  		}
			});
		}

		Selectbox.prototype.doLoad = function(){
			this.dataset.load();
		};

		Selectbox.prototype.doReset = function(){
			this.dataset.reset();
		};

		Selectbox.prototype.onBeforeLoad = function(){
			this.setInfoText($translate.instant('Loading...'));
			this.setInfoNumFromText('');
			this.$element.addClass('x-loading');
		};

		Selectbox.prototype.onLoaded = function(newData){
			this.renderItems(newData);
			this.$element.removeClass('x-loading');
			this.setInfoNum();
		};

		Selectbox.prototype.onReset = function(){
			this.selected = null;
			if( this.$itemsElement.length ){
				this.$itemsElement.empty();
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
				this.setInfoText($translate.instant('Rows'));
				this.$infoElement.text(this.dataset.data.length + 
					(!this.dataset.loadDone ? "+" : "")
				);
			}
		};

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

		Selectbox.prototype.generateElement = function(item) {
			if (typeof item === 'string') {
				return angular.element('<div>' + item + '</div>');
			} else if ((typeof item === 'object') && (typeof item.k !== 'undefined') && (typeof item.v !== 'undefined')) {
				return angular.element('<div>'+ item.v + '</div>');
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
			if(this.options.closeOnBlur){
				this.dropdown && this.dropdown.close();	
			}
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
						this.selected = this.dataset.data.length;
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
					} else if(this.selected + 1 >= this.dataset.data.length ){
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
					}
			}
		};

		Selectbox.prototype.actionFilter = function(value){
			this.dataset.setSearchValue(value);
			this.doLoad();
		}


		// the item is selected
		Selectbox.prototype.actionSelected = function(){
			if(this.selected !== null){
				var val = this.dataset.data[this.selected];
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
		 * DataSet
		 */
		function DataSet(store, options){
			this.store = store;
			this.options = angular.extend({}, DataSet.DEFAULTS, options || {} );

			this.data = [];

			// offset of paging  
			// e.g. n * this.option.limit
			this.offset = 0;
			// serach value
			this.serachValue = null;
			// load paging
			this.loadDone = false;
		};

		DataSet.DEFAULTS = {
			limit: 100,
			beforeLoad: function(dataSet){},
			loaded: function(dataSet, newData){},
			reset: function(){},
		};

		// get limit plus one
		DataSet.prototype.getLimit = function(value){
			return this.options.limit + 1;
		};

		DataSet.prototype.getOffset = function(value){
			return this.offset * this.options.limit;
		};

		DataSet.prototype.getSearchValue = function(){
			return this.serachValue;
		};

		DataSet.prototype.setSearchValue = function(value){
			this.reset();
			this.serachValue = value;
			return this;
		};

		DataSet.prototype.reset = function(){
			this.data = [];
			this.loadDone = false;
			this.offset = 0;
			this.serachValue = null;
			this.options.reset();
			return this;
		};

		DataSet.prototype.load = function(){
			var self = this;
			if (!this.loadDone) {
				
				this.options.beforeLoad(this);

				this.store.load(this, function(data){
					self.loaded(data);
				});
			}
		};

		DataSet.prototype.loaded = function(data){
			if(data.length <= this.options.limit){
				this.loadDone = true;
			} else {
				// remove limit plus one element
				data.pop();
			}
			
			this.data = this.data.concat(data);
			this.options.loaded(this,data);
			this.offset++;
		}

		/**
		 * ArrayStore
		 */

		function ArrayStore(){
			this.data = [];
		};

		ArrayStore.prototype.setData = function(data, translateCode){
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
		};

		ArrayStore.prototype.load = function(dataset, callback){
			var self = this;

			this.timeout && $timeout.cancel(this.timeout);

			this.timeout = $timeout(function(){
				var data = [];

				var regExp = new RegExp('^' + (dataset.getSearchValue() || '') ,'i');
				for (var i = 0; i < self.data.length; ++i) {
					if (regExp.test(self.data[i].v)) {
						data.push(self.data[i]);
					}
				}

				callback(
					data.slice(dataset.getOffset(), dataset.getLimit() + dataset.getOffset())
				);
			}, 0);
		};

		return {
			create : function(element, options) {
				return new Selectbox(element, options);
			},
			createArrayStore: function(){
				return new ArrayStore();
			}
		}
	
	}]);
}(window.angular));