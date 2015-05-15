(function(angular) {
	'use strict';

	angular.module('xpsui:directives')
	/**
	 * Unique asyn validator. Also xpsuiValidityMark is required
	 *
	 * Example:
	 *
	 *     <div xpsui-string-edit xpsui-unique xpsui-validity-mark xpsui-schema="schema.path" ng-model="model.path"></div>
	 *
	 * @module  client
	 * @submodule directives
	 * @class  xpsuiUnique
	 */
	.directive('xpsuiUnique', ['$http', '$q', '$timeout', 'xpsui:SchemaUtil', 'xpsui:QueryFilter', function($http, $q, $timeout, schemaUtilFactory, QueryFilter) {
		var latestId = 0;

		return {
			restrict: 'A',
			require: ['?ngModel'],
			link: function(scope, element, attrs, controllers) {
				var ngModel = controllers[0],
					schemaFragment = scope.$eval(attrs.xpsuiSchema),
					options = schemaFragment.unique
				; 

				if (ngModel) {

					/**
					 * Has same id
					 * 
					 * @param  {String}  ngModelStr model path
					 * @param  {String}  id         mango object id
					 * @return {Boolean}            
					 */
					function hasSameId(ngModelStr, id){
						var model = scope.$eval(ngModelStr);
						
						if(typeof model === 'object' && model.id && id === model.id){
							return true;
						}

						var pos = ngModelStr.lastIndexOf(".");
						if(pos !== -1){
							return hasSameId(ngModelStr.substr(0,pos), id);
						}

						return false;
					}
					
					ngModel.$asyncValidators.psuiUnique = function (modelValue, viewValue) {
						// for testing
						// var def = $q.defer();
						// $timeout(function() {
						// 	def.reject();
						// }, 6000);
						// return def.promise;


						var value = modelValue || viewValue,
							qf = QueryFilter.create().addCriterium(
								options.field,
								QueryFilter.operation.EQUAL,
								value
							).setLimit(1),
							conf = {
								method : 'POST',
								url : '/search/' + schemaUtilFactory.encodeUri(options.schema),
								data : qf
							}
						;

						return $http(conf).then(
							function(data) {
								var selfId = scope.$eval(attrs.xpsuiUnique);

								if (data.data && data.data.length 
									&& data.data.length > 0 
									&& !hasSameId(attrs.ngModel, data.data[0].id)
								) {
									return $q.reject();
								} 

								return true;	
							}
						);
					};
				}
			}
		};
	}]);
}(window.angular));
