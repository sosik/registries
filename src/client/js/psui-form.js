/*globals angular*/
'use strict';

angular.module('psui', [])
.constant('psui:constants', {
	loggingLevel: 99
})
.factory('psui:log', ['psui:constants', function(constants) {
	function Logger(loggingLevel) {
		this.level = loggingLevel;
		this.ERROR = 1;
		this.WARN = 2;
		this.LOG = 3;
		this.DEBUG = 4;
		this.TRACE = 5;
	}

	Logger.prototype.debug = function() {
		if (this.level >= this.DEBUG) {
			console.debug.apply(null, arguments);
		}
	};

	Logger.prototype.warn = function() {
		if (this.level >= this.WARN) {
			console.warn.apply(null, arguments);
		}
	};

	Logger.prototype.error = function() {
		if (this.level >= this.ERROR) {
			console.error.apply(null, arguments);
		}
	};

	Logger.prototype.group = function() {
		if (this.level >= this.LOG) {
			console.group.apply(null, arguments);
		}
	};

	Logger.prototype.groupEnd = function() {
		if (this.level >= this.LOG) {
			console.groupEnd.apply(null, arguments);
		}
	};

	Logger.prototype.profile = function() {
		if (this.level >= this.LOG) {
			console.profile.apply(null, arguments);
		}
	};

	Logger.prototype.profileEnd = function() {
		if (this.level >= this.LOG) {
			console.profileEnd.apply(null, arguments);
		}
	};

	Logger.prototype.time = function() {
		if (this.level >= this.LOG) {
			console.time.apply(null, arguments);
		}
	};

	Logger.prototype.timeEnd = function() {
		if (this.level >= this.LOG) {
			console.timeEnd.apply(null, arguments);
		}
	};

	return new Logger(constants.loggingLevel);
}])
.factory('psui:FormGenerator', ['psui:log', '$compile', 'psui:ComponentGenerator', function(log, $compile, componentGenerator) {
	function generate(scope, elm, schemaFragment, schemaPath, modelPath) {
		var p, localSchemaPath, localModelPath, component;

		if (schemaFragment.type && schemaFragment.type === 'array') {
			// schema fragment is array
		} else {
			// schema fragment is object
			for (p in schemaFragment.properties) {
				localSchemaPath = schemaPath.concat('.properties.', p);
				localModelPath = modelPath.concat('.', p);
				
				log.group('Generating element for "%s"', localSchemaPath);
				component = componentGenerator.generate(schemaFragment.properties[p], localSchemaPath, localModelPath);
				elm.append(component);
				$compile(component)(scope);
				log.groupEnd();
			}
		}
	}

	return {
		generate: generate
	};
}])
.factory('psui:ComponentGenerator', ['psui:log', function(log) {
	function generate(options, schemaPath, modelPath) {
		var result;
		if (!options) {
			log.error('No options provided, cannot generate component');
			return;
		}

		// identify base component to use
		if (options.type && options.type === 'array') {
			result = angular.element('<psui-array></psui-array>');
			result.attr('psui-schema', schemaPath);
			result.attr('psui-model', modelPath);

			return result;
		} else if (options.type && (options.type === 'string' || options.type === 'number')){
			result = angular.element('<psui-ctrl></psui-ctrl>');
		} else {
			result = angular.element('<psui-fieldset></psui-fieldset>');
			result.attr('psui-schema', schemaPath);
			result.attr('psui-model', modelPath);

			return result;
		}

		if (options.transient) {
			log.debug('transient');
			result.attr('psui-model', modelPath);
		} else {
			log.debug('not transient, setting ng-model to "%s"', modelPath);
			result.attr('ng-model', modelPath);
		}

		if (options.readOnly) {
			log.debug('readOnly, setting psui-text-view');
			result.attr('psui-text-view', '');
		} else {
			log.debug('not readOnly, setting psui-text-input');
			result.attr('psui-text-input', '');
		}

		if (schemaPath) {
			log.debug('schemaPath is defined, setting psui-options to "%s"', schemaPath);
			result.attr('psui-options', schemaPath);
		}

		return result;
	}

	return {
		generate: generate
	};
}])
.factory('psui:Calculator', ['$q', 'psui:log', function($q, log) {
	var funcRegistry = {};
	
	/**
	 * Concatenates all parameters as strings
	 */
	funcRegistry.concatenate = function concatenateFn(params,  context, cb) {
		var i;
		var r = '';
		var keys = Object.keys(params);
		keys.sort();

		for (i = 0; i < keys.length; ++i) {
			r = r.concat(params[keys[i]]);
		}

		cb(null, r);
	};

	/**
	 * Empty function, returns original params as is. Used as default function in
	 * case of unknown or unimplemented function
	 */
	funcRegistry.empty = function emptyFn(params, context, cb) {
		cb(null, params);
	};
	
	/**
	 * Gets value form current model root defined by path. It also registers watch for
	 * this path, so when value of path changes calculation will be carried out again.
	 */
	funcRegistry.getAndWatch = function getAndWatchFn(params, context, cb) {
		if (!params.path) {
			cb('ParamNotFound', '');
		}
		
		var path = context.modelPath + '.' + params.path;
		// register path for watching
		if (context.watchExpressions.indexOf(path) < 0) {
			log.debug('Path "%s" not registered for watching, adding', path);
			context.watchExpressions.push(path);
		}

		var r = context.scope.$eval(path);
		log.debug('Path "%s" evaluated as "%s"', path, r);
		cb(null, r);
	};

	funcRegistry.resolveSelfIndex = function resolveSelfIndexFn(params, context, cb) {
		if (!params.path) {
			log.warn('Parameter "path" is not present');
			cb('ParamNotFound', '');
		}
		
		var resultPath = params.path;
		var localPath = context.controller.attrs.psuiModel || context.controller.attrs.ngModel;
		// as psuiModel and ngModel contains full path with model root prefix we have to remove it
		localPath = localPath.replace(context.modelPath + '.', '');

		if (!localPath) {
			log.warn('Failed to identify local path of element');
			cb('NoLocalPath', params.path);
		}

		var idxs = localPath.match(/\.(\d+)\./g);

		for (var i = 0; i < idxs.length; ++i) {
			idxs[i] = idxs[i].replace(/\./g, '');
			resultPath = resultPath.replace('__INDEX__', idxs[i]);
		}

		cb(null, resultPath);


	}

	/**
	 * calculates value
	 */
	function calculate(calcDef, context) {
		var p;

		if (typeof calcDef === 'object') {
			var deferred = $q.defer();

			var localFn = funcRegistry.empty;

			if (calcDef.__func__) {
				localFn = funcRegistry[calcDef.__func__] || funcRegistry.empty;
				if (localFn === funcRegistry.empty) {
					log.warn('Unknown function name "%s", using empty function', calcDef.__func__);
				}
			}
			var params = {};
			for (p in calcDef) {
				if (typeof calcDef[p] === 'object') {
						params[p] = calculate(calcDef[p], context);
				} else if (p === '__func__') {
					// we do not want func keyword there
					angular.noop();
				} else {
					params[p] = calcDef[p];
				}
			}
			$q.all(params).then(function(results){
				localFn(results, context, function(err, res) {
					if (err) {
						log.warn('Calculation evaluation failed', err);
						deferred.reject(err);
						return;
					}

					deferred.resolve(res);

				});
			}, function(errors) {
				log.warn('Calculation evaluation failed', errors);
				deferred.reject(errors);
				return;
			});
			return deferred.promise;
		}
		
		// else caclDef is not object
		return calcDef;
	}

	return {
		calculate: calculate
	};
}])

