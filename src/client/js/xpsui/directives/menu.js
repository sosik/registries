(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiMenu', ['xpsui:log',  function(log) {		
		return {
			restrict: 'A',
			//require: [],
			controller: function($scope, $element){
			},
			link: function(scope, elm, attrs, ctrls) {
				var button = angular.element(elm[0].querySelector('.xpsui-menu-toggle'));
				
				elm.addClass('x-menu');
				button.on('click',function(){
					elm.toggleClass('x-open');
				});
				
			}
		};
	}]);
}(window.angular));