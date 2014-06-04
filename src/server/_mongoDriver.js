module.exports = function(MongoClient, ObjectID, QueryFilter) {
	var _database = null;

	return {
		/* async db initialization */
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
			
			//FIXME:[PS] this need to be validated, mongo 2.6.1 requires this map to be non empty 
			var unset = {congo_bongo : 1};
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
					} else if (c.op === QueryFilter.operation.EXISTS) {
						query = {'$exists' : true};
					} else {
						throw new Error('Unsupported operation: ' + c.op);
					}

					searchCriteria[c.f] = query;
				}
			}

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
						sorts[queryFilter.sorts[i].f] = 0;
					}
				}
			}

			return {
				selector: searchCriteria,
				fields: fields,
				sort: sorts
			};
		}
	};
};
