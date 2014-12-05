(function(angular) {
	'use strict';

	angular.module('xpsui:services')
	.factory('xpsui:SelectDataFactory', ['xpsui:logging', '$timeout', '$translate','$http', '$parse',  function(log, $timeout, $translate, $http,$parse) {
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
			limit: 30,
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
						k: data.enum[i]
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

		ObjectDataSet.prototype.getLables = function(){
			return this.store.lables;
		}

		ObjectDataSet.prototype.loaded = function(data){
			if(data.length <= this.options.limit){
				this.loadDone = true;
			} else {
				// remove limit plus one element
				data.pop();
			}
			
			var tData = this._transformData(data);
			this.data = this.data.concat(tData);
			this.options.loaded(this,tData);
			this.offset++;
		}

		ObjectDataSet.prototype._transformData = function(data){
			var transformed = [];
			for(var i = 0; i < data.length; i++){
				var curData = data[i];

				var item = {
					oid:curData.oid,
					data: []
				};
				for(var j = 0; j < this.store.fieldsIndex.length; j++){
					item.data.push(curData.refdata[this.store.fieldsIndex[j]]);
					// var getter = $parse(this.store.fields[j]);
					// item.data.push(getter(curData));
				}

				transformed.push(item);
			
			}
			return transformed;
		}



		/**
		 * HttpStoreTest
		 */

		function HttpStoreTest(){
			// this.options = angular.extend({}, HttpStoreTest.DEFAULTS, options || {} );
			this.data = [];
			this.fields = {};
			this.fieldsIndex = [];

			this._fieldsSchemaFragment = {};
			this._lables = [];
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
			var fieldName = this.fieldsIndex[index];
			if(!this._fieldsSchemaFragment[fieldName]){
				var fieldProp= this.fields[fieldName].split("."),
					path = [
						this.schema,
						"properties",
						fieldProp[0],
						"properties",
						fieldProp[1]
					],
					getter = $parse(path.join('.'))
				;

			 	this._fieldsSchemaFragment[fieldName] = getter(this.scope);
			}
			return this._fieldsSchemaFragment[fieldName];
		}

		HttpStoreTest.prototype.getLable = function(index){
			if(!this._lables[index]){
			 	this._lables[index] = this._fieldsSchemaFragment[index].title;
			}
			return this._lables[index];
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
				// var regExp = new RegExp('^' + (dataset.getSearchValue() || '') ,'i');
				// for (var i = 0; i < self.data.length; ++i) {
				// 	if (regExp.test(self.data[i].v)) {
				// 		data.push(self.data[i]);
				// 	}
				// }

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
			createTestDataset: function(scope, schemaFragment, itemLenght){
				var store = new HttpStoreTest();
				store.setFields(schemaFragment.objectlink2.fields)
					.setScope(scope)
					.setSchema(schemaFragment.objectlink2.schema)
					.setTestData(itemLenght ? itemLenght: 4000)
				;

				return new ObjectDataSet(store);
			}
		}
	
	}]);
}(window.angular));