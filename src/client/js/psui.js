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
.service('psui.dropdownFactory', [function() {
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
				if (re.test(_data[i]))	 {
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

			var that = this;
			for (var i = 0; i < _actualData.length; i++) {
				var e = this.generateElement(_actualData[i]);
				e.data('index', _actualData[i]);
				e.on('mouseover', function(evt) {
					that.unselectAll();
					var element = angular.element(evt.target);
					var index = element.data('index');
					if (typeof index !== 'undefined') {
						_selected = index;
						element.addClass('psui-selected');
						that.onActiveChanged(index);
					}
				});

				e.on('click', function(evt) {
					var element = angular.element(evt.target);
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

			if (typeof d === 'string') {
				return angular.element('<div>' + d + '</div>');
			} else if ((typeof d === 'object') && (typeof d.k !== 'undefined') && (typeof d.v !== 'undefined')) {
				return angular.element('<div>'+ d.v + ' - ' + d.k + '</div>');
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
			_selected = -1;
			this.redraw();
		};

		/**
		 * Returns dropdown DOM element wrapped as angular element
		 */
		this.getDropdownElement = function() {
			return _dropdown;
		}

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
