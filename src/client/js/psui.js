angular.module('psui', [])
/**
 * @ngService psui.dropdownService
 *
 * ```
 * {
 * 		visible {bool} <- if is dropdown visible at construction time
 * 		searchaable {bool} <- defines, if dropdown should contain search text box
 * }
 * ```
 */
.service('psui.dropdownFactory', ['$timeout', function($timeout) {
	var Dropdown = function(options) {
		options = options || {};
		var _isVisible = options.visible || false;
		var _useSearchInput = options.searchable || false;
		var _dropdown = angular.element('<div class="psui-dropdown"></div>');
		var _itemsHolder = angular.element('<section></section>');
		var _selected = -1;
		var _data = [];
		var _actualData = [];
		var _searchInput = null;
		var hideDropdown;
		var actualIndex;

		_dropdown.append(_itemsHolder);

		// search text box
		if (_useSearchInput) {
			var _searchInputWrapper = angular.element('<header></header>');
			_searchInput = angular.element('<input class="form-control"></input>');
			_searchInputWrapper.append(_searchInput);
			_dropdown.prepend(_searchInputWrapper);

			var _oldVal = '';
			var that = this;
			_searchInput.on('keyup mouseup', function(evt) {
				evt.preventDefault();
				if (_searchInput.val() === _oldVal) {
					//nothing changed
					return;
				}

				_oldVal = _searchInput.val();
				
				that.onSearchChanged(_searchInput.val());
				
			});
		}

		/**
		 * Shows dropdown
		 */
		this.show = function() {
			if (_isVisible) {
				// already visible, do nothing
				return;
			}
			_dropdown.removeClass('psui-hidden');
			_isVisible = true;
			this.unselectAll();
			if (_searchInput) {
				_searchInput.val('');
				this.resetActualData();
				_searchInput[0].focus();
			}

			// reset scroll
			_itemsHolder[0].scrollTop = 0;
			_itemsHolder[0].scrollLeft = 0;
		};

		/**
		 * Hides dropdown
		 */
		this.hide = function() {
			_dropdown.addClass('psui-hidden');
			_isVisible = false;
		};

		/**
		 * Returns actual visibility state of dropdown
		 */
		this.isVisible = function() {
			return _isVisible;
		};

		/**
		 * Removes selection from dropdown, after invocation
		 * of this method there will be no element celected.
		 */
		this.unselectAll = function() {
			_itemsHolder.children().removeClass('psui-selected');
			_selected = -1;
		};

		/**
		 *	Handles change of active element (mouse moves on elements)
		 *	@param {number} index - index of data item overtaking selection
		 */
		this.onActiveChanged = function() {
			// do someting
			return;
		};

		/**
		 * Handles selection of element, can be overrinden
		 * @param {number} index - index of selected item in _data array
		 */
		this.onSelected = function() {
			this.hide();
		};

		/**
		 * Handles changes in search expression, can be overriden
		 * @param {number} search - current value of search expression
		 */
		this.onSearchChanged = function(search) {
			_actualData = [];
			var re = new RegExp('^' + search,'i');
			for (var i = 0; i < _data.length; ++i) {
				if (typeof _data[i] === 'string') {
					if (re.test(_data[i]))	 {
						_actualData.push(i);
					}
				} else if (typeof _data[i] === 'object' && _data[i].k && _data[i].k) {
					if (re.test(_data[i].v)) {
						_actualData.push(i);
					}
				} else {
					_actualData.push(i);
				}
			}

			this.redraw();
		}

		/**
		 * Redraw actual dropdown elements
		 */
		this.redraw = function() {
			_itemsHolder.empty();
			_selected = -1;

			if (_actualData.length < 1) {
				//this.hide();
				return;
			}
			console.log('tututu');
			var that = this;
			for (var i = 0; i < _actualData.length; i++) {
				var e = this.generateElement(_actualData[i]);
				e.data('index', _actualData[i]);
				e.attr('tabindex', -1);
				e.on('mouseover', function(evt) {
					
					that.unselectAll();
					var element = angular.element(evt.currentTarget);
					var index = element.data('index');
					if (typeof index !== 'undefined') {
						_selected = index;
						element.addClass('psui-selected');
						that.onActiveChanged(index);
					}
				});
				
				e.on('focus', function(evt){
					
					//$timeout.cancel(hideDropdown);
					that.cancelTimeout();
				})
				
				e.on('click', function(evt) {
					var element = angular.element(evt.currentTarget);
					var index = element.data('index');
					if (typeof index !== 'undefined') {
						_selected = index;
						that.onSelected(index);
					}
				})
				
				_itemsHolder.append(e);
			}
		};

		/**
		 * This method can be overriden to achieve special element creation
		 */
		this.generateElement = function(index) {
			var d = _data[index];
			//console.log(d);
			if (typeof d === 'string') {
				return angular.element('<div>' + d + '</div>');
			} else if ((typeof d === 'object') && (typeof d.k !== 'undefined') && (typeof d.v !== 'undefined')) {
				return angular.element('<div>'+ d.v + ' - ' + d.k + '</div>');
			} else if ((typeof d === 'object') && (typeof d.refData !== 'undefined')){
				//console.log('jo')
				//console.log(d.refData[0]);
				var table,tr;
				tr = angular.element('<tr></tr>');
				table = angular.element('<table style="width:100%; table-layout: fixed;"></table>');
				var count = 0;
				for (var i in d.refData) {
					if (typeof d.refData[i] === 'string') {		
						++count;
					}
				}
				for (var i in d.refData){
					if (typeof d.refData[i] === 'string') {
						var displayText = angular.element('<td style="width: '+100/count+'%;">' + d.refData[i] + '</td>');
						tr.append(displayText);
					}
				}
				table.append(tr);
				var div = angular.element('<div></div>');
				div.append(table);
				return div;
			}
		};

		/**
		 * Method resets actual data to contain all data.
		 */
		this.resetActualData = function() {
			_actualData = [];
			for (var i = 0; i < _data.length; ++i) {
				_actualData.push(i);
			}
		}

		/**
		 * Set actual data for dropdown
		 */
		this.setData = function(data) {
			if (!angular.isArray(data)) {
				throw new Error('Data has to be array');
			}
			_data = data;
			this.resetActualData();
			//console.log('bhh' + _actualData);
			_selected = -1;
			this.redraw();
		};

		/**
		 * Returns dropdown DOM element wrapped as angular element
		 */
		this.getDropdownElement = function() {
			return _dropdown;
		}
		
		/**
		 * Select value in dropdown with keys
		 */
		_dropdown.on('keydown', function(evt) {
			switch (evt.keyCode) {
				case 40: // key down
					var sel = _selected;
					that.unselectAll();
					_selected = sel;
					_selected++;
					if (_selected > _actualData.length - 1){
						_selected--;
					}
					var elm = angular.element(_itemsHolder.children()[_selected]);
					elm.addClass('psui-selected');
					var offsetHeight = elm[0].offsetHeight;
					if (_itemsHolder[0].scrollTop > _selected * offsetHeight - 4*offsetHeight && _itemsHolder[0].scrollTop < _selected * offsetHeight) {
					} else {
						_itemsHolder[0].scrollTop = _selected * offsetHeight - 4*offsetHeight;
					}
					actualIndex = elm.data('index');
					evt.preventDefault();
					break;
				case 38: // key up
					var sel = _selected;
					that.unselectAll();
					_selected = sel;
					_selected--;
					if (_selected < 0){
						_selected++;
					}
					var elm = angular.element(_itemsHolder.children()[_selected]);
					elm.addClass('psui-selected');
					var offsetHeight = elm[0].offsetHeight;
					if (_itemsHolder[0].scrollTop < _selected * offsetHeight && _itemsHolder[0].scrollTop > _selected * offsetHeight - 5 * offsetHeight) {
					} else {
						_itemsHolder[0].scrollTop = _selected * offsetHeight;
					}
					actualIndex = elm.data('index');
					evt.preventDefault();
					break;
				case 13: // key enter
					that.onSelected(actualIndex);
					evt.preventDefault();
					break;
				case 9: // key tab
					that.onSelected(actualIndex);
					evt.preventDefault();
					break;
			}
			// any other key
		});
		
		var close = function(){
			that.hide();
		}
		
		this.cancelTimeout = function(){
			$timeout.cancel(hideDropdown);
		};
		
		this.searchInputValue = function(){
			console.log(_searchInput.val());
			return _searchInput.val();
		};
		
		_searchInput.on('blur', function(evt){
			hideDropdown = $timeout(close, 5, false);
		});
		
		
		
		if (_isVisible) {
			this.show();
		} else {
			this.hide();
		}


	};

	return {
		createDropdown : function(options) {
			return new Dropdown(options);
		}
	}
}])
.directive('psuiAccordionElement', [function() {
	return {
		restrict: 'A',
		scope: true,
		compile: function(elm, attrs) {
			var titleHolder = angular.element('<div href="#" ng-click="titleClick()"></div>');

			var titleElm = angular.element('<span></span>');

			if (attrs.title) {
				titleHolder.prepend(titleElm);
			}

			if (attrs.iconClass) {
				titleHolder.prepend('<i class="'+attrs.iconClass+'"></i>');
			}

			elm.prepend(titleHolder);

			return function(scope, elm, attrs) {
				scope.accordion = {};
				scope.accordion.active = false;

				if (attrs.title) {
					titleElm.text(attrs.title);
					attrs.$observe('title', function(newVal) {
						titleElm.text(newVal);
					});
				}

				var toggleActivity = function() {
					if (scope.accordion.active) {
						elm.removeClass('psui-accordion-active');
						scope.accordion.active = false;
					} else {
						elm.addClass('psui-accordion-active');
						scope.accordion.active = true;
					}
				};

				if (scope.accordion.active) {
						elm.addClass('psui-accordion-active');
				}

				scope.titleClick = function() {
					toggleActivity();
				};
			};
		},
	};
}]);
