(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	/**
	 * Generate and manage list of objeclink2 options and search input. 
	 *
	 * Example:
	 * 
	 *     // create and set selectbox
	 *     var selectbox = objectlink2Factory.create(elm, {
	 *         onSelected: function(value){
	 *             //do something with selected value
	 *         }
	 *     });
	 *     // assign with select input
	 *     selectbox.setInput(selfControl.getInput());
	 *     // assign dropdown where the option list is generated after open the dropdown.
	 *     selectbox.setDropdown(dropdown);
	 *     // store
	 *     var dataset = dataFactory.createObjectDataset(schemaFragment);
	 *     selectbox.setDataset(dataset);
	 * 
	 * @class xpsui:SelectboxFactory
	 * @module client
	 * @submodule services
	 * @requires  xpsui:SelectboxFactory
	 */
	.factory('xpsui:Objectlink2Factory', ['xpsui:logging', '$timeout', '$translate', 'xpsui:SelectboxFactory', 'xpsui:DateUtil', '$parse',
	function(log, $timeout, $translate, selectbox, dateUtil, $parse) {	
		function Objectlink2(element, options){
			selectbox.controller.call(this, element, options);
		}

		Objectlink2.prototype = Object.create(selectbox.controller.prototype);

		Objectlink2.prototype.controller = Objectlink2;

		/**
		 * Override xpsui:SelectboxFactory.generateElement() method
		 *
		 * @method generateElement
		 * @param  {array} data
		 * @return {angular.element}  Item option element
		 */
		Objectlink2.prototype.generateElement = function(data) {
			var $item = angular.element('<div></div>'),
				field 
			;

			Objectlink2.renderElement(
				$item,
				this.getDataset().store.fields,
				data
			);

			return $item;
		};


		/**
		 * Render visual content of element by fileds definition.
		 *
		 * @param {angular wrapped DOM element} wrapperElement
		 * @param {object} fieldsSchema - map of fields schema fragments
		 * @param {object} data - data to render
		 *
		 * @return {undefined}
		 * @method renderElement
		 * @static
		 */
		Objectlink2.renderElement = function(wrapperElement, fieldsSchema, data) {
			if(!fieldsSchema){
				return;
			}

			var field;

			for (field in fieldsSchema) {
				// FIXME translations 
				if (fieldsSchema[field]) {
					var type = fieldsSchema[field].type,
						label = fieldsSchema[field].title,
						value = data.refData[field]
					;

					wrapperElement.append(
						angular.element('<span title="' + label + '">' +
							Objectlink2.getFormatedValue(type,value) +
							'</span>'
						)
					);
				}
			}

		};

		/**
		 * Format falue by schema type
		 * 
		 * @method  getFormatedValue
		 * @param  {String} type  Component type
		 * @param  {Mixed} value Option value
		 * @return {Mixed} Formated value
		 */
		Objectlink2.getFormatedValue = function(type, value){
			if (!value) {
				return '';
			}

			value = (typeof value === 'object' && value.v) ? value.v : value;
			if(type === 'date'){
				value = dateUtil.formatter(value);
			}
			return value;
		};
		
		return {
			/**
			 * Return controller
			 * 
			 * @property controller
			 * @type {Objectlink2}
			 */
			controller: Objectlink2,

			/**
			 * Create the Objectlink2 option list
			 *
			 * @method create
			 * @param  {angular.element} element
			 * @param  {Object} options
			 * @return {Selectbox}
			 */
			create : function(element, options) {
				return new Objectlink2(element, options);
			},
			renderElement: Objectlink2.renderElement
		};
	}]);
}(window.angular));
