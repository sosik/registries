(function(angular) {
	'use strict';
	
	angular.module('xpsui:directives')
	.directive('portalMenuEditor', ['$compile', function($compile) {
		return {
			restrict: 'A',
			scope: {
				index: '=portalMenuEditor',
				elementIdx: '=portalMenuIndex'
			},
			controller: ['$scope', function($scope) {
				this.remove = function(idx) {
					if ($scope.index && $scope.index.subElements) {
					$scope.index.subElements.splice(idx, 1);
					}
				};
				this.removeParent = function(idx) {
					$scope.$parent.removeFn(idx);
				};
				this.upInParent = function(idx) {
					var curr = $scope.$parent.index.subElements[idx];
					if (idx > 0) {
					$scope.$parent.index.subElements.splice(idx, 1);
					$scope.$parent.index.subElements.splice(idx-1, 0, curr);
					}
				};
				this.downInParent = function(idx) {
					var curr = $scope.$parent.index.subElements[idx];
					if (idx < $scope.$parent.index.subElements.length-1) {
					$scope.$parent.index.subElements.splice(idx, 1);
					$scope.$parent.index.subElements.splice(idx+1, 0, curr);
					}
				};
			}],
			require: ["^?portalMenuEditor"],
			link: function(scope, elm, attrs, ctrls) {
				scope.mode = 'view';
				scope.opened = false;

				elm.addClass('portal-menu-editor');

				var header = angular.element('<div class="portal-menu-header"></div>');
				var openIcon = angular.element('<i class="glyphicon glyphicon-minus-sign" style="padding-right:10px;"></i>');
				var children = angular.element('<div style="padding-left: 20px;"><div ng-repeat="c in index.subElements"><div portal-menu-editor="c" portal-menu-index="$index"></div></div></div>');
				var actionButtons = angular.element('<span style="padding-left: 10px;" class="psui-hidden"></span>');
				var editButton = angular.element('<i class="action-button glyphicon-pencil"></i>');
				var addButton = angular.element('<i class="action-button glyphicon-plus"></i>');
				var removeButton = angular.element('<i class="action-button glyphicon-minus" ng-click="removeParent()"></i>');
				var downButton = angular.element('<i class="action-button glyphicon-arrow-down" ng-click="downFn()"></i>');
				var upButton = angular.element('<i class="action-button glyphicon-arrow-up" ng-click="upFn()"></i>');

				var editPanel = angular.element('<table class="psui-hidden portal-menu-editor-edit-panel">' +
					'<tr><td>Meno:</td><td><input ng-model="index.name"</td></tr>' +
					'<tr><td>Tagy:</td><td><span portal-multistring-edit ng-model="index.tags"></span></td></tr>' +
					'</table>');


				editButton.on('click', function(evt) {
					editPanel.toggleClass('psui-hidden');
					scope.opened = !scope.opened;
					evt.stopPropagation();
				});

				addButton.on('click', function(evt) {
					scope.$apply(function () {
						scope.addNew();
					});
					evt.stopPropagation();
				});

				scope.removeParent = function() {
					if (ctrls[0]) {
						ctrls[0].removeParent(scope.elementIdx);
					}
				}

				scope.removeFn = function(idx) {
					console.log(idx);
					if (ctrls[0]) {
						ctrls[0].remove(idx);
					}
				};

				scope.upFn = function() {
					editPanel.removeClass('psui-hidden');
					editPanel.addClass('psui-hidden');
					children.removeClass('psui-hidden');
					children.addClass('psui-hidden');
					if (ctrls[0]) {
						ctrls[0].upInParent(scope.elementIdx);
					}
				}

				scope.downFn = function() {
					editPanel.removeClass('psui-hidden');
					editPanel.addClass('psui-hidden');
					children.removeClass('psui-hidden');
					children.addClass('psui-hidden');
					if (ctrls[0]) {
						ctrls[0].downInParent(scope.elementIdx);
					}
				}

				if (ctrls[0]) {
					actionButtons.append(editButton);
				}

				actionButtons.append(addButton);
				if (ctrls[0]) {
					actionButtons.append(removeButton);
					actionButtons.append(downButton);
					actionButtons.append(upButton);
				}

				header.on('click', function(evt) {
					if (scope.index && scope.index.subElements && scope.index.subElements.length > 0) {
						openIcon.toggleClass('glyphicon-plus-sign');
						openIcon.toggleClass('glyphicon-minus-sign');

						children.toggleClass('psui-hidden');
					}

					evt.stopPropagation();
				});

				header.on('mouseover', function() {
					actionButtons.removeClass('psui-hidden');
				});
				header.on('mouseleave', function() {
					actionButtons.addClass('psui-hidden');
				});
				var name = angular.element('<span>{{index.name}}</span>');

				header.append(openIcon);
				header.append(name);
				header.append(actionButtons);

				if (scope.index && scope.index.subElements && scope.index.subElements.length < 1) {
					openIcon.removeClass('glyphicon-minus-sign');
					openIcon.removeClass('glyphicon-plus-sign');
					openIcon.addClass('glyphicon-record');
				}

				elm.append(header);
				elm.append(editPanel);
				elm.append(children);
				$compile(editPanel)(scope);
				$compile(children)(scope);
				$compile(header)(scope);

				scope.addNew = function addNew() {
					scope.index.subElements.push({
						name: '...Nový...',
						transCode: null,
						tags: [],
						subElements: []
					});
					openIcon.addClass('glyphicon-minus-sign');
					openIcon.removeClass('glyphicon-record');
					openIcon.removeClass('glyphicon-plus-sign');
					children.removeClass('psui-hidden');
				};

			}
		};
	}]);
}(window.angular));