'use strict';
/**
 * Universal database access wrapper.
 *
 * @module server
 * @submodule UniversalDao
 */
var log = require('./logging.js').getLogger('UniversalDao.js');
var extend = require('extend');
var mongoDriver = require('./mongoDriver');

var DEFAULT_OPTIONS = {
};

/**
 * Configurable universal dao used to access data in mongoDB
 *
 * @class UniversalDao
 * @constructor
 */
var UniversalDao = function(mongoDriver, options) {
	if (!mongoDriver) {
		throw new Error('Paramenter mongoDriver is not provided!');
	}
	var _options = extend(true, {}, DEFAULT_OPTIONS, options || {});

	if (!_options.collectionName) {
		throw new Error('Parameter options.collectionName is mandatory!');
	}

	var _collection = mongoDriver.getDb().collection(_options.collectionName);


	/**
	 * @callback resultCallback
	 * @param {Error} err - error or null
	 * @param {Object} result - result of operation
	 */

	/**
	 * Save object
	 *
	 * @method
	 * @param {Object} obj - object to save
	 * @param {resultCallback} callback - async callback
	 */
	this.save = function(obj, callback) {
		mongoDriver.id2_id(obj);
		_collection.save(obj, function(err, result) {
			if (err) {
				callback(err);
				return;
			}

			mongoDriver._id2id(result);
			callback(null, result);
		});
	};


	/**
	 * Get object
	 *
	 * @param {String} id - object identifier as string
	 * @param {resultCallback} callback - async callback
	 */
	this.get = function(id, callback) {
		if (id) {
			_collection.findOne(mongoDriver.id2_id({"id":id}), function(err, data) {
				if (err) {
					callback(err);
					return;
				}

				callback(null, mongoDriver._id2id(data));
			});
		} else {
			log.error('Property "id" is undefined!');
			callback(new Error('Property "id" is undefined'));
			return;
		}
	};


	/**
	* Get object
	*
	* @param {String} id - object identifier as string
	* @param {resultCallback} callback - async callback
	*/
	this.getWithTimeLock = function(entity,lockDuration, callback) {
		var currentTs= new Date().getTime();
		var tillTs= currentTs+lockDuration;
		if (entity.id) {
			entity._lockedTill=tillTs;
			var searchKey = mongoDriver.id2_id({'id': entity.id,$or:[{_lockedTill:{$lt:currentTs}},{_lockedTill:{$exists:false}}]});
			_collection.findAndModify(searchKey,[], entity ,{new: false, upsert: false },function(err,data){
				console.log(err,data);
				callback(err,data);
			} );
		} else {
			log.error('Property "id" is undefined!');
			callback(new Error('Property "id" is undefined'));
			return;
		}
	};


	/**
	 * Update object
	 *
	 * @param {Object} obj - object to update, it has to contain id field as string
	 * @param {resultCallback} callback - async callback, result parameter contains number of upadet objects
	 */
	this.update = function(obj, callback) {
		if (!obj.id) {
			callback(new Error('Updated object has to have id'));
			return;
		}
		var searchKey = mongoDriver.id2_id({'id': obj.id});
		var updateObj = extend({}, obj);
		delete updateObj.id;

		if (!searchKey._id) {
			callback(new Error('Failed to construct object identifier'));
			return;
		}
		_collection.update(searchKey,
				mongoDriver.constructUpdateObject(obj),
				{upsert: false, multi: false}, function(err, count, result) {
			if (err) {
				callback(err);
				return;
			}

			if (!result.updatedExisting || result.n !== 1) {
				callback(new Error('Neither object with id ' + obj.id + ' not found or updated more documents'));
				return;
			}
			callback(null, count);
		});
	};

	/**
	 * Remove object
	 *
	 * @param {String} id - object identifier as string
	 * @param {resultCallback} callback - async callback, result parameter contains number of removed objects
	 */
	this.remove = function(id, callback) {
		_collection.remove(mongoDriver.id2_id({"id":id}), function(err, count){
			if (err) {
				callback(err);
				return;
			}

			if (count !== 1) {
				callback(new Error('Removed '+ count + ' documents'));
				return;
			}

			callback(null, count);
		});
	};

	/**
	* Remove objects matching criteria
	*
	* @param {Object} queryFilter - search options - use QueryFilter class
	* @param {resultCallback} callback - async callback, result parameter contains number of removed objects
	*/
	this.delete=function(queryFilter,callback){
		var _findOptions = mongoDriver.constructSearchQuery(queryFilter);

		_collection.remove(_findOptions.selector, function(err, count){
			if (err) {
				callback(err);
				log.error();
				return;
			}

			callback(null, count);
		});

	};

	/**
	 * List objects by criteria
	 *
	 * @param {Object} queryFilter - search options - use QueryFilter class
	 * @param {resultCallback} callback - async callback, result parameter contains found objects
	 */
	this.list = function(queryFilter, callback) {
		var _findOptions = mongoDriver.constructSearchQuery(queryFilter);

			log.silly(_findOptions);
		_collection.find(_findOptions.selector, _findOptions, function(err, cursor){
			if (err) {
				callback(err);
				return;
			}

			cursor.toArray(function(err, data) {
				if (err) {
					callback(err);
					return;
				}

				var result = [];
				for (var i = 0; i < data.length; i++) {
					result.push(mongoDriver._id2id(data[i]));
				}
				callback(null, result);
				return;
			});
		});
	};

	this.find=this.list;

	/**
	 * Counts objects queried by criteria
	 *
	 * @param {Object} queryFilter - search options - use QueryFilter class
	 * @param {resultCallback} callback - async callback, result parameter contains count
	 */
	this.count = function(queryFilter, callback) {
		var _findOptions = mongoDriver.constructSearchQuery(queryFilter);
			delete _findOptions.limit;

			log.silly(_findOptions);
		_collection.find(_findOptions.selector, _findOptions, function(err, cursor){
			if (err) {
				callback(err);
				return;
			}
			cursor.count(callback);
		});
	};

	/**
	 * Returns distinct paths
	 *
	 * @param {String} path - expression for distinct values.
	 * @param {Object} queryFilter - search options - use QueryFilter class.
	 * @param {resultCallback} callback - async callback, result data contain distinct values
	 */
	this.distinct = function(path, queryFilter, callback) {
		var _findOptions = mongoDriver.constructSearchQuery(queryFilter);
		delete _findOptions.limit;

		log.silly(_findOptions);
		_collection.distinct(path, _findOptions.selector, function(err, data){
			if (err) {
				callback(err);
				return;
			}
			log.silly(data);
			callback(null, data);
		});
	};

	/**
	* Aggregate
	*
	* @param {Object} queryFilter - search options - use QueryFilter class
	* @param {resultCallback} callback - async callback, result parameter contains count
	*/
	this.aggregate = function(aggquery, callback) {

		_collection.aggregate(aggquery, function(err, cursor){
			if (err) {
				callback(err);
				return;
			}
			callback(null,cursor);
		});
	};

	/**
	 * Get actual dao options
	 *
	 * @returns clone of actual options object
	 */
	this.options = function() {
		return extend({}, _options);
	};
};

module.exports = {
	UniversalDao: UniversalDao
};
