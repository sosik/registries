var operation = {
	EXISTS: 'ex', // field exists in structure
	EQUAL: 'eq', // field value is equal
	GREATER: 'gt',
	GREATER_EQUAL: 'gte',
	LESS: 'lt',
	LESS_EQUAL: 'lte',
	NOT_IN: 'nin',
	IN: 'in',
	NOT_EQUAL: 'neq', // field value is not equal
	CONTAINS:'contains',
	STARTS_WITH: 'starts', // field value starts with
	ALL: 'all' // all values present in array
};

var sort = {
	ASC: 'asc',
	DESC: 'desc'
};

var QueryFilter = function() {
	this.crits = [];
	this.fields = [];
	this.sorts = [];
	this.limit=1000;
	this.skip=0;

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
				case operation.NOT_IN:
					c = {f: field, op: operation.NOT_IN, v: val};
					break;
				case operation.IN:
					c = {f: field, op: operation.IN, v: val};
					break;
					case operation.ALL:
					c = {f: field, op: operation.ALL, v: val};
					break;

				case operation.LESS:
				c = {f: field, op: operation.LESS, v: val};
				break;
				case operation.LESS_EQUAL:
				c = {f: field, op: operation.LESS_EQUAL, v: val};
				break;
				case operation.GREATER:
				c = {f: field, op: operation.GREATER, v: val};
				break;
				case operation.GREATER_EQUAL:
				c = {f: field, op: operation.GREATER_EQUAL, v: val};
				break;
				case operation.CONTAINS:
				c = {f: field, op: operation.CONTAINS, v: val};
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

	this.setLimit= function (limit){
		this.limit=limit;
	};

	this.setSkip= function (skip){
		this.skip=skip;
	};

};

module.exports = {
	operation: operation,
	sort: sort,
	create: function() {
		return new QueryFilter();
	}
};
