(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:Objectlink2Factory', ['xpsui:logging', '$timeout', '$translate', 'xpsui:SelectboxFactory', 'xpsui:DateUtil',
	function(log, $timeout, $translate, selectbox, dateUtil) {	
		function Objectlink2(element, options){
			selectbox.controller.call(this, element, options);
		}

		Objectlink2.prototype = Object.create(selectbox.controller.prototype);

		Objectlink2.prototype.controller = Objectlink2;

		Objectlink2.prototype.generateElement = function(item) {
			var $item = angular.element('<div></div>'),
				field 
			;

			for (field in item.refdata) {
				var type = this.getDataset().getFieldType(field),
					value = item.refdata[field]
				;
				$item.append(
					angular.element('<span title="' + this.getDataset().getFieldLabel(field) + '">' 
						+ Objectlink2.getFormatedValue(type,value) 
						+ '</span>'
					)
				);
			}
			// for(var i = 0; i < item.data.length; i++){
			// 	var type = this.getDataset().getFieldType(i),
			// 		value = item.data[i]
			// 	;

			// 	$item.append(
			// 		angular.element('<span title="' + this.getDataset().getFieldLabel(i) + '">' 
			// 			+ Objectlink2.getFormatedValue(type,value) 
			// 			+ '</span>'
			// 		)
			// 	);
			// }

			return $item;
		};

		Objectlink2.getFormatedValue = function(type, value){
			if(type === 'date'){
				value = dateUtil.formatter(value);
			}
			return value;
		}

		return {
			controller: Objectlink2,
			create : function(element, options) {
				return new Objectlink2(element, options);
			},
			getFormatedValue: Objectlink2.getFormatedValue
		}
	}]);
}(window.angular));