(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiMenuItems', ['xpsui:logging',  function(log) {		
		return {
			restrict: 'A',
			require: ['^xpsuiMenu'],
			controller: function($scope, $element){

			},
			link: function(scope, elm, attrs, ctrls) {

				var submenu = angular.element(elm[0].querySelectorAll('.x-submenu-toggle'));
				submenu.on('click',function(event){
					var $this = angular.element(this);
					$this.parent().toggleClass('x-active');
					event.preventDefault();
				});

				var links = angular.element(elm[0].querySelectorAll('ul ul a'));
				links.on('click',function(event){
					var $this = angular.element(this),
						$open = $this.parent()
					;

					while(!$open.hasClass('x-active')) {
						$open = $open.parent();
					}

					// elm.removeClass('x-open');
					ctrls[0].close();
					angular.element(elm[0].querySelectorAll('li.x-active')).removeClass('x-active');
					$open.addClass('x-active');
					angular.element(elm[0].querySelectorAll('a.x-active-link')).removeClass('x-active-link');
					$this.addClass('x-active-link');
				});

			}
		};
	}]);
}(window.angular));