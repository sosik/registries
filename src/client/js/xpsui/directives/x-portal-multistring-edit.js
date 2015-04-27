(function(angular) {
	'use strict';
	
	angular.module('xpsui:directives')
	.directive('xpsuiPortalMultistringEdit',['xpsui:logging','$parse', 
		'xpsui:DropdownFactory', 'xpsui:SelectboxFactory','xpsui:DataDatasetFactory',
		function(log, $parse, dropdownFactory, selectboxFactory, datafactory) {
		return {
			restrict: 'A',
			require: ['ngModel'],
			link: function(scope, elm, attrs, ctrls) {
				var ngModel = ctrls[0];

				elm.addClass('portal-multistring-edit');

				var container = angular.element('<div></div>');
				var input = angular.element('<input></input>');
				var addButton = angular.element('<button class="btn btn-primary">Pridať</button>');

				elm.addClass('portal-multistring-edit');

				ngModel.$render = function() {
					var i, xButton, stringElm;

					container.empty();
					for (i in ngModel.$modelValue) {
						stringElm = angular.element('<div class="portal-multistring-element"><span>'+ngModel.$modelValue[i]+'</span></div>');
						xButton = angular.element('<i class="icon-remove"></i>');
						xButton.data('idx', i);

						xButton.on('click', function(evt) {
						scope.$apply(function() {
							ngModel.$modelValue.splice(angular.element(evt.target).data('idx'), 1);
							ngModel.$render();
						});
						});
						stringElm.append(xButton);
						container.append(stringElm);
					}
				};

				elm.append(container);
				elm.append(input);
				elm.append(addButton);

				input.on('change', function(evt) {
					scope.$apply(function() {
						ngModel.$modelValue.push(input.val());
						ngModel.$render();
						input.val('');
					});
				});

				elm.bind('focus', function(evt) {
					input[0].focus();
				});
			}
		};
	}]);
}(window.angular));