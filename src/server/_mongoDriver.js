var log = require('./logging.js').getLogger('_mongoDriver.js');
/*
 * @module mongoDriver
 */
module.exports = function(MongoClient, ObjectID, QueryFilter) {
	var _database = null;

	return {
		/*
		 * @func init
		 *  async db initialization
		 */
		init: function(mongoDbURI, callback) {
			MongoClient.connect(mongoDbURI, function(err, db) {
				if (err) {
					callback(err);
				}

				_database = db;
				callback(null);
			});
		},
		getDb: function() {
			//TODO add logging
			if (!_database) {
				throw new Error('Database instance is not initialized!');
			}

			return _database;
		},
		close: function() {
			_database.close();
		},

		nextSequence:function(sequencerName,callback){
				var col =_database.collection('sequencers');
				var ret = col.findAndModify({ _id: sequencerName },[],{ $inc: { seq: 1} },{new: true, upsert: true } ,callback);
		},
		/**
		 * Function converts ObjectId form mongo returned object into flat
		 * hexadecimal representation of id
		 *
		 * @param obj to mangle
		 * @return mangled object
		 */
		_id2id: function(obj) {
			if (obj && obj._id) {
				var mangledId = obj._id.toHexString();
				obj.id = mangledId;
				delete obj._id;
				return obj;
			}
			// nothing to mangle
			return obj;
		},
		id2_id: function(obj) {
			if (obj && obj.id) {
				var idToMangle = obj.id;
				obj._id = ObjectID.createFromHexString(idToMangle);
				delete obj.id;
				return obj;
			}
			// nothing to mangle
			return obj;
		},
		constructUpdateObject: function(obj) {
			if (!obj) {
				return null;
			}

			var set = {};
			
			var unset = {};
			// TODO handle arrays, functions, etc.
			var propIterator = function(prefix, obj) {
				var key;
				for (key in obj) {
					// skip id key of object
					if (key === 'id' && prefix === null) {
						continue;
					}
					if (typeof obj[key] === 'object') {
						if (obj[key] === null) {
							unset[prefix === null ? key: prefix + "." + key] = 1;
						} else {
							propIterator(prefix === null ? key: prefix + "." + key, obj[key]);
						}
					} else {
						set[prefix === null ? key: prefix + "." + key] = obj[key];
					}
				}
			};

			propIterator(null, obj);
			
			if ( Object.keys(unset).length === 0 ) { 
				return {$set: set};
			}
			
			

			return {$set: set, $unset: unset};
		},
		/**
		 *
		 */
		constructSearchQuery: function(queryFilter) {
			if (!queryFilter) {
				throw new Error('Parameter queryFilter is mandatory!');
			}

			var searchCriteria = {};
			if (queryFilter.crits) {
				for (var i = 0; i < queryFilter.crits.length; i++) {
					var c = queryFilter.crits[i];

					var query;

					if (c.op === QueryFilter.operation.EQUAL) {
						query = c.v;
					} else if (c.op === QueryFilter.operation.NOT_EQUAL) {
						query = {'$ne': c.v};
					} else if (c.op === QueryFilter.operation.GREATER) {
						query = {'$gt': c.v};
					} else if (c.op === QueryFilter.operation.GREATER_EQUAL) {
						query = {'$gte': c.v};
					} else if (c.op === QueryFilter.operation.LESS) {
						query = {'$lt': c.v};
					} else if (c.op === QueryFilter.operation.LESS_EQUAL) {
						query = {'$lte': c.v};
					} else if (c.op === QueryFilter.operation.STARTS_WITH) {
						query = {'$regex': '^'+c.v+'.*' , $options: 'i'};
					} else if (c.op === QueryFilter.operation.EXISTS) {
						query = {'$exists' : true};
					} else {
						throw new Error('Unsupported operation: ' + c.op);
					}

					searchCriteria[c.f] = query;
					log.verbose('constructed query',c.f);
				}
			}
			log.verbose('constructed query',searchCriteria);
			
			var fields = {};
			if (queryFilter.fields) {
				for (var i = 0; i < queryFilter.fields.length; i++) {
					fields[queryFilter.fields[i]] = 1;
				}
			}

			var sorts = {};
			if (queryFilter.sorts) {
				for (var i = 0; i < queryFilter.sorts.length; i++) {
					var s = {};
					if (queryFilter.sorts[i].o === QueryFilter.sort.ASC) {
						sorts[queryFilter.sorts[i].f] = 1;
					} else {
						sorts[queryFilter.sorts[i].f] = -1;
					}
				}
			}
		
			log.verbose(searchCriteria,fields,sorts);
				
			return {
				selector: searchCriteria,
				fields: fields,
				sort: sorts,
				skip: queryFilter.skip,
				limit: queryFilter.limit
			};
		}
	};
};
