(function(angular) {
	'use strict';

	/**
	 * Provide and manage data for selectbox and objectlink.
	 *
	 * Example:
	 *
	 *     //create dataset with array store
	 *     var dataset = datafactory.createArrayDataset(
	 *         schemaFragment.enum, 
	 *         schemaFragment.enumTransCodes
	 *     );
	 *     //set dataset to selectobx
	 *     selectbox.setDataset(dataset);
	 * 
	 * @class xpsui:DataDatasetFactory
	 * @module client
	 * @submodule services
	 * @requires  xpsui:DataArraystoreFactory, xpsui:DataObjectlinkstoreFactory
	 */
	angular.module('xpsui:services')
	.factory('xpsui:DataDatasetFactory', ['xpsui:logging', 'xpsui:DataArraystoreFactory', 'xpsui:DataObjectlinkstoreFactory',
	function(log, ArrayStore, ObjectLinkStore) {

		/**
		 * Constructor
		 * 
		 * @method DataSet
		 * @param {xpsui:DataArraystoreFactory | xpsui:DataObjectlinkstoreFactory} store 
		 * @param {Object} options  setting attributes
		 * @constructor
		 * @protected
		 */
		function DataSet(store, options){

			/**
			 * Store can be array or http.
			 *
			 * @property store
			 * @type {xpsui:DataArraystoreFactory | xpsui:DataObjectlinkstoreFactory}
			 */
			this.store = store;

			/**
			 * Object settings.
			 *
			 * @property options
			 * @extends {Dropdown.DEFAULTS}
			 * @type {Object}
			 */
			this.options = angular.extend({}, DataSet.DEFAULTS, options || {} );

			/**
			 * Array of data.
			 *
			 * @property data
			 * @type {Array}
			 * @private
			 */
			this.data = [];

			/**
			 * Actual pagging offset count like (n * this.option.limit) where n is number of page.
			 *
			 * @property data
			 * @type {Number}
			 * @private
			 */
			this.offset = 0;

			/**
			 * String used for filter.
			 * 
			 * @property serachValue
			 * @type {String}
			 * @private
			 */
			this.serachValue = null;
			
			/**
			 * Load done flag.
			 *
			 * @property loadDone
			 * @type {Boolean}
			 * @private
			 */
			this.loadDone = false;
		};

		/**
		 * Selectbox defaul settings. Setting can be rewrite.
		 *
		 * @property DEFAULTS
		 * @static
		 * @type {Object}
		 * 
		 */
		DataSet.DEFAULTS = {
			/**
			 * Limit of data per page.
			 * 
			 * @attribute limit
			 * @default 16
			 * @type {Number}
			 */
			limit: 16,

			/**
			 * Callback function of before load data from store.
			 * Dataset is this.
			 * 
			 * @attribute beforeLoad
			 * @default function(dataSet){}
			 * @type {function}
			 */
			beforeLoad: function(dataSet){},

			/**
			 * Callback function of after load.
			 * Calback function params:
			 * 
			 *     @param {this} dataSet
			 *     @param {array} newData new data
			 * 
			 * @attribute loaded
			 * @default function(dataSet){}
			 * @type {function}
			 */
			
			loaded: function(dataSet, newData){},
			/**
			 * Callback function of reset.
			 * 
			 * @attribute loaded
			 * @default function(dataSet){}
			 * @type {function}
			 */
			reset: function(){},
		};

		/**
		 * Set options. See DEFAULTS
		 * 
		 * @method  setOptions
		 * @param {object} options Ojbect of settings.
		 * @return {this}
		 */

		DataSet.prototype.setOptions = function(options){
			this.options = angular.extend({}, this.options, options || {} );
			return this;
		};

		/**
		 * Get limit plus one 
		 * 
		 * @method  getLimit
		 */
		DataSet.prototype.getLimit = function(){
			return this.options.limit + 1;
		};

		/**
		 * Get limit plus one 
		 * 
		 * @method  getLimit
		 */
		DataSet.prototype.getOffset = function(value){
			return this.offset * this.options.limit;
		};

		/**
		 * Get search value.
		 * 
		 * @method  getSearchValue
		 */
		DataSet.prototype.getSearchValue = function(){
			return this.serachValue;
		};

		/**
		 * Get search value. Method is called in selectbox actionFilter
		 * 
		 * @method  setSearchValue
		 * @param {string} value Filter string
		 * @return {this} 
		 */
		DataSet.prototype.setSearchValue = function(value){
			this.reset();
			this.serachValue = value;
			return this;
		};

		/**
		 * Reset instance
		 * 
		 * @method  reset
		 * @return {this}
		 */
		DataSet.prototype.reset = function(){
			this.data = [];
			this.loadDone = false;
			this.offset = 0;
			this.serachValue = null;
			this.options.reset();
			return this;
		};

		/**
		 * Load data from store. Call before load callback.
		 * 
		 * @method load
		 */
		DataSet.prototype.load = function(){
			var self = this;
			if (!this.loadDone) {
				
				this.options.beforeLoad(this);

				this.store.load(this, function(data){
					self.loaded(data);
				});
			}
		};

		/**
		 * Call after data is loaded
		 * 
		 * @method  loaded
		 * @param  {array} data New data from strore.
		 * @private
		 */
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

			/**
			 * Create array dataset
			 *
			 * @example
			 *      datafactory.createArrayDataset(
			 *          schemaFragment.enum, 
			 *          schemaFragment.enumTransCodes
			 *      );
			 * 
			 * @method createArrayDataset
			 * @param  {Array} key    Data keys
			 * @param  {Array} values Translation codes
			 * @return {xpsui:DataDatasetFactory} 
			 */
			createArrayDataset: function(key, values){
				var store = new ArrayStore();
				store.setData(key, values);

				return new DataSet(store);
			},

			/**
			 * Create http dataset
			 *
			 * @example
			 *      dataFactory.createObjectDataset(schemaFragment);
			 * 
			 * @method createObjectDataset
			 * @param  {Object} schemaFragment  Schema of the component
			 * @return {xpsui:DataDatasetFactory} 
			 */
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
