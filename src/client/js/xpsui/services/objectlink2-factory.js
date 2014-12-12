(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:Objectlink2Factory', ['xpsui:logging', '$timeout', '$translate', 'xpsui:SelectboxFactory', 'xpsui:DateUtil', '$parse',
	function(log, $timeout, $translate, selectbox, dateUtil, $parse) {	
		function Objectlink2(element, options){
			selectbox.controller.call(this, element, options);
		}

		Objectlink2.prototype = Object.create(selectbox.controller.prototype);

		Objectlink2.prototype.controller = Objectlink2;

		Objectlink2.prototype.generateElement = function(data) {
			var $item = angular.element('<div></div>'),
				field 
			;

			Objectlink2.renderElement(
				$item,
				this.getDataset().getFieldsSchema(),
				data
			);

			return $item;
		};


		Objectlink2.renderElement = function($wrapperElement, fieldsSchema, data){
			if(!fieldsSchema){
				return null;
			}

			var field;

			for (var field in fieldsSchema) {
				var type = fieldsSchema[field].type,
					label = fieldsSchema[field].title,
					value = data.refData[field]
				;

				$wrapperElement.append(
					angular.element('<span title="' + label + '">' 
						+ Objectlink2.getFormatedValue(type,value) 
						+ '</span>'
					)
				);
			}

		};

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
			controller: Objectlink2,
			create : function(element, options) {
				return new Objectlink2(element, options);
			},
			renderElement: Objectlink2.renderElement
		}
	}]);
}(window.angular));