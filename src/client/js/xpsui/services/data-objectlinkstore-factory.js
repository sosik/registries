(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:DataObjectlinkstoreFactory', ['xpsui:logging', '$http', '$parse', 'xpsui:SchemaUtil',  'xpsui:HttpHandlerFactory',
	function (log, $http, $parse, schemaUtil, httpHandlerFactory) {

		/**
		 * ObjectLinkStore
		 */
		function ObjectLinkStore(options){
			this.options = angular.extend({}, ObjectLinkStore.DEFAULTS, options || {} );
			this.schema = {};
			this.criteria = null;
			this.fields = null;
			this.http = null;
		}

		ObjectLinkStore.DEFAULTS = {
			searchCondition: 'starts',
			orderBySort: 'asc'
		};

		ObjectLinkStore.prototype.initFieldsSchema = function(callback){
			var self = this;
			if(!this.fields){
				schemaUtil.getFieldsSchemaFragment(
					this.schema.schema, 
					this.schema.fields, 
					function(fields){
						self.fields = fields;
						callback();
					}
				);

				return ;
			}
			callback();
		};

		ObjectLinkStore.prototype.getHttp = function(){
			if(!this.http){
				this.http = httpHandlerFactory.newHandler();
			}
			return this.http ;
		};

		// ref to schema objectLink2ForcedCriteria
		ObjectLinkStore.prototype.setForcedCriteria = function(criteria){
			this.criteria = criteria;
			return this;
		};

		// ref to schema objectLink2
		ObjectLinkStore.prototype.setSchema = function(schema){
			this.schema = schema;
			return this;
		};

		ObjectLinkStore.prototype.getHttpConfing = function(dataset){
			var config = {
					method : 'POST',
					url: '/search/' + schemaUtil.encodeUri(this.schema.schema),
					data: {
						criteria: [], 
						limit: dataset.getLimit() , 
						skip: dataset.getOffset(), 
						sortBy:[]
					}
				},
				orderByName = null
			;

			// orderBy
			if (!this._orderByName) {
				for (var field in this.schema.fields){
					this._orderByName = this.schema.fields[field];
					break;
				}
			}

			config.data.sortBy.push({
				"f": this._orderByName,
				"o": this.options.orderBySort
			});

			// search criteria
			// for (var field in this.schema.fields){
			// 	config.data.criteria.push({
			// 		f: this.schema.fields[field],
			// 		v: dataset.getSearchValue() ? dataset.getSearchValue() : '',
			// 		op: this.options.searchCondition
			// 	});
			// }
			
			//FIXME make sure this.criteria is always array never null
			if (this.criteria && angular.isArray(this.criteria)) {
				config.data.criteria.concat(this.criteria);
			}

			var _searchVal = dataset.getSearchValue();

			//FIXME make sure that getSearchValue is always string and always non null
			if (_searchVal && angular.isString(_searchVal) && _searchVal.length > 0) {
				for (field in this.schema.fields) {
					config.data.criteria.push({
						f: this.schema.fields[field],
						v: _searchVal,
						op: this.options.searchCondition
					});

					break;
				}

			}

			return config;
		};

		ObjectLinkStore.prototype.load = function(dataset, callback){
			var self = this;

			this.initFieldsSchema(function(){
				var promise = self.getHttp().http(
					self.getHttpConfing(dataset)
				);

				promise.then(
					// success
					function(args){
						var data = [];

						if(args.data && args.data instanceof Array){
							for (var i = 0; i < args.data.length; i++) {
								data.push(
									ObjectLinkStore.getData(
										self.schema,
										args.data[i]
									)
								);
							}
						}
						callback(data);
					},

					// error
					function(){
						arguments;
					}
				);
			});

		};

		/**
		 * Get data from schema or model
		 *
		 * @param objectLink schema definition of object link (under objectLink2 keyword)
		 * @param data data value of object link (data in model)
		 *
		 * @return data from model (if refData exists) or try to parse it form model
		 */
		ObjectLinkStore.getData = function(objectLink, data) {
			if( typeof data === 'object'){
				// if there are refData in object (objectLink)
				if(data.refData){
					return data;
				}


				// if there is no refData, try to parse fields form model
				// FIXME does this make sense???
				// transform object from search service
				// e.g. 
				//  from {baseData: {name: "test", competitionCategory: "1.NHL"}, id: "5537519f1d8ab05310237918"}
				//  to {refData: {name: "test", competitionCategory: "1.NHL"}, id: "5537519f1d8ab05310237918"}
				var field,
					outData = {
						schema: objectLink.schema,
						oid: data.id,
						refData: {}
					};
				
				for (field in objectLink.fields) {
					var getter = $parse(objectLink.fields[field]);
					// FIXME what is this?
					outData.refData[field] = getter(data);
				}

				return outData;
			}
			
			return null;
		};

		return ObjectLinkStore;
	}]);
}(window.angular));
