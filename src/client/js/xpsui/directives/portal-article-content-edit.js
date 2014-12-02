(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiPortalArticleContentEdit', ['xpsui:logging', '$compile', function(log, $compile) {
		return {
			restrict: 'A',
			require: ['ngModel'],
			controller: ['$scope', '$element', '$attrs', '$parse', '$timeout', function($scope, $element, $attrs, $parse, $timeout) {
				this.moveUp = function(idx) {
					if (idx > 0) {
						var parsedModel = $parse($attrs.ngModel);

						var array = parsedModel($scope);

						var tmp = array[idx];
						array[idx] = array[idx - 1];
						array[idx - 1] = tmp;

						parsedModel.assign($scope, array);

						$scope.$broadcast('modechange');
					}
				};

				this.moveDown = function(idx) {
					var parsedModel = $parse($attrs.ngModel);

					var array = parsedModel($scope);

					if (idx < array.length-1) {
						var tmp = array[idx];
						
						array.splice(idx, 1);
						array.splice(idx+1, 0, tmp);

						parsedModel.assign($scope, array);

						$scope.$broadcast('modechange');
					}
				};

				this.remove = function(idx) {
					var parsedModel = $parse($attrs.ngModel);

					var array = parsedModel($scope);

					array.splice(idx, 1);

					parsedModel.assign($scope, array);

					$scope.$broadcast('modechange');
				};
			}],
			link: function(scope, elm, attrs, ctrls) {
				log.group('portal-article-content-edit Link');

				var ngModel = ctrls[0];

				var content = angular.element('<div></div>');

				ngModel.$render = function() {
					var i, block;
					elm.empty();
					
					var content = angular.element('<div></div>');
					for (i = 0; i < ngModel.$modelValue.length; ++i) {
						block = angular.element('<div>x</div>');
						if (scope.mode === 'edit') {
							block.attr('xpsui-portal-widget-' + ngModel.$modelValue[i].meta.type + '-edit', attrs.ngModel+'[' + i + ']');
						} else {
							block.attr('xpsui-portal-widget-' + ngModel.$modelValue[i].meta.type + '-view', attrs.ngModel+'[' + i + ']');
						}

						block.attr('index', i);

						content.append(block);
						elm.append(content);
						$compile(block)(scope);
						
					}
				};

				scope.$on('modechange', function() {
					ngModel.$render();
				});


				log.groupEnd();
			}
		};
	}]);

}(window.angular));


