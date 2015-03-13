(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiMultistringEdit', ['xpsui:logging', 'xpsui:DropdownFactory', 
							'xpsui:SelectboxFactory','xpsui:SelectDataFactory', '$timeout',
							'$http',
			function(log, dropdownFactory, selectboxFactory, datafactory, $timeout, $http) {
		return {
			restrict: 'A',
			require: ['ngModel', 'xpsuiMultistringEdit'],
			controller: function($scope, $element, $attrs) {
				this.setup = function() {
					this.$input = angular.element('<input></input>');
				}
				
				this.getInput = function() {
					return this.$input;
				}

				this.$input = null;
				this.setup();
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('Multistring edit Link');

				var ngModel = ctrls[0];
				var selfControl = ctrls[1];

				elm.addClass('x-multistring-edit');

				var container = angular.element('<div></div>');
				//var input = angular.element('<input></input>');
				var inputWrapper = angular.element('<div class="x-select-edit"></div>');
				var input = selfControl.getInput();
				var addButton = angular.element('<button class="btn btn-primary">Pridať</button>');
				inputWrapper.append(input);

				elm.addClass('x-control');
				elm.addClass('x-multistring-edit');

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
				elm.append(inputWrapper);
				elm.append(addButton);

				input.on('change', function(evt) {
					scope.$apply(function() {
						// if (input.val() && input.val().trim() != '') {
						// 	ngModel.$modelValue.push(input.val());
						// 	ngModel.$render();
						// }
						// input.val('');
					});
				});

				addButton.on('click', function (e) {
					var newVal = selfControl.getInput().val();
					if (newVal && newVal.trim() != '') {
						ngModel.$modelValue.push(newVal);
						ngModel.$render();
						selfControl.getInput().val('');
					}
				});

				inputWrapper.bind('focus', function(evt) {
					input[0].focus();
				});

				// dropdown
				var dropdown = dropdownFactory.create(inputWrapper,{
					showDropdownAction: false
					//allowClose: false
				});
				dropdown.setInput(selfControl.getInput())
					.render()
				;

				// selectbox
				var selectbox = selectboxFactory.create(inputWrapper, {
					useSearchInput: false,
					freeTextMode: true,
					showInfo: false,
					onSelected: function(value){
						//ngModel.$modelValue.push(value.v);
						ngModel.$render();
						selfControl.getInput().val(value.v);
						//input.val(value.v);
						console.log('onSelected');
						console.log(arguments);
					}
				});
				selectbox.setInput(selfControl.getInput());
				selectbox.setDropdown(dropdown);

				$http({
					url: '/portalapi/articleTagsDistinct',
					method: "GET",
					headers: {'Content-Type': 'application/json'}
				}).success(function (data, status, headers, config) {
					// store
					var dataset = datafactory.createArrayDataset(
						data
					);
					selectbox.setDataset(dataset);
				});

				input.on('keypress',function() {
					$timeout(function() {
						dropdown.open();
						selectbox.actionFilter(input.val());
					}, 300);
				});

				log.groupEnd();
			}
		};
	}]);

}(window.angular));


