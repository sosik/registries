(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiCalculable', ['xpsui:logging', 'xpsui:Calculator', function(log, calculator) {
		return {
			restrict: 'A',
			controller: function() {
			},
			require: ['?xpsuiFormControl', '^xpsuiForm', 'ngModel'],
			link: function(scope, elm, attrs, ctrls) {
				//console.log('value: ' + JSON.stringify(scope.model.obj) + ' ' + attrs.ngModel);
				var formControl = ctrls[0];
				var form = ctrls[1];
				var ngModel = ctrls[2];

				//ngModel.$setViewValue(34);
				//ngModel.$viewValue = 50;
				if (ngModel.$render) {
					ngModel.$controls_render = ngModel.$render;
					ngModel.$render = function () {
						console.log(ngModel.$viewValue);
						ngModel.$viewValue = ngModel.$compute();
						if (ngModel.$controls_render) {
							ngModel.$controls_render();
						}
					}
				}

				ngModel.$compute = function () {
					console.log('using $compute');
					var fieldDefGetter = {
							func: 'get',
							args: { path: attrs.xpsuiCalculable }
						};
					var defValGetter = {
						func: 'get',
						args: { path: attrs.ngModel }
					};

					var fieldDef = calculator.createProperty(fieldDefGetter).getter(scope);
					if (fieldDef && fieldDef.calculated) {
						scope.$watch(
//								function ($currentScope) {
//									if ($currentScope && $currentScope.model) {
//										return $currentScope.model.obj;
//									}
//									return null;
//								},
								'model.obj.id',
								function(newVal, oldVal, $currentScope) {
									if (newVal != oldVal) {
										console.log('Computing value..');
										ngModel.$viewValue = 
											calculator.createProperty(fieldDef.calculated).getter(scope);
										ngModel.$render();
									}
								}
							);
						return calculator.createProperty(fieldDef.calculated).getter(scope);
					}
					console.log('using defValGetter - ' + attrs.ngModel);
					return calculator.createProperty(defValGetter).getter(scope);
				}
/*
				"vypoc": {
					"title": "Vypocitane",
					"transCode": "schema.people.vypocitane",
					"type": "string",
					"calculated": { "func": "get", "args": { "path": "model.obj.baseData.name" }},
					"required": false
				},

 */
				//ngModel.$viewValue = property.getter(scope.model);
				//ngModel.$modelValue = 55;
				//ngModel.$viewValue = 44;
				//scope.$apply();
				//console.log('Scope.model.obj: ' + scope.model.obj);
				//console.log('Computed: ' + property.getter(scope));
				//scope.model.test = 'hello1';
				//scope.model.obj.test = 'hello2';

//				console.log('calculable-ctrl');
//
//				console.log('schema: ' + attrs.xpsuiSchema);
//				console.log('ngModel: ' + JSON.stringify(ngModel));
//				console.log('attrs ngModel: ' + attrs.ngModel);
//				console.log('$render' + ngModel.$render);
//				console.log('scope: ' + JSON.stringify(scope.model));
			}
		};
	}]);

}(window.angular));


