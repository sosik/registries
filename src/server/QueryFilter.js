var operation = {
	EXISTS: 'ex', // field exists in structure
	EQUAL: 'eq', // field value is equal
	NOT_EQUAL: 'neq', // field value is not equal
	STARTS_WITH: 'starts' // field value starts with
};

var sort = {
	ASC: 'asc',
	DESC: 'desc'
};

var QueryFilter = function() {
	this.crits = [];
	this.fields = [];
	this.sorts = [];

	this.addCriterium = function(field, op, val) {
		var c = {};
		if (!field) {
			throw new Error('Property field is mandatory!');
		}

		if (op) {
			switch(op) {
				case operation.EXISTS:
					c = {f: field, op: operation.EXISTS};
					break;
				case operation.EQUAL:
					c = {f: field, op: operation.EQUAL, v: val};
					break;
				case operation.NOT_EQUAL:
					c = {f: field, op: operation.NOT_EQUAL, v: val};
					break;
				case operation.STARTS_WITH:
					c = {f: field, op: operation.STARTS_WITH, v: val};
					break;
				default:
					throw new Error('Unknown operation: ' + op);
			}
		} else {
			// operation is not defined, using default
			c = {
				f: field,
				op: operation.EXISTS
			};
		}

		this.crits.push(c);

		return this;
	};

	this.addField = function(field) {
		if (field) {
			this.fields.push(field);
		}

		return this;
	};

	this.addSort = function(field, order) {
		if (!field) {
			throw new Error('Property field is mandatory!');
		}

		var o = sort.DESC;

		if (order) {
			if (order === sort.ASC) {
				o = sort.ASC;
			} else if (order === sort.DESC) {
				o = sort.DESC;
			} else {
				throw new Error('Unknown value of order field: ' + order);
			}
		} else {
			// order not defined using default
			o = sort.DESC;
		}

		this.sorts.push({f: field, o: o});

		return this;
	};
};

module.exports = {
	operation: operation,
	sort: sort,
	create: function() {
		return new QueryFilter();
	}
};
