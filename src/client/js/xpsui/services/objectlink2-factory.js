(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:Objectlink2Factory', ['xpsui:logging', '$timeout', '$translate', 'xpsui:SelectboxFactory', 
	function(log, $timeout, $translate, selectbox) {	
		function Objectlink2(element, options){
			selectbox.controller.call(this, element, options);
		}

		Objectlink2.prototype = Object.create(selectbox.controller.prototype);
		Objectlink2.prototype.controller = Objectlink2;
		Objectlink2.prototype.generateElement = function(item) {

			return angular.element('<div>' + item.data[3] + '</div>');
		};

		return {
			controller: Objectlink2,
			create : function(element, options) {
				return new Objectlink2(element, options);
			}
		}
	}]);
}(window.angular));