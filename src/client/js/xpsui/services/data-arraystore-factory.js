(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:DataArraystoreFactory', ['xpsui:logging', '$timeout', '$translate',
	function(log, $timeout, $translate) {

		/**
		 * ArrayStore
		 */

		function ArrayStore(){
			this.data = [];
		};

		ArrayStore.prototype.setData = function(data, translateCode){
			if (translateCode) {
				// there are transCodes
				for (var i = 0; i < data.length; i++) {
					this.data.push({
						v: $translate.instant(translateCode[i]),
						k: data[i]
					})
				}
			} else {
				for (var i = 0; i < data.length; i++) {
					this.data.push({
						v: data[i],
						k: data[i]
					})
				}
			}
		};

		ArrayStore.prototype.getValueByKey = function(key){
			for (var i = 0; i < this.data.length; i++) {
				if(this.data[i]['k'] === key){
					return this.data[i]['v'];
				}
			}
			return false;
		};

		ArrayStore.prototype.load = function(dataset, callback){
			var self = this;

			this.timeout && $timeout.cancel(this.timeout);

			this.timeout = $timeout(function(){
				var data = [];

				var regExp = new RegExp('^' + (dataset.getSearchValue() || '') ,'i');
				for (var i = 0; i < self.data.length; ++i) {
					if (regExp.test(self.data[i].v)) {
						data.push(self.data[i]);
					}
				}

				callback(
					data.slice(dataset.getOffset(), dataset.getLimit() + dataset.getOffset())
				);
			}, 0);
		};

		return ArrayStore;
	}]);
}(window.angular));
