var ObjectTools = function() {

	/**
	 * Function iterated in depth object structure and calls visitor on
	 * property which name comply to provided propertyNameRegexp.
	 *
	 * Visitor function should look like function(value, propertyPath, origObj)
	 * value - value of property
	 * propertyPath - name of property dot denoted from root of original object
	 * origObj - original object
	 */
	this.propertyVisitor = function(obj, propertyNameRegexp, visitor, localPath, localObj) {
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

				if (propertyNameRegexp.test(nextLocalPath)) {
					visitor(nextLocalObj, nextLocalPath, obj);
				}

				this.propertyVisitor(obj, propertyNameRegexp, visitor, nextLocalPath + '.', nextLocalObj);
			}
		}
	}

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
				return localObj[pathArr[0]]
			}
		}

		// parse path into array
		var pathArr = new Array();
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
			};
		}

		// final cleanup at the end of iteration
		if (inQuotas) {
			throw new Error('Non-valid path');
		}
		if (frag) {
			pathArr.push(frag);
		}

		return evalPathInternal(obj, pathArr);
	}
}

module.exports = new ObjectTools();
