/**
 * Shared module QueryFilter
 *
 * @module QueryFilter
 */
(function (angular, module) {

	/**
	 * Enumeration of query operations
	 *
	 * @class QueryFilterModule.operation
	 */
	var operation = {
		/**
		 * Field value is equal
		 *
		 * @property EQUAL
		 */
		EQUAL: 'eq',
		/**
		 * Field value is greater
		 *
		 * @property GREATER
		 */
		GREATER: 'gt',
		/**
		 * Filed value is greater or equal
		 *
		 * @property GREATER_EQUAL
		 */
		GREATER_EQUAL: 'gte',
		/**
		 * Field value is less 
		 *
		 * @property LESS
		 */
		LESS: 'lt',
		/**
		 * Field value is less or equal
		 *
		 * @property LESS_EQUAL
		 */
		LESS_EQUAL: 'lte',
		/**
		 * Field value is not in (one of)
		 *
		 * @property NOT_IN
		 */
		NOT_IN: 'nin',
		/**
		 * Field value is in (one of)
		 *
		 * @property IN
		 */
		IN: 'in',
		/**
		 * Field value is not equal
		 *
		 * @property NOT_EQUAL
		 */
		NOT_EQUAL: 'neq',
		/**
		 * Field value is substring
		 *
		 * @property CONTAINS
		 */ 
		CONTAINS:'contains',
		/**
		 * Field value is prefix
		 *
		 * @property STARTS_WITH
		 */ 
		STARTS_WITH: 'starts',
		/**
		 * Field exists in structure
		 *
		 * @property EXISTS
		 */
		EXISTS: 'ex',
		/**
		 * Field does not exist in structure
		 * 
		 * @property NOT_EXISTS
		 */
		NOT_EXISTS: 'nex',
		/**
		 * Field values are all present
		 *
		 * @property ALL
		 */
		ALL: 'all'
	};

	/**
	 * Enumeration of query result sort orders.
	 *
	 * @class QueryFilterModule.sort
	 */
	var sort = {
		/**
		 * Sort ascending
		 *
		 * @property ASC
		 */
		ASC: 'asc',
		/**
		 * Sort descending
		 *
		 * @property DESC
		 */
		DESC: 'desc'
	};

	/**
	 * QueryFilter is used to define query criteria.
	 * 
	 * @param {object} [payload] structure to prefill instantiated QueryFilter,
	 * main use is to put here parsed json value of another query filter
	 *
	 * @class QueryFilter
	 * @constructor
	 */
	var QueryFilter = function(payload) {
		this.crits = [];
		this.fields = [];
		this.sorts = [];
		this.limit=0;
		this.skip=0;

		if (payload) {
			this.skip = (payload.skip || 0);
			this.limit = (payload.limit || 0);

			// TODO better validation of input
			if (payload.crits && payload.crits.slice) {
				this.crits = payload.crits.slice();
			}
			if (payload.fields && payload.fields.slice) {
				this.fields = payload.fields.slice();
			}
			if (payload.sorts && payload.sorts.slice) {
				this.sorts = payload.sorts.slice();
			}
		}
	};

	/**
	 * Adds criterium to query criterias.
	 *
	 * @method addCriterium
	 * @param {string} field name of field in criterium
	 * @param {QueryFilter.operation} name of operation in criterium
	 * @param {object} value in criterium
	 *
	 * @return {QueryFilter} this isntance of QueryFilter
	 * @chainable
	 */
	QueryFilter.prototype.addCriterium = function(field, op, val) {
		var c = {};
		if (!field) {
			throw new Error('Property field is mandatory!');
		}

		if (op) {
			switch(op) {
				case operation.EXISTS:
					c = {f: field, op: operation.EXISTS};
					break;
				case operation.NOT_EXISTS:
						c = {f: field, op: operation.NOT_EXISTS};
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

	/**
	 * Add field to list of fields that should be part of query result
	 *
	 * @method addField
	 * @param {string} field name of field to return as result of query
	 *
	 * @return {QueryFilter} this isntance of QueryFilter
	 * @chainable
	 */
	QueryFilter.prototype.addField = function(field) {
		if (field) {
			this.fields.push(field);
		}

		return this;
	};

	/**
	 * Add sort definition into query
	 *
	 * @method addSort
	 * @param {string} field name of field
	 * @param {QueryFirter.sort} order order of sort
	 *
	 * @return {QueryFilter} this isntance of QueryFilter
	 * @chainable
	 */
	QueryFilter.prototype.addSort = function(field, order) {
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

	/**
	 * Set limit on number of returned results
	 *
	 * @method setLimit
	 * @param {number} limit max number of records to return
	 *
	 * @return {QueryFilter} this isntance of QueryFilter
	 * @chainable
	 */
	QueryFilter.prototype.setLimit = function(limit) {
		this.limit=limit;
		
		return this;
	};

	/**
	 * Set number of records that should be skipped and not return as result of query
	 *
	 * @method setSkip
	 * @param {number} skip how many records to skip
	 *
	 * @return {QueryFilter} this isntance of QueryFilter
	 * @chainable
	 */
	QueryFilter.prototype.setSkip = function(skip) {
		this.skip=skip;
		
		return this;
	};

	/**
	 * Module used for handling of query filters
	 *
	 * @class QueryFilterModule
	 */
	var exportsObject = {
		/**
		 * Static accessor to QueryFilter operations
		 *
		 * @property {QueryFilterModule.operation} operation
		 * @static
		 */
		operation: operation,
		/**
		 * Static accessor to QueryFulter sorts
		 *
		 * @property {QueryFilterModule.sort} sort
		 * @static
		 */
		sort: sort,
		/**
		 * Creates new instance of query filter.
		 *
		 * @method create
		 * @param {object} [payload] to initialize created QueryFilter
		 * @return {QueryFilter} new instance of QueryFilter
		 */
		create: function(payload) {
			return new QueryFilter(payload);
		}
	};

	if (module) {
		/**
		 * Nodejs variant of shared QueryFilter module.
		 *
		 * @class QueryFilter (nodeJS module)
		 * @extends QueryFilterModule
		 */
		module.exports = exportsObject;

	} else {
		/**
		 * Angular variant of shared QueryFilter module.
		 *
		 * @class xpsui:QueryFilter (angular factory)
		 * @extends QueryFilterModule
		 */
		angular.module('xpsui:services')
			.factory('xpsui:QueryFilter', [function() {
			return exportsObject;
		}]);
	}

}(
	(typeof angular === "undefined") ? null : angular,
	(typeof module === "undefined") ? null : module));


