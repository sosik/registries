(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiConfirmClick', [
		function(){
			return {
				link: function (scope, element, attr) {
					var msg = attr.xpsuiConfirmClick || "Are you sure?";
					var clickAction = attr.xpsuiConfirmedClick;
					element.bind('click',function (event) {
						if ( window.confirm(msg) ) {
							scope.$eval(clickAction);
						}
					});
				}
			};
		}]);

}(window.angular));