/**
 * Creates generated formular. If attributes psui-model and psui-schema
 */
.directive('psuiForm', ['$compile', 'psui:log', 'psui:Calculator', 'psui:FormGenerator', function($compile, log, calculator, formGenerator) {
	return {
		restrict: 'A',
		require: 'psuiForm',
		controller: function($scope, $element, $attrs) {
			function Calculation(controller, calcDef) {
				this.watchExpressions = [];
				this.watchDereg = [];
				this.calcDef = calcDef;
				this.controller = controller;
				this.modelPath = $attrs.psuiModel;
				this.scope = $scope;

				this.recalculate();
			}

			Calculation.prototype.recalculate = function() {
				log.debug('Executing calculation');
				var that = this;
				// deregister existing watches as calculation will bring new set of watches
				this.deregisterWatches();
				calculator.calculate(this.calcDef, this).then(function(result) {
					log.debug('Calculation finished with result "%s"', result);
					that.controller.commit(result);
					that.registerWatches();
				}, function(errors) {
					log.warn('Calculation failed', errors);
				}); 
				
			};

			Calculation.prototype.registerWatches = function() {
				this.deregisterWatches();
				var that = this;
				log.debug('Registering %d watches', this.watchExpressions.length);
				for (var i = 0; i < this.watchExpressions.length; ++i) {
					this.watchDereg.push(this.scope.$watch(this.watchExpressions[i], function(newVal, oldVal){
						if (newVal !== oldVal) {
							that.recalculate();
						}
					}));
				}
			}

			Calculation.prototype.deregisterWatches = function() {
				for (var i = 0; i < this.watchDereg.length; ++i) {
					this.watchDereg[i]();
				}

				this.watchDereg = [];
			}

			Calculation.prototype.destroy = function() {
				this.deregisterWatches();
			}

			function PsuiFormController() {
			}

			/**
			 * Registers and processes calculation. Should be called form individual components.
			 *
			 * @param controller - controller to associate calculations to
			 * @param calcDef - definition of calculations
			 */
			PsuiFormController.prototype.registerCalculation = function(controller, calcDef) {
				return new Calculation(controller, calcDef);
			};

			PsuiFormController.prototype.unregisterCalculation = function(calculation) {
				calculation.destroy();
			};

			return new PsuiFormController();
		},
		link: function(scope, elm, attrs, ctrls) {
			log.group('psuiForm Link');
			log.time('psuiForm Link');

			if (attrs.psuiModel && attrs.psuiSchema) {
			} else {
				log.warn('Attributes psui-model and psui-schema have to be set, skipping form generation');
				log.timeEnd('psuiForm Link');
				log.groupEnd();
				return;
			}

			var schema = scope.$eval(attrs.psuiSchema);
			formGenerator.generate(scope, elm, schema, attrs.psuiSchema, attrs.psuiModel);

			log.timeEnd('psuiForm Link');
			log.groupEnd();
		}
	};
}])

