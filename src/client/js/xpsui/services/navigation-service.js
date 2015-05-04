(function(angular) {
	'use strict';

	/**
	 * @class xpsui:NavigationService
	 * @module client
	 * @submodule services
	 */
	angular.module('xpsui:services')
	.factory('xpsui:NavigationService', ['$location', function($location) {
		var service = { navigationStack: [] };

		/**
		 * Checks the last item inserted into navigation and returns this item.
		 * The item stays where it is in navigation.
		 * 
		 * @return top of navigationStack or null, if empty
		 * @method top
		 * @private
		 */
		var top = function() {
			if (service.navigationStack.length > 0) {
				return service.navigationStack[service.navigationStack.length-1];
			}
			return null;
		};

		/**
		 * Stores the current path from $location object and the context passed as method parameter.
		 *
		 * @param {Object} context Information about the state to be restored with current location.
		 * 
		 * @return {undefined}
		 * @method navigate
		 */
		service.navigate = function(context) {
			service.navigationStack.push({ path: $location.path(), context: context });
			if (service.navigationStack.length > 10) {
				service.navigationStack.splice(0, 1);
			}
		};

		/**
		 * Stores path and context, both passed as method parameter.
		 *
		 * @param {String} the location to be stored with context information.
		 * @param {Object} context information about the state to be restored with location param.
		 * 
		 * @return {undefined}
		 * @method navigateToPath
		 */
		service.navigateToPath = function(path, context) {
			service.navigationStack.push({ path: path, context: context });
			if (service.navigationStack.length > 10) {
				service.navigationStack.splice(0, 1);
			}
		};

		/**
		 * Returns the last item inserted to navigation and removes this item from navigation,
		 * or undefined.
		 * The value is returned and then removed only, if the current location matches the stored location
		 * for last item.
		 *
		 * @return {object} context from the last inserted item, or null.
		 * @method restore
		 */
		service.restore = function() {
			if (service.navigationStack.length <= 0) {
				return null;
			}
			var topItem = top();
			if (topItem.path == $location.path()) {
				service.navigationStack.pop();
				return topItem.context;
			}
			return null;
		};

		/**
		 * Removes the last item inserted into navigation and sets its path into location path.
		 *
		 * @return {boolean} true, if there were items in navigation before the method started.
		 * @method back
		 */
		service.back = function() {
			if (service.navigationStack.length <= 0) {
				return false;
			}
			var last = service.navigationStack.pop();
			$location.path(last.path);

			return true;
		};

		/**
		 * Removes all items stored inside navigation.
		 *
		 * @return {undefined}
		 * @method clear
		 */
		service.clear = function() {
			service.navigationStack = [];
		};

		return service;
	} ]);

}(window.angular));
