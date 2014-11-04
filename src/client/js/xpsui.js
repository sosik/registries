/*globals angular, console*/
'use strict';

angular.module('xpsui', [])
.constant('xpsui:constants', {
	loggingLevel: 1
})
.factory('xpsui:ObjectTools', [function() {
	function ObjectTools() {
	}

	ObjectTools.prototype.getSchemaFragmentByObjectPath = function(schema, path) {
		if (!schema) {
			// no schema
			return;
		}

		if (!path || !path.length || path.length < 1) {
			// no relevant path
			return;
		}

		var propertiesFragment;

		if (schema.type === 'array') {
			// it is array def
			propertiesFragment = schema.items;
		} else {
			// we assume schemafragment is object def
			propertiesFragment = schema.properties;
		}

		if (!propertiesFragment) {
			return;
		}

		var dotPosition = path.indexOf('.');
		if (dotPosition > -1) {
			// there is another fragment
			var pathPropName = path.substring(0, dotPosition);
			return this.getSchemaFragmentByObjectPath(propertiesFragment[pathPropName], path.substring(dotPosition+1));
		} else {
			// this is final fragment
			return propertiesFragment[path];
		}

	};

	return new ObjectTools();
}])
.factory('xpsui:log', ['xpsui:constants', function(constants) {
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
.factory('xpsui:FormGenerator', ['xpsui:log', '$compile', 'xpsui:ComponentGenerator', function(log, $compile, componentGenerator) {
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
.factory('xpsui:ComponentGenerator', ['xpsui:log', function(log) {
	function generate(options, schemaPath, modelPath) {
		var result;
		if (!options) {
			log.error('No options provided, cannot generate component');
			return;
		}

		// identify base component to use
		if (options.type && options.type === 'array') {
			result = angular.element('<xpsui-array></xpsui-array>');
			result.attr('xpsui-schema', schemaPath);
			result.attr('xpsui-model', modelPath);

			return result;
		} else if (options.type && (options.type === 'string' || options.type === 'number')){
			result = angular.element('<xpsui-ctrl></xpsui-ctrl>');
		} else if (options.type && options.type === 'datepicker'){
			result = angular.element('<div class="xpsui-datepicker"></div>');
		} else if (options.type && options.type === 'datepickerdropdown'){
			result = angular.element('<div class="xpsui-datepicker xpsui-dropdown"></div>');
		} else {
			result = angular.element('<xpsui-fieldset></xpsui-fieldset>');
			result.attr('xpsui-schema', schemaPath);
			result.attr('xpsui-model', modelPath);

			return result;
		}

		if (options.transient) {
			log.debug('transient');
			result.attr('xpsui-model', modelPath);
		} else {
			log.debug('not transient, setting ng-model to "%s"', modelPath);
			result.attr('ng-model', modelPath);
		}

		if (options.readOnly) {
			log.debug('readOnly, setting xpsui-text-view');
			result.attr('xpsui-text-view', '');
		} else {
			log.debug('not readOnly, setting xpsui-text-input');
			result.attr('xpsui-text-input', '');
		}

		if (schemaPath) {
			log.debug('schemaPath is defined, setting xpsui-options to "%s"', schemaPath);
			result.attr('xpsui-options', schemaPath);
		}

		return result;
	}

	return {
		generate: generate
	};
}])
.factory('xpsui:Calculator', ['$q', 'xpsui:log', function($q, log) {
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
		var localPath = context.controller.attrs.xpsuiModel || context.controller.attrs.ngModel;
		// as xpsuiModel and ngModel contains full path with model root prefix we have to remove it
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


	};

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
 * Creates generated formular. If attributes xpsui-model and xpsui-schema
 */
.directive('xpsuiForm', ['$compile', 'xpsui:log', 'xpsui:Calculator', 'xpsui:FormGenerator', function($compile, log, calculator, formGenerator) {
	return {
		restrict: 'A',
		require: 'xpsuiForm',
		controller: function($scope, $element, $attrs) {
			function Calculation(controller, calcDef) {
				this.watchExpressions = [];
				this.watchDereg = [];
				this.calcDef = calcDef;
				this.controller = controller;
				this.modelPath = $attrs.xpsuiModel;
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
			};

			Calculation.prototype.deregisterWatches = function() {
				for (var i = 0; i < this.watchDereg.length; ++i) {
					this.watchDereg[i]();
				}

				this.watchDereg = [];
			};

			Calculation.prototype.destroy = function() {
				this.deregisterWatches();
			};

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
			log.group('xpsuiForm Link');
			log.time('xpsuiForm Link');

			if (attrs.xpsuiModel && attrs.xpsuiSchema) {
			} else {
				log.warn('Attributes xpsui-model and xpsui-schema have to be set, skipping form generation');
				log.timeEnd('xpsuiForm Link');
				log.groupEnd();
				return;
			}

			var schema = scope.$eval(attrs.xpsuiSchema);
			formGenerator.generate(scope, elm, schema, attrs.xpsuiSchema, attrs.xpsuiModel);

			log.timeEnd('xpsuiForm Link');
			log.groupEnd();
		}
	};
}])

/**
 * Base sontrol directive for other xpsui 
 */
.directive('xpsuiCtrl', ['xpsui:log', function(log) {
	return {
		restrict: 'EA',
		require: ['xpsuiCtrl', '^xpsuiForm'],
		controller: function($scope, $element, $attrs) {
			function PsuiCtrlController($scope) {
				this.scope = $scope;
				this.attrs = $attrs;
			}

			PsuiCtrlController.prototype.commit = function(data) {
				log.debug('Commiting value "%s"', data);
				($element.val || angular.noop)(data);
			};

			return new PsuiCtrlController();
		},
		link: function(scope, elm, attrs, ctrls) {
			var xpsuiCtrl = ctrls[0];
			var xpsuiForm = ctrls[1];
			var calculation;

			var options = {};

			if (attrs.xpsuiOptions) {
				// there are options lets process them
				options = scope.$eval(attrs.xpsuiOptions ) || {};

				if (options.calculated && xpsuiForm) {
					log.debug('Registering calculations');
					calculation = (xpsuiForm && xpsuiForm.registerCalculation(xpsuiCtrl, options.calculated));
				}
			}

			scope.$on('$destroy', function() {
				if (xpsuiForm) {
					xpsuiForm.unregisterCalculation(calculation);
				}
			});
		}
	};
}])

/**
 * Text imput control
 */
.directive('xpsuiTextInput', ['xpsui:log', function(log) {
	return {
		restrict: 'A',
		require: ['?xpsuiCtrl', '?ngModel','xpsuiTextInput'],
		controller: function($scope, $element, $attrs) {
			function controller(){
				this.$input = null;
				
				this.setup();
			}
			
			controller.prototype.setup = function(){
				this.$input = angular.element('<input type="text" ></input>');
				this.$input.addClass('xpsui-form-input');
			}
			
			controller.prototype.getInput = function(){
				return this.$input;
			}
			
			return new controller();
		},
		link: function(scope, elm, attrs, ctrls) {
			var xpsuiCtrl = ctrls[0];
			var ngModel = ctrls[1];
			var self = ctrls[2];

//			var input = angular.element('<input type=text></input>');
			var input = self.getInput();
			
			if (xpsuiCtrl) {
				xpsuiCtrl.commit = function(value) {
					input.val(value || '');
					if (ngModel) {
						ngModel.$setViewValue(input.val());
					}
				};
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
.directive('xpsuiTextView', [function() {
	return {
		restrict: 'A',
		require: ['?xpsuiCtrl', '?ngModel'],
		link: function(scope, elm, attrs, ctrls) {
			var xpsuiCtrl = ctrls[0];
			var ngModel = ctrls[1];

			// set options
			var options = scope.xpsuiOptions || {};

			var view = angular.element('<div></div>');
			elm.append(view);

			if (ngModel) {
				//ngModel defined
				ngModel.$render = function() {
					view.text(ngModel.$viewValue || '');
				};
			}

			if (xpsuiCtrl) {
				xpsuiCtrl.commit = function(value) {
					view.text(value || '');
				};
			}
		}
	};
}])
.directive('xpsuiButton', [function() {
	return {
		restrict: 'A',
		link: [function(scope, elm, attrs, ctrls) {
		}]
	};
}])
.directive('xpsuiFieldset', ['xpsui:log', 'xpsui:FormGenerator', function(log, formGenerator) {
	return {
		restrict: 'E',
		link: function(scope, elm, attrs, ctrls) {
			log.group('FieldSet Link');

			var modelPath = attrs.xpsuiModel;
			var schemaPath = attrs.xpsuiSchema;


			if (modelPath && schemaPath) {
			} else {
				log.warn('Attributes xpsui-model and xpsui-schema have to be set, skipping fieldset generation');
				log.groupEnd();
				return;
			}

			var schema = scope.$eval(schemaPath);
			formGenerator.generate(scope, elm, schema, schemaPath, modelPath);

			log.groupEnd();
		}
	};
}])
.directive('xpsuiArray', ['xpsui:log', 'xpsui:ComponentGenerator', '$compile', function(log, componentGenerator, $compile) {
	return {
		restrict: 'E',
		link: function(scope, elm, attrs, ctrls) {
			log.group('xpsui-array Link');

			var modelPath = attrs.xpsuiModel;
			var schemaPath = attrs.xpsuiSchema;


			if (modelPath && schemaPath) {
			} else {
				log.warn('Attributes xpsui-model and xpsui-schema have to be set, skipping fieldset generation');
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
	};
}])
.directive('xpsuiDatepickerView', ['xpsui:log', 'xpsui:ComponentGenerator', '$compile', function(log, componentGenerator, $compile) {
	return {
		restrict: 'EA',
		require: ['?xpsuiCtrl', '?ngModel'],
		link: function(scope, elm, attrs, ctrls) {
			log.group('xpsui-datepicker-view Link');

			var xpsuiCtrl = ctrls[0];
			var ngModel = ctrls[1];

			var view = angular.element('<span></span>');
			elm.append(view);

			if (ngModel) {
				log.debug('ngModel defined');
				ngModel.$formatters.push(function(value) {
					if (value) {
						var year = value.substring(0,4);
						var month = value.substring(4,6);
						var day = value.substring(6,8);

						if (year.length === 4 && month.length === 2 && day.length === 2) {
							var d = new Date(year, month-1, day);

							return d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear();
						}

						return value;
					}
					return '';
				});

				ngModel.$parsers.push(function(value) {
					if (value) {
						var d = new Date();
						var s = value.split('.');
						if (s.length === 3) {
							var day = parseInt(s[0]);
							var month = parseInt(s[1]);
							var year = parseInt(s[2]);

							if ((day > 0 && day < 32) &&
								(month > 0 && month <13) &&
								(year > 0 && year < 10000)
							   ) {
									d.setYear(year);
									d.setMonth(month -1);
									d.setDate(day);

									var ys = d.getFullYear().toString(10);
									var ms = (d.getMonth() + 1).toString(10);
									if (ms.length < 2) {
										ms = '0'.concat(ms);
									}
									var ds = d.getDate().toString();
									if (ds.length < 2) {
										ds = '0'.concat(ds);
									}

									return ys.concat(ms, ds);
								}
							// invalid
							return '';
						}
						// invalid
						return '';
					}
				});

				ngModel.$render = function() {
					view.text(ngModel.$viewValue || '');
				};
			}

			if (xpsuiCtrl) {
				log.debug('xpsuiCtrl defined');
				xpsuiCtrl.commit = function(value) {
					view.text(value || '');
				};
			}

			log.groupEnd();
		}
	};
}])
.factory('xpsui:DateUtil',['xpsui:log', '$translate', function(log, $translate) {
		
	function getDateFromYYYYMMDD(value){
		var year = value.substring(0,4),
			month = value.substring(4,6),
			day = value.substring(6,8)
		;
		
		if (year.length === 4 && month.length === 2 && day.length === 2) {
			return new Date(year, month-1, day);
		}
		return null;
	}
	
	function getDateFromDMYYYY(value){
		if (/^[0-9]{1,2}\.[0-9]{1,2}\.[1-9][0-9][0-9][0-9]$/.test(value)) {
			var s = value.split('.');
			var day = parseInt(s[0]);
			var month = parseInt(s[1]);
			var year = parseInt(s[2]);

			if ((day > 0 && day < 32) &&
				(month > 0 && month <13) &&
				(year > 0 && year < 10000)
			) {
				var d = new Date();
				d.setDate(day);
				d.setMonth(month -1);
				d.setYear(year);
				return d;
			}
		}
		return null;
	}
	
	
	function formatterDMYYYY(date){
		if (angular.isString(date) ){
			date = getDateFromYYYYMMDD(date);
		}
		
		if (date instanceof Date) {
			return date.getDate() + '.' + (date.getMonth()+1) + '.' + date.getFullYear();
		}
		
		return null;
	}
	
	function parserDMYYYY(value){
		var date;
		
		if (angular.isDate(value)) {
			date = new Date(value.getTime()) ;
		} else {
			date = getDateFromDMYYYY(value);
		}
		
		if (angular.isDate(date)) {
			var ys = date.getFullYear().toString(10);
			var ms = (date.getMonth() + 1).toString(10);
			if (ms.length < 2) {
				ms = '0'.concat(ms);
			}
			var ds = date.getDate().toString();
			if (ds.length < 2) {
				ds = '0'.concat(ds);
			}

			return ys.concat(ms, ds);
		}
		
		return null;
	}

	return {
		getDateFromYYYYMMDD: getDateFromYYYYMMDD, 
		formatter:function(value) {
			if (value) {
				var string = formatterDMYYYY(value);
				if(string){
					return string;
				}

				return value;
			}
			return '';
		},
					
		parser: function(value) {
			if (value) {
				var string = parserDMYYYY(value);
				if(string){
					return string;
				}
				// invalid
				return undefined;
			}
		},
		
		getNameOfMonth: function(month){
			if (month == 0){
				return $translate.instant('date.jan');
			}else if (month == 1){
				return $translate.instant('date.feb');
			}else if (month == 2){
				return $translate.instant('date.mar');
			}else if (month == 3){
				return $translate.instant('date.apr');
			}else if (month == 4){
				return $translate.instant('date.may');
			}else if (month == 5){
				return $translate.instant('date.jun');
			}else if (month == 6){
				return $translate.instant('date.jul');
			}else if (month == 7){
				return $translate.instant('date.aug');	
			}else if (month == 8){
				return $translate.instant('date.sep');
			}else if (month == 9){
				return $translate.instant('date.oct');
			}else if (month == 10){
				return $translate.instant('date.nov');
			}else if (month == 11){
				return $translate.instant('date.dec');
			}
		}
	};
}])
.directive('xpsuiDatepicker',['xpsui:log', 'xpsui:DateUtil', '$translate', function(log, dateUtil, $translate) {
	var keys = {
            tab:      9,
            enter:    13,
            escape:   27,
            space:    32,
            pageup:   33,
            pagedown: 34,
            end:      35,
            home:     36,
            left:     37,
            up:       38,
            right:    39,
            down:     40,
            asterisk: 106
   };
   
	var component = function(){
		this.options = angular.extend({}, component.DEFAULT);
		// selected date - date from input
		this.value;
		
		// date for render layout - date is using layout functions
		this.date;
		
		this.isRendered = false;
		
		this.dropdown = false;
	};
	
	component.DEFAULT = {
	};
	
	component.prototype.setInput = function(element){
		var self = this;
		this.$inputElement = element;
		
		this.$inputElement.on('change',function(){
			var value = dateUtil.parser(
				angular.element(this).val()
			);
			if (value) {
				self.setValue(value);
				self.render();
			}
		});
		
		return this;
	};
	
	component.prototype.getInput = function(){
		return this.$inputElement;
	};
	
	component.prototype.setDate = function(value){
		this.date = new Date(value.getTime()) ;
	};
	
	component.prototype.getDate = function(value){
		if(this.date === null || this.date === undefined){
			this.setDate(this.value ? this.value : new Date);
		}
		return this.date;
	};
	
	component.prototype.setValue = function(value){
		if(angular.isUndefined(value)){
			return this;
		}
		
		if(typeof value === 'string'){
			value = dateUtil.getDateFromYYYYMMDD(value);
		}
		this.value = new Date(value.getTime()) ;
		return this;
	};
	
	component.prototype.setRootElement = function(element){
		this.$rootElement = element
		return this;
	};
	
	component.prototype.getRootElement = function(){
		return this.$rootElement;
	};
	
	component.prototype.setDropdown = function(dropdown){
		var self = this;
		this.dropdown = dropdown;
		
		dropdown.afterOpen = function(){
			self.renderTo(dropdown.getContentElement());
			self.setFocus(self.$element);
		};
	};
	
	component.prototype.setFocus = function($el){
		$el[0].focus();
		if (this.$element[0] === $el[0]) {
			this.$focusElement = null;
		} else {
			this.$focusElement = $el;
		}
	};
	
	/**
	 * 
	 * @returns Date
	 */
	component.prototype.getValue = function(){
		return this.value;
	};
	
	component.prototype._bindHandlers = function($items) {
		var self = this;

		// bind a click handler
		$items.on('click', function(e) {
			return self._handleClick(angular.element(this), e);
		});

		// bind a keydown handler
		$items.on('keydown', function(e) {
			return self._handleKeyDown(angular.element(this), e);
		});

		// bind a focus handler
		$items.on('focus', function(e) {
			return self._handleFocus(angular.element(this), e);
		});

		// bind a blur handler
		$items.on('blur', function(e) {
			return self._handleBlur(angular.element(this), e);
		});
		
		this.resetTabElemens();
	};
	
	component.prototype._handleClick = function($el, event){
		this._handleActions($el);
		event.stopPropagation();
	};
	
	component.prototype._handleKeyDown = function($el, event){
		switch (event.keyCode) {
			case keys.left:
				this.previousAction();
				this.setFocus(this.$element);
				event.stopPropagation();
				break;
			case keys.right:
				this.nextAction();
				this.setFocus(this.$element);
				event.stopPropagation();
				break;
			case keys.down:
				if(!this.$focusElement){
					this.setFocus(
						angular.element(this.getTabElements()[0])
					);
				} else {
					var index = this.indexOfTabElements(this.$focusElement[0]);
					if(index === this.getTabElements().length - 1 ){
						index = 0;
					} else {
						index++;
					}
					this.setFocus(
						angular.element( 
							this.getTabElements()[index]
						)
					);
				}
				event.stopPropagation();
				break;
			case keys.up:
				if(!this.$focusElement){
					this.setFocus(
						angular.element(this.getTabElements()[0])
					);
				} else {
					var index = this.indexOfTabElements(this.$focusElement[0]);
					if(!index){
						index = this.getTabElements().length - 1;
					} else {
						index--;
					}
					this.setFocus(
						angular.element( 
							this.getTabElements()[index]
						)
					);
				}
				
				event.stopPropagation();
				break;
			case keys.enter: 
				this._handleActions($el);
				event.stopPropagation();
				break
			case keys.escape:
				this.getInput()[0].focus();
				event.stopPropagation();
				break;
		}
	};
	
	component.prototype._handleFocus = function($el, event){
		this.dropdown && this.dropdown.cancelClosing();
	};
	
	component.prototype._handleBlur = function($el, event){
		this.dropdown && this.dropdown.close();
	};
	
	component.prototype._handleActions = function($el){
		switch($el[0]){
			case this.$previousActionElement[0]:
				this.previousAction();
				//this.setFocus(this.$element);
				break;
			case this.$nextActionElement[0]:
				this.nextAction();
				//this.setFocus(this.$element);
				break;
			case this.$currentDayActionElement[0]:
				this.currentDayAction();
				//this.setFocus(this.$element);
				break;
			case this.$headerActionElement[0]:
				this.headerAction();
				if(this.doLayout === this.yearlyLayout){
					this.setFocus(this.getFirstTabElement());
				}
				//this.setFocus(this.$element);
				break;
			default:
				if($el.hasClass('year')){
					this.date.setFullYear($el.data('date').getFullYear());
					this.monthlyLayout();
					this.setFocus(this.getFirstTabElement());
				} else if($el.hasClass('month')){
					this.date.setMonth($el.data('date').getMonth());
					this.dailyLayout();
					this.setFocus(this.getFirstTabElement());
				} else if($el.hasClass('day') && $el.data('date')){
					this.getInput().val(
						dateUtil.formatter($el.data('date'))
					);
					this.getInput()[0].focus();
				}
		}
	};
	
	component.prototype._renderInit =  function(){
		var self = this;
		if(!this.isRendered){
			this.isRendered = true;
			
			this.$element = angular.element('<div class="x-datapicker-wrapper"></div>');
			
			this.$element.attr('tabindex', '0');
			if(this.dropdown){
				this.$element.attr('tabindex', '-1');
			}
			
			this.getRootElement().append(this.$element);
			this._bindHandlers(this.$element);

			this._controllsInit();

			this.$contentElement =  angular.element('<table></table>');
			this.$element.append(this.$contentElement);
		}
	};
	
	component.prototype.resetTabElemens =  function(){
		this.$tabElements = angular.element(
			this.$element[0].querySelectorAll('[tabindex]')
		);
	};
	
	component.prototype.indexOfTabElements = function(value){
		var index = 0;
		angular.forEach(this.getTabElements(),function(val, key){
			if (val === value) {
				index =  key;
				return false;
			}
		});
		return index;
	};
	
	component.prototype.getTabElements = function(){
		return this.$tabElements;
	};
	
	component.prototype.getFirstTabElement = function(){
		return angular.element(this.$contentElement[0].querySelector('[tabindex]'));
	};
	
	component.prototype._controllsInit = function(){
		var self = this;
		this.$controllElement =  angular.element('<div class="x-controlls"></div>');
		this.$element.append(this.$controllElement);
		
		
		var $container =  angular.element('<div class="x-controlls-header"></div>');
		this.$controllElement.append($container);
		
		this.$previousActionElement = angular.element(
			'<div class="x-action-previous" tabindex="-1"><span>' + $translate.instant('date.previous.day') + '</span></div>'
		);
		$container.append(this.$previousActionElement );
		
		this.$headerActionElement = angular.element('<div class="x-action-header"  tabindex="-1"></td>'); 
		$container.append(this.$headerActionElement);
		
		this.$nextActionElement = angular.element(
			'<div  class="x-action-next" tabindex="-1">' + $translate.instant('date.next.day') + '</div>'
		); 
		$container.append(this.$nextActionElement);
		
		this.$currentDayActionElement = angular.element(
			'<div class="x-action-current-day" tabindex="-1"><span>' + $translate.instant('date.current.day') + '</span></div>'
		);
		this.$controllElement.append(this.$currentDayActionElement);
		
		this._bindHandlers(
			angular.element(this.$controllElement[0].querySelectorAll('[tabindex]'))
		);
	};
	
	component.prototype.setHeaderText = function(text){
		this.$headerActionElement.html(text);
	};
	
	component.prototype.nextAction = function(){
		if(this.doLayout === this.dailyLayout ){
			var month = this.getDate().getMonth() + 1;
			this.date.setMonth(month);
		} else if( this.doLayout === this.monthlyLayout){
			this.date.setFullYear(this.date.getFullYear() + 1);
		} else if( this.doLayout === this.yearlyLayout){
			this.date.setFullYear(this.date.getFullYear() + 9);
		}
		
		this.doLayout();
	};
	
	component.prototype.previousAction = function(){
		if(this.doLayout === this.dailyLayout ){
			this.date.setMonth(this.getDate().getMonth() - 1);
		} else if( this.doLayout === this.monthlyLayout){
			this.date.setFullYear(this.date.getFullYear() - 1);
		} else if( this.doLayout === this.yearlyLayout){
			this.date.setFullYear(this.date.getFullYear() - 9);
		}
		
		this.doLayout();
	};
	
	component.prototype.currentDayAction = function(){
		this.setDate(new Date);
		this.doLayout = this.dailyLayout;
		this.doLayout();
	};
	
	component.prototype.headerAction = function(){
		if(this.doLayout === this.dailyLayout){
			this.monthlyLayout();
		} else if(this.doLayout === this.monthlyLayout){
			this.yearlyLayout();
		}
	};
	
	component.prototype.doLayout = function(){};
	
	component.prototype.yearlyLayout = function(){
		var currentDate = new Date,
			selectedDate = this.getValue(),
			tr, td,
			date = new Date(this.getDate().getTime())
		;
		
		this.setHeaderText('');
		this.$contentElement.empty();
				
		var year = date.getFullYear() - 4;

		for (var i = 0; i<3; i++){
			tr = angular.element('<tr></tr>');
			for (var j = 0; j<3; j++){
				td = angular.element('<td>' + year + '</td>');
				td.attr('tabindex', '-1');
				date.setFullYear(year++);
				td.addClass('year');
				
				if (currentDate.getFullYear() === date.getFullYear()){
					td.addClass('current');
				} 

				if (selectedDate
					&& date.getFullYear() === selectedDate.getFullYear()
				){
					td.addClass('selected');
				} 
				td.data("date",new Date(date.getTime()));
				tr.append(td);
			}
			this.$contentElement.append(tr);
		}
		
		this._bindHandlers(
			angular.element(this.$contentElement[0].querySelectorAll('[tabindex]'))
		);
		
		this.doLayout = this.yearlyLayout;
	};
	
	component.prototype.monthlyLayout = function(){
		var currentDate = new Date,
			selectedDate = this.getValue(),
			tr, td,
			date = new Date(this.getDate().getTime())
		;
		
		this.setHeaderText(
			 date.getFullYear()
		);
		this.$contentElement.empty();
		
		var month = 0;
		for (var i = 0; i<3; i++){
			tr = angular.element('<tr></tr>');
			for (var j = 0; j<4; j++){
				td = angular.element('<td>' + dateUtil.getNameOfMonth(month) + '</td>');
				td.attr('tabindex', '-1');
				date.setMonth(month++);
				td.addClass('month');
				
				if (currentDate.getMonth() === date.getMonth() 
					&& currentDate.getFullYear() === date.getFullYear()
				){
					td.addClass('current');
				} 

				if (selectedDate
					&& date.getMonth() === selectedDate.getMonth() 
					&& date.getFullYear() === selectedDate.getFullYear()
				){
					td.addClass('selected');
				} 
					
				td.data("date",new Date(date.getTime()));
				tr.append(td);
			}
			this.$contentElement.append(tr);
		}
		
		this._bindHandlers(
			angular.element(this.$contentElement[0].querySelectorAll('[tabindex]'))
		);
		this.doLayout = this.monthlyLayout;
	};
	
	component.prototype.dailyLayout = function(){
		var currentDate = new Date,
			selectedDate = this.getValue(),
			whichDay,
			tr, td,
			date = new Date(this.getDate().getTime()),
			month = date.getMonth()
		;
		
		this.setHeaderText(
			dateUtil.getNameOfMonth(date.getMonth()) 
			+ ' '
			+ date.getFullYear()
		);
		 

		this.$contentElement.empty();
		
		date.setDate(1);
		whichDay = date.getDay() - 1;
		if (whichDay === -1){
			whichDay = 6;
		}

		if (whichDay === 0){
			date.setDate(date.getDate()-7);
		}else {
			date.setDate(date.getDate()- whichDay);
		}
		
		tr = angular.element('<tr class="labels"></tr>');
		td = angular.element('<th>' + $translate.instant('date.monday') + '</th>'); 
		tr.append(td);
		td = angular.element('<th>' + $translate.instant('date.tuesday') + '</th>'); 
		tr.append(td);
		td = angular.element('<th>' + $translate.instant('date.wednesday') + '</th>');
		tr.append(td);
		td = angular.element('<th>' + $translate.instant('date.thursday') + '</th>'); 
		tr.append(td);
		td = angular.element('<th>' + $translate.instant('date.friday') + '</th>'); 
		tr.append(td);
		td = angular.element('<th>' + $translate.instant('date.saturday') + '</th>'); 
		tr.append(td);
		td = angular.element('<th>' + $translate.instant('date.sunday') + '</th>');
		tr.append(td);

		this.$contentElement.append(tr);
		
		for (var i = 0; i<6; i++){
			tr = angular.element('<tr></tr>');
			for (var j = 0; j<7; j++){
				td = angular.element('<td>' + date.getDate() + '</td>');
				td.addClass('day');
				
				if (month == date.getMonth()){
					td.attr('tabindex', '-1');
					
					if (date.getDate() === currentDate.getDate() 
						&& currentDate.getMonth() === date.getMonth() 
						&& currentDate.getFullYear() === date.getFullYear()
					){
						td.addClass('current');
					} 
					
					if (selectedDate && date.getDate() === selectedDate.getDate() 
						&& date.getMonth() === selectedDate.getMonth() 
						&& date.getFullYear() === selectedDate.getFullYear()
					){
						td.addClass('selected');
					} 
					td.data("date",new Date(date.getTime()));
				} else {
					td.addClass('other');
				}
				
				tr.append(td);
				date.setDate(date.getDate() + 1);
			}
			this.$contentElement.append(tr);
		}
		
		this._bindHandlers(
			angular.element(this.$contentElement[0].querySelectorAll('[tabindex]'))
		);
		this.doLayout = this.dailyLayout;
	};
	
	component.prototype.renderTo = function(element){
		this.setRootElement(element);
		this.render();
	};
	
	component.prototype.render = function(){
		this.reset();
		this._renderInit();
		this.doLayout();
	};
	
	component.prototype.reset = function(){
		// reset date
		if (this.value) {
			this.setDate(this.value);
		} else {
			this.setDate(new Date);
		}
		
		// set daily render layout
		this.doLayout = this.dailyLayout;
	}
	
	return {
		restrict: 'C',
		require: ['?xpsuiCtrl', '?ngModel','xpsuiDatepicker','xpsuiTextInput','?xpsuiDropdown'],
		controller: function($scope, $element) {
			var datapicker = new component();
			datapicker.setRootElement($element);
			
			return datapicker;
		},
		link: function(scope, elm, attrs, ctrls) {
			var xpsuiCtrl = ctrls[0];
			var ngModel = ctrls[1];
			var xpsuiDatapickerCtrl = ctrls[2];
			var xpsuiTextInputCtrl = ctrls[3];
			var xpsuiDropdownCtrl = ctrls[4];
			
			xpsuiDatapickerCtrl.setInput(xpsuiTextInputCtrl.getInput());
			
			if(xpsuiDropdownCtrl){
				xpsuiDatapickerCtrl.setDropdown(xpsuiDropdownCtrl);
			} else {
				xpsuiDatapickerCtrl.render();
			}
			
			if (ngModel) {
				ngModel.$render = function() {
					xpsuiDatapickerCtrl.setValue(
						dateUtil.parser(ngModel.$viewValue)
					);
					if(xpsuiDatapickerCtrl.isRendered){
						xpsuiDatapickerCtrl.render();
					}
					
					xpsuiTextInputCtrl.getInput().val(ngModel.$viewValue || '');
				};
				
				ngModel.$formatters.push(
					dateUtil.formatter	
				);
				ngModel.$parsers.push(
					dateUtil.parser	
				);
			}
		}
	};	
}])
.directive('xpsuiDropdown', ['xpsui:log', 'xpsui:ComponentGenerator', '$timeout', '$translate',  function(log, componentGenerator, $timeout, $translate) {		
	return {
		restrict: 'C',
		require: ['?xpsuiCtrl', '?ngModel','xpsuiDropdown','xpsuiTextInput'],
		controller: function($scope, $element){
			
			function dropdown($element){
				this.$element = $element;
				
				this.options = dropdown.DEFAULTS;
				
				this.closeTimeout = null;
			};
			
			dropdown.DEFAULTS = {
				closingTime: 150,
				clsOpen: 'x-open'
			};
			
			dropdown.prototype.getElement =  function(){
				return this.$element;
			};
			
			dropdown.prototype.getContentElement =  function(){
				return this.$contentEl;
			};
			
			dropdown.prototype.setInput = function(input){
				var self = this;
				this.$inputElement = input;
				
				this.$inputElement.on('keydown', function(evt) {
					switch (evt.keyCode) {
						case 40: // key down
							self.open();
							break;
					}
				});

				return this;
			};
			
			dropdown.prototype.renderInit = function(){
				var self = this;
				if(!this.$actionEl){
					this.$actionEl = angular.element('<div class="xpsui-dropdown-action"><span>' + $translate.instant('dropdown.toggle') + '</span></div>');
					this.$contentEl = angular.element('<div class="xpsui-dropdown-content"></div>');
					this.$element.append(this.$actionEl);
					this.$element.append(this.$contentEl);
					
					this.$actionEl.on('click', function(event){
						if(self.$element.hasClass(self.options.clsOpen)){
							self.close(false);
						} else {
							self.open();
						}
						event.stopPropagation();
					});
				}
			};
			
			dropdown.prototype.setOptions = function(options){
				angular.extend(this.options, options || {});
			};
			
			dropdown.prototype.toggle = function(){
				if(this.$element.hasClass(this.options.clsOpen)){
					this.close();
				} else {
					this.open();
				}
			};
			
			dropdown.prototype.close = function(waiting){
				var self = this;
				
				if (waiting === undefined ) {
					waiting = true;
				}
				
				if (waiting) {
					this.closeTimeout = $timeout(function(){
						self.close(false);
					}, this.options.closingTime);
					return true;
				}
				
				this.$element.removeClass(this.options.clsOpen);
				
				this.afterClose();
			};
			
			dropdown.prototype.afterClose =  function(){};
			
			dropdown.prototype.open = function(){
				this.$element.addClass(this.options.clsOpen);
				this.afterOpen();
			};
			
			dropdown.prototype.afterOpen = function(){};
			
			dropdown.prototype.cancelClosing = function(){
				this.closeTimeout && $timeout.cancel(this.closeTimeout);
			};
				
			dropdown.prototype.render = function(){
				this.renderInit();
			};
			
			return new dropdown($element);
		},
		link: function(scope, elm, attrs, ctrls) {
			var self = ctrls[2],
				xpsuiTextInputCtrl = ctrls[3]
			;
			
			self.setInput(xpsuiTextInputCtrl.getInput())
				.render()
			;
		}
	};
}])
.directive('xpsuiMenu', ['xpsui:log',  function(log) {		
	return {
		restrict: 'C',
		//require: [],
		controller: function($scope, $element){
		},
		link: function(scope, elm, attrs, ctrls) {
			var button = angular.element(elm[0].querySelector('.xpsui-menu-toggle'));
			
			button.on('click',function(){
				elm.toggleClass('x-open');
			});
			
		}
	};
}]);