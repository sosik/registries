(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiMenu', ['xpsui:logging',  function(log) {		
		return {
			restrict: 'A',
			//require: [],
			controller: function($scope, $element){
			},
			link: function(scope, elm, attrs, ctrls) {
				var button = angular.element(elm[0].querySelectorAll('.x-main-menu-toggle'));
				
				button.on('click',function(){
					elm.toggleClass('x-open');
				});
				
			}
		};
	}]);
}(window.angular));