(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:DataDatasetFactory', ['xpsui:logging', 'xpsui:DataArraystoreFactory', 'xpsui:DataObjectlinkstoreFactory',
	function(log, ArrayStore, ObjectLinkStore) {
		/**
		 * DataSet
		 */
		function DataSet(store, options){
			this.store = store;
			this.options = angular.extend({}, DataSet.DEFAULTS, options || {} );

			this.data = [];

			// offset of paging  
			// e.g. n * this.option.limit
			this.offset = 0;
			// serach value
			this.serachValue = null;
			// load paging
			this.loadDone = false;
		};

		DataSet.DEFAULTS = {
			limit: 16,
			beforeLoad: function(dataSet){},
			loaded: function(dataSet, newData){},
			reset: function(){},
		};

		DataSet.prototype.setOptions = function(options){
			this.options = angular.extend({}, this.options, options || {} );
			return this;
		};


		// get limit plus one
		DataSet.prototype.getLimit = function(value){
			return this.options.limit + 1;
		};

		DataSet.prototype.getOffset = function(value){
			return this.offset * this.options.limit;
		};

		DataSet.prototype.getSearchValue = function(){
			return this.serachValue;
		};

		DataSet.prototype.setSearchValue = function(value){
			this.reset();
			this.serachValue = value;
			return this;
		};

		DataSet.prototype.reset = function(){
			this.data = [];
			this.loadDone = false;
			this.offset = 0;
			this.serachValue = null;
			this.options.reset();
			return this;
		};

		DataSet.prototype.load = function(){
			var self = this;
			if (!this.loadDone) {
				
				this.options.beforeLoad(this);

				this.store.load(this, function(data){
					self.loaded(data);
				});
			}
		};

		DataSet.prototype.loaded = function(data){
			if(data.length <= this.options.limit){
				this.loadDone = true;
			} else {
				// remove limit plus one element
				data.pop();
			}
			
			this.data = this.data.concat(data);
			this.options.loaded(this,data);
			this.offset++;
		}
		
		return {
			controller: DataSet,
			createArrayDataset: function(key, values){
				var store = new ArrayStore();
				store.setData(key, values);

				return new DataSet(store);
			},
			createObjectDataset: function(schemaFragment){
				var store = new ObjectLinkStore();

				store.setSchema(schemaFragment.objectLink2)
					.setForcedCriteria(schemaFragment.objectLink2ForcedCriteria)
				;

				return new DataSet(store);
			}
			// getObjectLinkData: ObjectLinkStore.getData
		}
	
	}]);
}(window.angular));
