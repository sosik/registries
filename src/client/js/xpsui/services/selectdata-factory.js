(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:SelectDataFactory', ['xpsui:logging', '$timeout', '$translate','$http', '$parse', 'xpsui:SchemaUtil',  'xpsui:HttpHandlerFactory',
	function(log, $timeout, $translate, $http,$parse, schemaUtil, httpHandlerFactory) {
		/**
		 * DataSet
		 */

		// FIXME change to use queryfilter 
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

		/**
		 *
		 */
		function ObjectDataSet(store, options){
			DataSet.call(this, store, options);
		}

		ObjectDataSet.prototype = Object.create(DataSet.prototype);

		ObjectDataSet.prototype.loaded = function(data) {
			if(data.length <= this.options.limit){
				this.loadDone = true;
			} else {
				// remove limit plus one element
				data.pop();
			}
			
			this.data = this.data.concat(data);
			this.options.loaded(this,data);
			this.offset++;
		};
		
		ObjectDataSet.prototype.getFieldsSchema = function(index){
			return this.store.fields;
		};


		/**
		 * ObjectLinkStore
		 */
		function ObjectLinkStore(options){
			this.options = angular.extend({}, ObjectLinkStore.DEFAULTS, options || {} );
			this.schema = {};
			this.crits = null;
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
		ObjectLinkStore.prototype.setForcedCriteria = function(crits){
			this.crits = crits;
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
						crits: [], 
						limit: dataset.getLimit() , 
						skip: dataset.getOffset(), 
						sorts:[]
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

			config.data.sorts.push({
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
			if (this.crits && angular.isArray(this.crits)) {
				config.data.crits.concat(this.crits);
			}

			var _searchVal = dataset.getSearchValue();

			//FIXME make sure that getSearchValue is always string and always non null
			if (_searchVal && angular.isString(_searchVal) && _searchVal.length > 0) {
				for (field in this.schema.fields) {
					config.data.crits.push({
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
			if( data && typeof data === 'object'){
				// if there are refData in object (objectLink)
				if(data.refData){
					return data;
				}


				// if there is no refData, try to parse fields form model
				// FIXME does this make sense???
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

		/**
		 * HttpStoreTest
		 */

		function HttpStoreTest(){
			// this.options = angular.extend({}, HttpStoreTest.DEFAULTS, options || {} );
			this.data = [];
			this.fields = {};
			this.fieldsIndex = [];

			this._fieldsSchemaFragment = {};
			this._lables = {};
		};

		HttpStoreTest.DEFAULTS = {
			// url: null
		};

		// ref to schema objectlink2.fields
		HttpStoreTest.prototype.setFields = function(fields){
			var field;

			this.fields = fields;
			for( field in this.fields){
				this.fieldsIndex.push(field);
			}
			return this;
		};

		HttpStoreTest.prototype.setScope = function(scope){
			this.scope = scope;
			return this;
		};

		// ref to schema objectlink2.schema
		HttpStoreTest.prototype.setSchema = function(schema){
			this.schema = schema;
			return this;
		};

		HttpStoreTest.prototype.getFieldSchemaFragment = function(index){
			var fieldName = typeof index === "string" ? index : this.fieldsIndex[index];
			if(!this._fieldsSchemaFragment[fieldName]){
			 	this._fieldsSchemaFragment[fieldName] = HttpStoreTest.getFieldSchemaFragment(
			 		this.schema, this.fields[fieldName], this.scope
		 		);
			}
			return this._fieldsSchemaFragment[fieldName];
		}


		//@todo use schemaUtil instead
		HttpStoreTest.getFieldSchemaFragment = function(schema, field, scope){
			var fieldProp = field.split("."),
				path = [
					schema,
					"properties",
					fieldProp[0],
					"properties",
					fieldProp[1]
				],
				getter = $parse(path.join('.'))
			;

		 	return getter(scope);
		}


		HttpStoreTest.prototype.getLabel = function(index){
			var fieldName = typeof index === "string" ? index : this.fieldsIndex[index];

			if(!this._lables[fieldName]){
			 	this._lables[fieldName] = this.getFieldSchemaFragment(fieldName).title;
			}
			return this._lables[fieldName];
		};

		HttpStoreTest.prototype.setTestData = function(count){
			function randomString(length, chars) {
			    var mask = '';
			    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
			    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			    if (chars.indexOf('#') > -1) mask += '0123456789';
			    if (chars.indexOf('D') > -1) mask += '123456789';
			    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
			    var result = '';
			    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
			    return result;
			}

			for( var i = 0 ; i < count; i++){
				var item = {
					schema:"uri://",
					oid:i,
					refdata:{}
				};
				for(var j = 0; j < this.fieldsIndex.length; j++){
					//var setter = $parse(this.fields[j]).assign;
					// item.refdata[this.fieldsIndex[j]]

					switch(this.getFieldSchemaFragment(j).type){
						case "date":
							item.refdata[this.fieldsIndex[j]] = '20140' + randomString(1, 'D') +'1' + randomString(1, 'D');
							break;
						default:
							item.refdata[this.fieldsIndex[j]] = randomString(10, '#aA');
					}
				}

				this.data.push(item);
			}
		};

		HttpStoreTest.prototype.load = function(dataset, callback){
			var self = this;

			this.timeout && $timeout.cancel(this.timeout);

			this.timeout = $timeout(function(){
				var data = [];

				data = self.data;

				callback(
					data.slice(dataset.getOffset(), dataset.getLimit() + dataset.getOffset())
				);
			}, 3000);
			console.log('HttpStoreTest::load');
		};

		return {
			dataSetController: DataSet,
			arrayStoreController: DataSet,
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

				return new ObjectDataSet(store);
			},
			createTestDataset: function(scope, schemaFragment, itemLenght){
				var store = new HttpStoreTest();
				store.setFields(schemaFragment.objectLink2.fields)
					.setScope(scope)
					.setSchema(schemaFragment.objectLink2.schema)
					.setTestData(itemLenght ? itemLenght: 4000)
				;

				return new ObjectDataSet(store);
			},
			getFieldSchemaFragment: HttpStoreTest.getFieldSchemaFragment,
			getObjectLinkData: ObjectLinkStore.getData
		}
	
	}]);
}(window.angular));
