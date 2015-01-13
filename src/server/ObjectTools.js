var log = require('./logging.js').getLogger('ObjectTools.js');
var async = require('async');

var ObjectTools = function() {

	/**
	 * Function iterated in depth object structure and calls visitor on
	 * property paths that comply to provided propertyPathRegexp.
	 *
	 * Visitor function should look like function(value, propertyPath, origObj)
	 * value - value of property
	 * propertyPath - name of property dot denoted from root of original object
	 * origObj - original object
	 */
	this.propertyVisitor = function(obj, propertyPathRegexp, visitor, localPath, localObj) {
		// TODO prevent infinite loop in cyclic objects
		if (!localPath) {
			// initialize
			localPath = '';
			localObj = obj;
		}

		if (localObj === null) {
			// we cannot dive into null
			return;
		}

		if (typeof localObj === 'object' || typeof localObj === 'array') {
			// do stuff only if it is object or array
			for (var prop in localObj) {
				var nextLocalObj = localObj[prop];
				var nextLocalPath = localPath + prop;

				if (propertyPathRegexp.test(nextLocalPath)) {
					visitor(nextLocalObj, nextLocalPath, obj);
				}

				this.propertyVisitor(obj, propertyPathRegexp, visitor, nextLocalPath + '.', nextLocalObj);
			}
		}
	};

	/**
		Creates specified path if required and sets value to attribute
	*/
	this.setValue=function(o, path, v) {
		if ('null' === path) {
			return;
		}
		var parts = path.split('.');
		var obj = o;
		var prev;
		var lastPart = null;
		parts.map(function(part) {
			if (!obj[part]) {
				obj[part] = {};
			}

			prev = obj;
			obj = obj[part];
			lastPart = part;
		});
		var val = v;
		if (val){
			prev[lastPart]=val;
		} else {
			prev[lastPart]=null;
		}
	};


/**
		Removes specified path
	*/
	this.remove=function(o, path) {
		if (!path) {
			return;
		}

		var parts = path.split('.');

		var toRemove=path;
		if (parts){
			toRemove=parts.pop();
		}

		var obj=o;

		parts.map(function(part) {
			if (obj && obj[part]) {
				obj=obj[part];
			}else {
				obj=null;
			}
		});

		if (obj){
			delete obj[toRemove];
		}

	};

	/**
	 * Returns subrtree of object structure defined by path
	 */
	this.evalPath = function(obj, path) {

		var evalPathInternal = function(localObj, pathArr) {
			if (!localObj) {
				return undefined;
			}
			if (!pathArr || pathArr.lenght === 0) {
				return undefined;
			}
			if (typeof localObj !== 'object' && typeof localObj !== 'array') {
				// we cannot iterate further
				return undefined;
			}

			if (pathArr.length > 1) {
				// there is enought path fragments to continue
				var nextLocalObj = localObj[pathArr.shift()];
				if (nextLocalObj) {
					// we can dive inside object acording path
					return evalPathInternal(nextLocalObj, pathArr);
				}
			} else {
				// there has to be exactly one path fragment left
				return localObj[pathArr[0]];
			}
		};

		// parse path into array
		var pathArr = [];
		var frag = null;
		var inQuotas = false;
		for (var i = 0; i < path.length; i++) {
			switch (path.charAt(i)) {
				case '.':
					if (!frag) {
						throw new Error('Non-valid path');
					}

					if (inQuotas) {
						frag = (frag ? frag + path.charAt(i) : path.charAt(i));
					} else {
						pathArr.push(frag);
						frag = null;
					}
					break;
				case '"':
					if (inQuotas) {
						inQuotas = false;
					}
					inQuotas = false;
					break;
				default:
					frag = (frag ? frag + path.charAt(i) : path.charAt(i));
			}
		}

		// final cleanup at the end of iteration
		if (inQuotas) {
			throw new Error('Non-valid path');
		}
		if (frag) {
			pathArr.push(frag);
		}

		return evalPathInternal(obj, pathArr);
	};
	this.getValue=this.evalPath;

	/**
	 * Strippes number of segments from end of path
	 */
	this.stripFromPath = function(path, noOfSegments) {
		//TODO add support for quoted parameters
		var lastDot = path.length;

		for (var i=0; i < noOfSegments; i++) {
			var dotIndex = path.lastIndexOf('.', lastDot - 1);
			if (dotIndex > -1) {
				lastDot = dotIndex;
			} else {
				log.error('There is not enought segments in path to strip', {path: path, noOfSegments: noOfSegments});
				throw new Error('There is not enought segments in path to strip');
			}
		}

		return path.substr(0, lastDot);
	};

	// this is VERY but VERY nasty function, IT HAS TO BE FIXED. it do not handle lot of corner cases
	// FIXME FIX THIS NASTY FUNCTION
	this.schemaPathToObjectPath = function(schemaPath) {
		return schemaPath.replace(/properties\./g, '');
	};

	this.objecPathToSchemaPath = function(objPath) {
		return 'properties.'+objPath.replace(/\./g, '.properties.');
	};


	this.findSeqeunceFields=function(schemaObj){
		var that = this;
		var paths = [];
		this.propertyVisitor(schemaObj, /.\$sequence$/, function(val, path, obj) {
			paths.push(that.stripFromPath(path, 1));
		});

		return paths;
	};


	this.removeNullProperties=function(_obj){
		var that = this;
		this.propertyVisitor(_obj, /.*/ , function(val, path, obj) {
			if (val===null){
				that.remove(obj,path);
			}
		});
	};

	/**
	 * resolves all objectLinks for definded in schemaObj
	 *
	 * This funcition directly mutates object parameter
	 *
	 * @param schemaObj - expects schema.compiled
	 * @param object - object in which to resolve objectLinks
	 * @param iterator - function that gets registry, oid, fields (if null all fields should be provided), callback - callback is function(err, data) where data is hashtable of resutls
	 * @param callback - function(err, data), err in case of error, object returns enriched original object
	 */
	this.resolveObjectLinks = function(schemaObj, object, iterator, callback) {
		var linkSchemaPaths = [];
		var that = this;

		this.propertyVisitor(schemaObj, /.\objectLink$/, function(val, path, obj) {
			linkSchemaPaths.push(that.stripFromPath(path, 1));
		});

		// Internal iterator
		var objectLinkResolver = function(item, callback) {
			var schemaFragment = that.evalPath(schemaObj, item);
			var fields = [];
			for (var prop in schemaFragment.objectLink) {
				if (prop !== "registry") {
					fields.push(schemaFragment.objectLink[prop]);
				}
			}

			if (fields.length === 0) {
				fields = null;
			}

			var objectFragment = that.evalPath(object, that.schemaPathToObjectPath(item));

			if (objectFragment && objectFragment.registry && objectFragment.oid && fields) {
				iterator(objectFragment.registry, objectFragment.oid, fields, function(err, data) {
					if (err) {
						callback(err);
					}

					objectFragment.refData = objectFragment.refData || {};
					for (var prop in schemaFragment.objectLink) {
						if (prop !== "registry") {
							objectFragment.refData[prop] = data[schemaFragment.objectLink[prop]];
						}
					}

					callback(null, object);
				});
			} else {
				// not enought params to call iterator
				callback(null, object);
			}
		};

		async.map(linkSchemaPaths, objectLinkResolver, function(err, data) {
			callback(err, object);
		});
	};
};

module.exports = new ObjectTools();
