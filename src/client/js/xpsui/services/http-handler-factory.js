(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	/**
	 * Factory for creation of HttpHandlers. Use as HttpHandlerFactory.newHandler();
	 */
	.factory('xpsui:HttpHandlerFactory', ['$http', '$q', function($http, $q) {
		/**
		 * Class handles http requests. Its main purpose is to guarantee
		 * there is only one active http request at any time.
		 *
		 * It provides functionality to cancel pending request to prevent duplicate
		 * event firing.
		 *
		 * @class HttpHandler
		 */
		function HttpHandler() {
			this.activeDeffered = null;
		}

		/**
		 * Wraps functionality of $http service into own promise
		 *
		 * Api is identical to $http api
		 */
		HttpHandler.prototype.http = function(config) {
			var deffered = $q.defer();

			if (this.activeDeffered) {
				this.activeDeffered.reject('cancelled');
				this.activeDeffered = null;
			}

			$http(config).then(
				// success
				function() {
					if (this.activeDeffered === deffered) {
						deffered.resolve.apply(deffered, arguments);
					}

					this.activeDeffered = null;
				},
				// error
				function() {
					if (this.activeDeffered === deffered) {
						deffered.reject.apply(deffered, arguments);
					}

					this.activeDeffered = null;
				},
				// notify
				function() {
					if (this.activeDeffered === deffered) {
						deffered.notify.apply(deffered, arguments);
					}
				}
			);

			this.activeDeffered = deffered;

			return deffered.promise;
		};

		return {
			newHandler: function() {
				return new HttpHandler();
			}
		};
	}]);
}(window.angular));
