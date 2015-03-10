(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiMenu', ['xpsui:logging',  function(log) {		
		return {
			restrict: 'A',
			require: ['xpsuiMenu'],
			controller: function(){

				this.setElement = function(el){
					this.el = el;
				};

				this.close = function(){
					this.el.removeClass('x-open');
				};

			},
			link: function(scope, elm, attrs, ctrls) {
				var button = angular.element(elm[0].querySelectorAll('.x-main-menu-toggle'));
				
				ctrls[0].setElement(elm);

				button.on('click',function(){
					elm.toggleClass('x-open');
				});

				elm.on('click', function(event){
					if (this === event.target) {
						ctrls[0].close();
					}
				});
			}
		};
	}]);
}(window.angular));