/**
 * Base sontrol directive for other psui 
 */
.directive('psuiCtrl', ['psui:log', function(log) {
	return {
		restrict: 'EA',
		require: ['psuiCtrl', '^psuiForm'],
		controller: function($scope, $element, $attrs) {
			function PsuiCtrlController($scope) {
				this.scope = $scope;
				this.attrs = $attrs;
			}

			PsuiCtrlController.prototype.commit = function(data) {
				log.debug('Commiting value "%s"', data);
				$element.val && $element.val(data);
			}

			return new PsuiCtrlController();
		},
		link: function(scope, elm, attrs, ctrls) {
			var psuiCtrl = ctrls[0];
			var psuiForm = ctrls[1];
			var calculation;

			var options = {};

			if (attrs.psuiOptions) {
				// there are options lets process them
				options = scope.$eval(attrs.psuiOptions ) || {};

				if (options.calculated && psuiForm) {
					log.debug('Registering calculations');
					calculation = (psuiForm && psuiForm.registerCalculation(psuiCtrl, options.calculated));
				}
			}

			scope.$on('$destroy', function() {
				if (psuiForm) {
					psuiForm.unregisterCalculation(calculation);
				}
			});
		}
	};
}])

/**
 * Text imput control
 */
.directive('psuiTextInput', ['psui:log', function(log) {
	return {
		restrict: 'A',
		require: ['?psuiCtrl', '?ngModel'],
		link: function(scope, elm, attrs, ctrls) {
			var psuiCtrl = ctrls[0];
			var ngModel = ctrls[1];

			var input = angular.element('<input type=text></input>');

			if (psuiCtrl) {
				psuiCtrl.commit = function(value) {
					input.val(value || '');
					if (ngModel) {
						ngModel.$setViewValue(input.val());
					}
				}
			}
			if (ngModel) {
				ngModel.$render = function() {
					log.debug('render');
					input.val(ngModel.$viewValue || '');
				};

				input.on('change', function() {
					scope.$apply(function() {
						if (ngModel) {
							ngModel.$setViewValue(input.val());
						}
					});
				});
			}
			elm.append(input);
		}
	};
}])
.directive('psuiTextView', [function() {
	return {
		restrict: 'A',
		require: ['?psuiCtrl', '?ngModel'],
		link: function(scope, elm, attrs, ctrls) {
			var psuiCtrl = ctrls[0];
			var ngModel = ctrls[1];

			// set options
			var options = scope.psuiOptions || {};

			var view = angular.element('<div></div>');
			elm.append(view);

			if (ngModel) {
				//ngModel defined
				ngModel.$render = function() {
					view.text(ngModel.$viewValue || '');
				};
			}

			if (psuiCtrl) {
				psuiCtrl.commit = function(value) {
					view.text(value || '');
				}
			}
		}
	};
}])
.directive('psui-button', [function() {
	return {
		restrict: 'A',
		link: [function(scope, elm, attrs, ctrls) {
		}]
	};
}])
.directive('psuiFieldset', ['psui:log', 'psui:FormGenerator', function(log, formGenerator) {
	return {
		restrict: 'E',
		link: function(scope, elm, attrs, ctrls) {
			log.group('FieldSet Link');

			var modelPath = attrs.psuiModel;
			var schemaPath = attrs.psuiSchema;


			if (modelPath && schemaPath) {
			} else {
				log.warn('Attributes psui-model and psui-schema have to be set, skipping fieldset generation');
				log.groupEnd();
				return;
			}

			var schema = scope.$eval(schemaPath);
			formGenerator.generate(scope, elm, schema, schemaPath, modelPath);

			log.groupEnd();
		}
	}
}])
.directive('psuiArray', ['psui:log', 'psui:ComponentGenerator', '$compile', function(log, componentGenerator, $compile) {
	return {
		restrict: 'E',
		link: function(scope, elm, attrs, ctrls) {
			log.group('psui-array Link');

			var modelPath = attrs.psuiModel;
			var schemaPath = attrs.psuiSchema;


			if (modelPath && schemaPath) {
			} else {
				log.warn('Attributes psui-model and psui-schema have to be set, skipping fieldset generation');
				log.groupEnd();
				return;
			}

			var itemsHolder = angular.element('<div></div>');

			elm.append(itemsHolder);
			function generateArrayElements() {
				itemsHolder.empty();

				var schema = scope.$eval(schemaPath.concat('.items'));
				angular.forEach(scope.$eval(modelPath), function(val, key) {
					var arrayItem = angular.element('<div></div>');
					angular.forEach(schema.properties, function(v, k) {
						var component = componentGenerator.generate(schema.properties[k], schemaPath.concat('.items.properties.', k), modelPath.concat('.',key, '.', k));
						arrayItem.append(component);
					});
					itemsHolder.append(arrayItem);
					$compile(arrayItem)(scope);
				});
			}

			generateArrayElements();
			log.groupEnd();
		}
	}
}]);
