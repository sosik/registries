(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiForm', ['$compile', 'xpsui:logging', 'xpsui:FormGenerator', function($compile, log, formGenerator) {
		return {
			restrict: 'A',
			require: 'xpsuiForm',
			controller: function() {
				this.focusedElm = null;

				this.acquireFocus = function(e) {
					if (this.focusedElm === null || this.focusedElm === e) {
						this.focusedElm = e;
						return true;
					}

					return false;
				};

				this.releaseFocus = function(e) {
					if (this.focusedElm === e) {
						this.focusedElm = null;
						return true;
					}

					return false;
				};
			},
			link: function(scope, elm, attrs, ctrls) {
				log.group('xpsuiForm Link');
				log.time('xpsuiForm Link');

				elm.addClass('x-form');

				if (attrs.xpsuiModel && attrs.xpsuiSchema) {
				} else {
					log.warn('Attributes xpsui-model and xpsui-schema have to be set, skipping form generation');
					log.timeEnd('xpsuiForm Link');
					log.groupEnd();
					return;
				}

				var schema = scope.$eval(attrs.xpsuiSchema);
				var mode = attrs.xpsuiForm;

				elm.append('<div class="x-form-title">' + schema.title + '</div>');
				
				formGenerator.generateForm(scope, elm, schema, attrs.xpsuiSchema, attrs.xpsuiModel, mode || formGenerator.MODE.VIEW);

				log.timeEnd('xpsuiForm Link');
				log.groupEnd();
			}
		};
	}]);
	

}(window.angular));
