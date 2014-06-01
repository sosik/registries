'use strict';

angular.module('psui', [])
.factory('psui.dropdownFactory', [function() {
	var PsuiDropdown = function(wrapper) {
		var _isVisible = false;
		var _selected = -1;
		var _dropdown = angular.element('<div class="psui-dropdown psui-hidden"></div>');
		var _dropdownData = [];
		var _eventHandlers = {};

		_dropdown.attr('tabindex', -1);
		wrapper.append(_dropdown);
		/**
		 * Shows dropdown
		 */
		this.show = function() {
			_dropdown.removeClass('psui-hidden');
			_isVisible = true;
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
			_dropdown.children().removeClass('psui-selected');
		};

		this.redraw = function() {
			_dropdown.empty();
			_selected = -1;

			if (_dropdownData.length < 1) {
				this.hide();
				return;
			}

			var that = this;
			for (var i = 0; i < _dropdownData.length; i++) {
				var e = this.generateElement(i);
				e.data('index', i);
				e.on('mouseover click', function(evt) {
					that.unselectAll();
					var element = angular.element(evt.target);
					var index = element.data('index');
					if (index) {
						_selected = index;
					}
					element.addClass('psui-selected');
					that.triggerHandler('psui:changed', {index: index});

					if (evt.type === 'click') {
						that.triggerHandler('psui:confirmed', {index: index});
					}
				});
				_dropdown.append(e);
			}

		};

		/**
		 * This method can be overriden to achieve special element creation
		 */
		this.generateElement = function(index) {
			var d = _dropdownData[index];

			if (d) {
				if ('string' === typeof d) {
					
					return angular.element('<div>' + d + '</div>');
				} else if ('object' === typeof d) {
					// k as key in {k: 'key', v: 'val'}
					if (d.k) {
						return angular.element('<div>' + d.k + '</div>');
					} else {
						for (var k in d) {
							return angular.element('<div>' + d[k] + '</div>');
						}
					}
				}
			} 
			throw new Error('Invalid element');
		};

		/**
		 * Set data for dropdown
		 */
		this.setData = function(data) {
			if (!angular.isArray(data)) {
				throw new Error('Data have to be array');
			}
			_dropdownData = data;
			_selected = -1;
			this.redraw();
		};

		/**
		 * Method changes selected element by index. If paraeter relative is provided
		 * selection is relative to currently selected element.
		 */
		this.change = function(index, relative) {
			if (relative) {
				var newIdx = _selected + index;
			} else {
				var newIdx = index;
			}

			if (_dropdownData[newIdx]) {
				_selected = newIdx;

				this.unselectAll();
				angular.element(_dropdown.children()[newIdx]).addClass('psui-selected');
				this.triggerHandler('psui:changed', {index: newIdx});

				// calculate scroll
				var heightToCurrent = 0;
				for (var i = 0; i < _selected; i++) {
					heightToCurrent += _dropdown.children()[_selected].offsetHeight;
				}

				if (heightToCurrent < _dropdown[0].scrollTop) {
					_dropdown[0].scrollTop = heightToCurrent;
				} else if (heightToCurrent + _dropdown.children()[_selected].offsetHeight > _dropdown[0].scrollTop + _dropdown[0].offsetHeight) {
					_dropdown[0].scrollTop += _dropdown.children()[_selected].offsetHeight;
				}
			}
		};

		this.selected = function() {
			return _selected;
		}

		/**
		 * Registers event handler. If event name is prefixed with "psui:"
		 * it is considered psui event. Otherwise it is delegated to appropriate dom element.
		 *
		 * Handled psui events:
		 * psui:changed - triggered when selection changes
		 * psui:confirmed - triggered when is selection confirmed
		 */
		this.on = function(evtName, func) {
			if (evtName && evtName.indexOf('psui:') === 0) {
				// register local psui events
				_eventHandlers[evtName] = _eventHandlers[evtName] || {};
				_eventHandlers[evtName][func.toString()] = func;
			} else {
				_dropdown.on(evtName, func);
			}
		};

		this.off = function(evtName, func) {
			if (evtName && evtName.indexOf('psui:') === 0) {
				// register local psui events
				_eventHandlers[evtName] = _eventHandlers[evtName] || {};
				if (_eventHandlers[evtName][func.toString()]) {
					delete _eventHandlers[evtName][func.toString()];
				}
			} else {
				_dropdown.off(evtName, func);
			}
		};

		this.triggerHandler = function(evtName, data) {
			_eventHandlers[evtName] = _eventHandlers[evtName] || {};
			for (var handler in _eventHandlers[evtName]) {
				data.name = evtName;
				_eventHandlers[evtName][handler](data);
			}
		};
	};

	return {
		PsuiDropdown : PsuiDropdown
	};
}]);
