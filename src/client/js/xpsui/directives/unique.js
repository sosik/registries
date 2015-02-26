(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	.directive('xpsuiUnique', ['$http', 'xpsui:SchemaUtil', function($http, schemaUtilFactory) {
		var latestId = 0;

		return {
			restrict: 'A',
			require: ['?ngModel'],
			link: function(scope, element, attrs, controllers) {
				var ngModel = controllers[0];

				var options = scope.$eval(attrs.xpsuiUnique);
				if (ngModel) {
					ngModel.$parsers.push(
						function(value) {
							//var selfId = scope.$eval(attrs.psuiUniqueId);
							var crits = [];
							crits.push({f:options.field, op: 'eq', v: value});
							var conf = {
								method : 'POST',
								url : '/search/' + schemaUtilFactory.encodeUri(schemaUtilFactory.concatUri(options.schema,'search')),
								data : {
									criteria : crits,
									limit: 1
								}
							};

							function containEqualId(ngModelStr, id){
								var model = scope.$eval(ngModelStr);
								
								if(typeof model === 'object' && model.id && id === model.id){
									return true;
								}

								var pos = ngModelStr.lastIndexOf(".");
								if(pos !== -1){
									return containEqualId(ngModelStr.substr(0,pos), id);
								}

								return false;
							}


							function factory(ver) {
								return function(data) {
										if (ver !== latestId) {
											// another validation in progress
											return;
										}

										if (data.data && data.data.length && data.data.length > 0 && !containEqualId(attrs.ngModel, data.data[0].id)) {
											ngModel.$setValidity('psuiUnique', false);
										} else {
											ngModel.$setValidity('psuiUnique', true);
										}
									};
							}

							$http(conf).then(factory(++latestId));

							return value;
						}
					);
				}
			}
		};
	}]);
}(window.angular));