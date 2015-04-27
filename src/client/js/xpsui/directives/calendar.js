(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	/**
	 * Render and manages calendar picker
	 *
	 * Example:
	 *
	 *     <div xpsui-date-edit xpsui-calendar xpsui-schema="schema.path" ng-model="model.path"></div>
	 *
	 * @module  client
	 * @submodule directives
	 * @class  xpsuiCalendar
	 */
	.directive('xpsuiCalendar',['xpsui:logging', 'xpsui:DateUtil', '$translate', 'xpsui:DropdownFactory', function(log, dateUtil, $translate, dropdownFactory) {
		var keys = {
	            tab:      9,
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
	            asterisk: 106
	    };
	    
	    /**
		 * Generate and manage calendar. The calnedar contains header and calendar (year, month, day) buttons. 
		 *
		 * Example:
		 *
		 *      xpsuiDatapickerCtrl.setRootElement(elm);
		 *      xpsuiDatapickerCtrl.setInput(xpsuiTextInputCtrl.getInput());
		 *      xpsuiDatapickerCtrl.setDropdown(dropdown);
		 *      xpsuiDatapickerCtrl.render();
		 * 
		 * @method component
		 * @constructor
		 * @todo  create factory like xpsui:SelectboxFactory
		 */
		var component = function(){
			/**
			 * Object settings
			 *
			 * @property options
			 * @extends {Dropdown.DEFAULTS}
			 * @type {Object}
			 */
			this.options = angular.extend({}, component.DEFAULTS);
			
			/**
			 * Selected value
			 *
			 * @property value
			 * @type {Date} 
			 */
			this.value;
			
			// date for render layout - date is using layout functions
			/**
			 * Date for render layout. Date is using layout functions
			 *
			 * @property date
			 * @type {Date} 
			 * @private
			 */
			this.date;
			
			/**
			 * Is rendered flag
			 * 
			 * @property isRendered
			 * @type {Boolean} 
			 */
			this.isRendered = false;
			
			/**
			 * Dropdown
			 * 
			 * @property dropdown
			 * @type {xpsui:DropdownFactory} 
			 */
			this.dropdown = false;
		};
		
		component.DEFAULT = {
			/**
			 * callback when date is selected
			 *
			 * @param date Date
			 */
			onSelected: function(date){}
		};

		component.prototype.setOptions = function(options){
			angular.extend(this.options, options || {});
		};
		
		/**
		 * Set directive input and listen on change event
		 *
		 * @method setInput
		 * @param {angular.element} input directive's input element
		 * @return {object} this
		 */
		component.prototype.setInput = function(element){
			var self = this;
			this.$inputElement = element;
			
			this.$inputElement.on('change',function(){
				var value = dateUtil.parser(
					angular.element(this).val()
				);

				if (value) {
					self.setValue(value);
					self.render();
				}
			});
			
			return this;
		};
		
		component.prototype.getInput = function(){
			return this.$inputElement;
		};
		
		component.prototype.setDate = function(value){
			this.date = new Date(value.getTime()) ;
		};
		
		component.prototype.getDate = function(value){
			if(this.date === null || this.date === undefined){
				this.setDate(this.value ? this.value : new Date());
			}
			return this.date;
		};
		
		component.prototype.setValue = function(value){
			if(angular.isUndefined(value)){
				return this;
			}
			
			if(typeof value === 'string'){
				value = dateUtil.getDateFromYYYYMMDD(value);
			}
			this.value = new Date(value.getTime()) ;
			return this;
		};
		
		/**
		 * Set element where the calendar will be rendered
		 * 
		 * @method setRootElement
		 * @param {angular.element} element
		 */
		component.prototype.setRootElement = function(element){
			/**
			 * Element container where the calendar is rendered
			 *
			 * @property $rootElement
			 * @type {angular.element}
			 */
			this.$rootElement = element
			return this;
		};
		
		component.prototype.getRootElement = function(){
			return this.$rootElement;
		};
		
		component.prototype.setDropdown = function(dropdown){
			var self = this;
			this.dropdown = dropdown;
			
			dropdown.afterOpen = function(){
				self.renderTo(dropdown.getContentElement());
				self.setFocus(self.$element);
			};
		};
		
		component.prototype.setFocus = function($el){
			$el[0].focus();
			if (this.$element[0] === $el[0]) {
				this.$focusElement = null;
			} else {
				this.$focusElement = $el;
			}
		};
		
		/**
		 * 
		 * @returns Date
		 */
		component.prototype.getValue = function(){
			return this.value;
		};
		
		/**
		 * Handle events as mouseover, click, keydown, focus, blur of each calendar item
		 * 
		 * @method _bindEventHandlers
		 * @param  {Array} $items array of calendar elements
		 * @private
		 */
		component.prototype._bindHandlers = function($items) {
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
			
			this.resetTabElemens();
		};

		/**
		 * Handle mouseover event
		 * 
		 * @method _handleMouseover
		 * @param  {angular.element} $el  Element
		 * @param  {Event} event
		 * @private
		 */
		component.prototype._handleMouseover = function($el, event){
			this.setFocus($el);
			event.stopPropagation();
		};
		
		/**
		 * Handle click event
		 * 
		 * @method _handleClick
		 * @param  {angular.element} $el  Element
		 * @param  {Event} event
		 * @private
		 */
		component.prototype._handleClick = function($el, event){
			this._handleActions($el);
			event.stopPropagation();
		};
		
		/**
		 * Handle keydown event
		 * 
		 * @method _handleKeyDown
		 * @param  {angular.element} $el  Element
		 * @param  {Event} event
		 * @private
		 */
		component.prototype._handleKeyDown = function($el, event){
			switch (event.keyCode) {
				case keys.up:
					this.previousAction();
					this.setFocus(this.$element);
					event.stopPropagation();
					break;
				case keys.down: //keys.down
					this.nextAction();
					this.setFocus(this.$element);
					event.stopPropagation();
					break;
				case keys.right: //keys.right
					if(!this.$focusElement){
						this.setFocus(
							angular.element(this.getTabElements()[0])
						);
					} else {
						var index = this.indexOfTabElements(this.$focusElement[0]);
						if(index === this.getTabElements().length - 1 ){
							index = 0;
						} else {
							index++;
						}
						this.setFocus(
							angular.element( 
								this.getTabElements()[index]
							)
						);
					}
					event.stopPropagation();
					break;
				case keys.left://keys.left
					if(!this.$focusElement){
						this.setFocus(
							angular.element(this.getTabElements()[0])
						);
					} else {
						var index = this.indexOfTabElements(this.$focusElement[0]);
						if(!index){
							index = this.getTabElements().length - 1;
						} else {
							index--;
						}
						this.setFocus(
							angular.element( 
								this.getTabElements()[index]
							)
						);
					}
					
					event.stopPropagation();
					break;
				case keys.enter: 
					this._handleActions($el);
					event.stopPropagation();
					break
				case keys.escape:
					this.getInput()[0].focus();
					event.stopPropagation();
					break;
			}
		};
		
		/**
		 * Handle focus event
		 * 
		 * @method _handleFocus
		 * @param  {angular.element} $el  Element
		 * @param  {Event} event
		 * @private
		 */
		component.prototype._handleFocus = function($el, event){
			this.dropdown && this.dropdown.cancelClosing();
		};
		
		/**
		 * Handle blur event
		 * 
		 * @method _handleBlur
		 * @param  {angular.element} $el  Element
		 * @param  {Event} event
		 * @private
		 */
		component.prototype._handleBlur = function($el, event){
			this.dropdown && this.dropdown.close();
		};
		
		/**
		 * Handle click on a callendar button
		 * 
		 * @method _handleBlur
		 * @param  {angular.element} $el  Element
		 * @param  {Event} event
		 * @private
		 */
		component.prototype._handleActions = function($el){
			switch($el[0]){
				case this.$previousActionElement[0]:
					this.previousAction();
					//this.setFocus(this.$element);
					break;
				case this.$nextActionElement[0]:
					this.nextAction();
					//this.setFocus(this.$element);
					break;
				case this.$currentDayActionElement[0]:
					this.currentDayAction();
					//this.setFocus(this.$element);
					break;
				case this.$headerActionElement[0]:
					this.headerAction();
					if(this.doLayout === this.yearlyLayout){
						this.setFocus(this.getFirstTabElement());
					}
					//this.setFocus(this.$element);
					break;
				default:
					if($el.hasClass('x-year')){
						this.date.setFullYear($el.data('date').getFullYear());
						this.monthlyLayout();
						this.setFocus(this.getFirstTabElement());
					} else if($el.hasClass('x-month')){
						this.date.setMonth($el.data('date').getMonth());
						this.dailyLayout();
						this.setFocus(this.getFirstTabElement());
					} else if($el.hasClass('x-day') && $el.data('date')){
						// this.getInput().val(
						// 	dateUtil.formatter($el.data('date'))
						// );
						this.setValue($el.data('date'));
						this.options.onSelected($el.data('date'));

						this.getInput()[0].focus();
					}
			}
		};
		
		/**
		 * Init render
		 * 
		 * @method _renderInit
		 * @private
		 */
		component.prototype._renderInit =  function(){
			var self = this;
			if(!this.isRendered){
				this.isRendered = true;
				
				this.$element = angular.element('<div class="x-calendar"></div>');
				
				this.$element.attr('tabindex', '0');
				if(this.dropdown){
					this.$element.attr('tabindex', '-1');
				}
				
				this.getRootElement().append(this.$element);
				this._bindHandlers(this.$element);

				this._controllsInit();

				this.$contentElement =  angular.element('<table></table>');
				this.$element.append(this.$contentElement);
			}
		};
		
		component.prototype.resetTabElemens =  function(){
			/**
			 * Contain all callendar layout button
			 * 
			 * @property $tabElements
			 * @type {Array}
			 */
			this.$tabElements = angular.element(
				this.$element[0].querySelectorAll('[tabindex]')
			);
		};
		
		component.prototype.indexOfTabElements = function(value){
			var index = 0;
			angular.forEach(this.getTabElements(),function(val, key){
				if (val === value) {
					index =  key;
					return false;
				}
			});
			return index;
		};
		
		/**
		 * Get all callendar action elements
		 * @method  getTabElements
		 * @return {angular.element} Elements
		 */
		component.prototype.getTabElements = function(){
			return this.$tabElements;
		};
		
		/**
		 * Get first tab element
		 * 
		 * @method  getFirstTabElement
		 * @return {angular.element} Element
		 */
		component.prototype.getFirstTabElement = function(){
			return angular.element(this.$contentElement[0].querySelector('[tabindex]'));
		};
		
		/**
		 * Init controlls buttons
		 * 
		 * @method  _controllsInit
		 * @private
		 */
		component.prototype._controllsInit = function(){
			var self = this;
			this.$controllElement =  angular.element('<div class="x-controlls"></div>');
			this.$element.append(this.$controllElement);
			
			
			var $container =  angular.element('<div class="x-controlls-header"></div>');
			this.$controllElement.append($container);
			
			this.$previousActionElement = angular.element(
				'<div class="x-action-previous" tabindex="-1"><span>' + $translate.instant('date.previous.day') + '</span></div>'
			);
			$container.append(this.$previousActionElement );
			
			this.$headerActionElement = angular.element('<div class="x-action-header"  tabindex="-1"></td>'); 
			$container.append(this.$headerActionElement);
			
			this.$nextActionElement = angular.element(
				'<div  class="x-action-next" tabindex="-1"><span>' + $translate.instant('date.next.day') + '</span></div>'
			); 
			$container.append(this.$nextActionElement);
			
			this.$currentDayActionElement = angular.element(
				'<div class="x-action-current-day" tabindex="-1"><span>' + $translate.instant('date.current.day') + '</span></div>'
			);
			this.$controllElement.append(this.$currentDayActionElement);
			
			this._bindHandlers(
				angular.element(this.$controllElement[0].querySelectorAll('[tabindex]'))
			);
		};
		
		component.prototype.setHeaderText = function(text){
			this.$headerActionElement.html(text);
		};
		
		/**
		 * Do next action. Render next month
		 * 
		 * @method  nextAction
		 */
		component.prototype.nextAction = function(){
			if(this.doLayout === this.dailyLayout ){
				var month = this.getDate().getMonth() + 1;
				this.date.setMonth(month);
			} else if( this.doLayout === this.monthlyLayout){
				this.date.setFullYear(this.date.getFullYear() + 1);
			} else if( this.doLayout === this.yearlyLayout){
				this.date.setFullYear(this.date.getFullYear() + 9);
			}
			
			this.doLayout();
		};
		
		/**
		 * Do previous action. Render previous month
		 * 
		 * @method  previousAction
		 */
		component.prototype.previousAction = function(){
			if(this.doLayout === this.dailyLayout ){
				this.date.setMonth(this.getDate().getMonth() - 1);
			} else if( this.doLayout === this.monthlyLayout){
				this.date.setFullYear(this.date.getFullYear() - 1);
			} else if( this.doLayout === this.yearlyLayout){
				this.date.setFullYear(this.date.getFullYear() - 9);
			}
			
			this.doLayout();
		};
		
		/**
		 * Do current day action. Render calendar with actul month
		 * 
		 * @method  currentDayAction
		 */
		component.prototype.currentDayAction = function(){
			this.setDate(new Date());
			this.doLayout = this.dailyLayout;
			this.doLayout();
		};
		
		component.prototype.headerAction = function(){
			if(this.doLayout === this.dailyLayout){
				this.monthlyLayout();
			} else if(this.doLayout === this.monthlyLayout){
				this.yearlyLayout();
			}
		};
		
		/**
		 * Render actual layout. Layout can be yearly, monthly, daily
		 * 
		 * @method  doLayout
		 */
		component.prototype.doLayout = function(){};
		
		/**
		 * Render yearly layout
		 * 
		 * @method yearlyLayout
		 */
		component.prototype.yearlyLayout = function(){
			var currentDate = new Date(),
				selectedDate = this.getValue(),
				tr, td,
				date = new Date(this.getDate().getTime())
			;
			
			this.setHeaderText('');
			this.$contentElement.empty();
			this.$headerActionElement.addClass('x-deactive');
					
			var year = date.getFullYear() - 4;

			for (var i = 0; i<3; i++){
				tr = angular.element('<tr></tr>');
				for (var j = 0; j<3; j++){
					td = angular.element('<td>' + year + '</td>');
					td.attr('tabindex', '-1');
					date.setFullYear(year++);
					td.addClass('x-year');
					
					if (currentDate.getFullYear() === date.getFullYear()){
						td.addClass('x-current');
					} 

					if (selectedDate
						&& date.getFullYear() === selectedDate.getFullYear()
					){
						td.addClass('x-selected');
					} 
					td.data("date",new Date(date.getTime()));
					tr.append(td);
				}
				this.$contentElement.append(tr);
			}
			
			this._bindHandlers(
				angular.element(this.$contentElement[0].querySelectorAll('[tabindex]'))
			);
			
			this.doLayout = this.yearlyLayout;
		};
		
		/**
		 * Render monthly layout
		 * 
		 * @method monthlyLayout
		 */
		component.prototype.monthlyLayout = function(){
			var currentDate = new Date(),
				selectedDate = this.getValue(),
				tr, td,
				date = new Date(this.getDate().getTime())
			;
			
			this.setHeaderText(
				 date.getFullYear()
			);
			this.$contentElement.empty();
			this.$headerActionElement.removeClass('x-deactive');
			
			var month = 0;
			for (var i = 0; i<3; i++){
				tr = angular.element('<tr></tr>');
				for (var j = 0; j<4; j++){
					td = angular.element('<td>' + dateUtil.getNameOfMonth(month) + '</td>');
					td.attr('tabindex', '-1');
					date.setMonth(month++);
					td.addClass('x-month');
					
					if (currentDate.getMonth() === date.getMonth() 
						&& currentDate.getFullYear() === date.getFullYear()
					){
						td.addClass('x-current');
					} 

					if (selectedDate
						&& date.getMonth() === selectedDate.getMonth() 
						&& date.getFullYear() === selectedDate.getFullYear()
					){
						td.addClass('x-selected');
					} 
						
					td.data("date",new Date(date.getTime()));
					tr.append(td);
				}
				this.$contentElement.append(tr);
			}
			
			this._bindHandlers(
				angular.element(this.$contentElement[0].querySelectorAll('[tabindex]'))
			);
			this.doLayout = this.monthlyLayout;
		};
		
		/**
		 * Render daily layout
		 * 
		 * @method dailyLayout
		 */
		component.prototype.dailyLayout = function(){
			var currentDate = new Date(),
				selectedDate = this.getValue(),
				whichDay,
				tr, td,
				date = new Date(this.getDate().getTime()),
				month = date.getMonth()
			;
			
			this.setHeaderText(
				dateUtil.getNameOfMonth(date.getMonth()) 
				+ ' '
				+ date.getFullYear()
			);
			 

			this.$contentElement.empty();
			this.$headerActionElement.removeClass('x-deactive');
			
			date.setDate(1);
			whichDay = date.getDay() - 1;
			if (whichDay === -1){
				whichDay = 6;
			}

			if (whichDay === 0){
				date.setDate(date.getDate()-7);
			}else {
				date.setDate(date.getDate()- whichDay);
			}
			
			tr = angular.element('<tr class="x-labels"></tr>');
			td = angular.element('<th>' + $translate.instant('date.monday') + '</th>'); 
			tr.append(td);
			td = angular.element('<th>' + $translate.instant('date.tuesday') + '</th>'); 
			tr.append(td);
			td = angular.element('<th>' + $translate.instant('date.wednesday') + '</th>');
			tr.append(td);
			td = angular.element('<th>' + $translate.instant('date.thursday') + '</th>'); 
			tr.append(td);
			td = angular.element('<th>' + $translate.instant('date.friday') + '</th>'); 
			tr.append(td);
			td = angular.element('<th>' + $translate.instant('date.saturday') + '</th>'); 
			tr.append(td);
			td = angular.element('<th>' + $translate.instant('date.sunday') + '</th>');
			tr.append(td);

			this.$contentElement.append(tr);
			
			for (var i = 0; i<6; i++){
				tr = angular.element('<tr></tr>');
				for (var j = 0; j<7; j++){
					td = angular.element('<td>' + date.getDate() + '</td>');
					td.addClass('x-day');
					
					if (month == date.getMonth()){
						td.attr('tabindex', '-1');
						
						if (date.getDate() === currentDate.getDate() 
							&& currentDate.getMonth() === date.getMonth() 
							&& currentDate.getFullYear() === date.getFullYear()
						){
							td.addClass('x-current');
						} 
						
						if (selectedDate && date.getDate() === selectedDate.getDate() 
							&& date.getMonth() === selectedDate.getMonth() 
							&& date.getFullYear() === selectedDate.getFullYear()
						){
							td.addClass('x-selected');
						} 
						td.data("date",new Date(date.getTime()));
					} else {
						td.addClass('x-other');
					}
					
					tr.append(td);
					date.setDate(date.getDate() + 1);
				}
				this.$contentElement.append(tr);
			}
			
			this._bindHandlers(
				angular.element(this.$contentElement[0].querySelectorAll('[tabindex]'))
			);
			this.doLayout = this.dailyLayout;
		};
		
		/**
		 * Render the calendar into the element 
		 * 
		 * @method renderTo
		 * @param  {angular.element} element container element
		 */
		component.prototype.renderTo = function(element){
			this.setRootElement(element);
			this.render();
		};
		
		/**
		 * Render option item list. this.$rootElement have to be set before
		 *
		 * @example
		 *     calendar.setRootElement(element);
		 *     calendar.render()
		 *
		 * @method render 
		 */
		component.prototype.render = function(){
			this.reset();
			this._renderInit();
			this.doLayout();
		};
		
		/**
		 * Reset date property and set daily layout
		 * 
		 * @method  reset
		 */
		component.prototype.reset = function(){
			// reset date
			if (this.value) {
				this.setDate(this.value);
			} else {
				this.setDate(new Date());
			}
			
			// set daily render layout
			this.doLayout = this.dailyLayout;
		}
		
		return {
			restrict: 'A',
			require: ['?ngModel','xpsuiCalendar','xpsuiDateEdit'],
			controller: component,
			link: function(scope, elm, attrs, ctrls) {
				// var xpsuiCtrl = ctrls[0];
				var ngModel = ctrls[0];
				var xpsuiDatapickerCtrl = ctrls[1];
				var xpsuiTextInputCtrl = ctrls[2];
				var schemaFragment = scope.$eval(attrs.xpsuiSchema);
				var dropdown = dropdownFactory.create(elm,{
					titleTransCode: (schemaFragment ? schemaFragment.transCode : 'label.date')
				});

				dropdown.setInput(xpsuiTextInputCtrl.getInput())
					.render()
				;

				elm.addClass('x-calendar-wrapper');

				xpsuiDatapickerCtrl.setRootElement(elm);
				xpsuiDatapickerCtrl.setInput(xpsuiTextInputCtrl.getInput());
				
				if(dropdown){
					xpsuiDatapickerCtrl.setDropdown(dropdown);
				} else {
					xpsuiDatapickerCtrl.render();
				}
				
				if (ngModel) {
					xpsuiDatapickerCtrl.setOptions({
						onSelected: function(date){
							xpsuiTextInputCtrl.getInput().val(
								dateUtil.formatter(date)
							);
							scope.$apply(function() {
								ngModel.$setViewValue(
									dateUtil.formatter(date)
								);
							});
						}
					})

					ngModel.$render = function() {
						xpsuiDatapickerCtrl.setValue(
							dateUtil.parser(ngModel.$viewValue)
						);
						if(xpsuiDatapickerCtrl.isRendered){
							xpsuiDatapickerCtrl.render();
						}
						
						xpsuiTextInputCtrl.getInput().val(ngModel.$viewValue || '');
					};
					
					ngModel.$formatters.push(
						dateUtil.formatter	
					);
					ngModel.$parsers.push(
						dateUtil.parser	
					);
				}
			}
		};	
	}]);
}(window.angular));
