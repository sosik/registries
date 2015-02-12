describe("xpsui:Calculator", function () {

	var $compile,
		$rootScope,
		$q,
		calculator;

	var SCHEMAS = {
		concatStatic: {
			func: 'concat',
			args: ['Johan', ' ', 'Straus']
		},
		concat: {
			func: 'concat',
			args: {
				p1: {
					func: 'get',
					args: {
						path: 'baseData.firstName'
					}
				},
				p2: ' ',
				p3: {
					func: 'get',
					args: {
						path: 'baseData.lastName'
					}
				}
			}
		},
		concatWithDefaults: {
			func: 'concat',
			args: {
				p1: {
					func: 'get',
					args: {
						path: 'baseData.firstName'
					}
				},
				p2: ' ',
				p3: {
					func: 'get',
					args: {
						path: 'baseData.lastName'
					},
					def: 'Hraško'
				}
			}
		},
		concatWithWatch: {
			func: 'concat',
			args: {
				p1: {
					func: 'get',
					args: {
						path: 'baseData.firstName'
					},
					watch: true
				},
				p2: ' ',
				p3: {
					func: 'get',
					args: {
						path: 'baseData.lastName'
					},
					watch: true
				}
			}
		},
		idToBirthDay: {
			// Based on the WIKI: http://sk.wikipedia.org/wiki/Rodn%C3%A9_%C4%8D%C3%ADslo
			func: 'concat',
			args: [
				{
					func: 'substr',
					args: [{
						func: 'replace',
						args: [{
							func: 'get',
							args: ['baseData.registrationId'],
							watch: true
						}, '/', '']
					}, 4, 2]
				},
				'.', {
					func: 'pad',
					args: [{
						func: 'mod',
						args: [{
							func: 'substr',
							args: [{
								func: 'replace',
								args: [{
									func: 'get',
									args: ['baseData.registrationId'],
									watch: true
								}, '/', '']
							}, 2, 2]
						}, 50]
					}, '2']
				},
				'.',
				{
					func: 'if',
					args: [{
						func: 'or',
						args: [{
							// Rodné čísla pred 31.12.1953 mali iba 9 čísiel
							func: 'eq',
							args: [{
								func: 'length',
								args: [{
									func: 'replace',
									args: [{
										func: 'get',
										args: ['baseData.registrationId'],
										watch: true
									}, '/', '']
								}]
							}, 9]
						}, {
							// Rodné čísla má 10 čísiel - určite musí začínať na 19, ak je rok väčší ako 1953
							func: 'gt',
							args: [{
								func: 'substr',
								args: [{
									func: 'replace',
									args: [{
										func: 'get',
										args: ['baseData.registrationId'],
										watch: true
									}, '/', '']
								}, 0, 2]
							}, 53]
						}]
					}, '19', '20']
				},
				{
					func: 'substr',
					args: [{
						func: 'replace',
						args: [{
							func: 'get',
							args: ['baseData.registrationId'],
							watch: true
						}, '/', '']
					}, 0, 2]
				}
			]
		}
	};

	var SCOPES = {
		concatStatic: {},
		concat: {
			baseData: {
				firstName: 'Abraham',
				lastName: 'Lincoln'
			}
		},
		concatWithDefaults: {
			baseData: {
				firstName: 'Janko'
			}
		}
	};

	// Initialize module xpsui:directives
	beforeEach(angular.mock.module('x-registries'));

	// Inject necessary services
	beforeEach(inject(['$compile', '$rootScope', '$q', 'xpsui:Calculator', function (_$compile_, _$rootScope_, _$q_, _calculator_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
		$q = _$q_;
		calculator = _calculator_;
	}]));

	it("should have a createProperty function", function () {
		expect(calculator).to.respondTo('createProperty');
	});

	it('should create a ComputedProperty instance from schema with "getter" and "watcher"', function () {
		var property = calculator.createProperty(SCHEMAS.concatStatic);
		expect(property).to.respondTo('getter');
		expect(property).to.respondTo('watcher');
	});

	it('should concat static string arguments', function (done) {
		var scope = $rootScope.$new();
		scope.person = SCOPES.concatStatic;

		var property = calculator.createProperty(SCHEMAS.concatStatic);
		expect(property.getter(scope.person)).to.eventually.be.equal('Johan Straus').notify(done);
		scope.$apply();
	});

	it('should concat string arguments from scope', function (done) {
		var scope = $rootScope.$new();
		scope.person = SCOPES.concat;

		var property = calculator.createProperty(SCHEMAS.concat);
		expect(property.getter(scope.person)).to.eventually.be.equal('Abraham Lincoln').notify(done);

		scope.$apply();
	});

	it('should concat string arguments from scope and apply defaults', function (done) {
		var scope = $rootScope.$new();
		scope.person = SCOPES.concatWithDefaults;

		var property = calculator.createProperty(SCHEMAS.concatWithDefaults);
		expect(property.getter(scope.person)).to.eventually.be.equal('Janko Hraško').notify(done);

		scope.$apply();
	});

	it('should have watcher to watch scope changes', function () {
		var scope = $rootScope.$new();
		scope.person = angular.copy(SCOPES.concat);

		var changed = false;
		var property = calculator.createProperty(SCHEMAS.concatWithWatch);

		scope.$watch(property.watcher(scope.person), function (newValue, oldValue) {
			if (newValue != oldValue) {
				changed = true;
			}
		}, true);

		scope.$apply();

		expect(changed).to.equal(false);

		scope.person.baseData.firstName = 'Jonas';

		scope.$apply();

		expect(changed).to.equal(true);
	});

	it('should calculate birth day using complex calculation definition', function (done) {
		var scope = $rootScope.$new();

		// Men
		scope.manBefore1554 = {baseData: {registrationId: '500323534'}};
		scope.manBefore1554WithSlash = {baseData: {registrationId: '471114/111'}};
		scope.man = {baseData: {registrationId: '8005081403'}};
		scope.manWithSlash = {baseData: {registrationId: '961111/4942'}};
		scope.manAfter2000 = {baseData: {registrationId: '0506077726'}};
		scope.manAfter2000WithSlash = {baseData: {registrationId: '070124/9791'}};

		// Women
		scope.womanBefore1554 = {baseData: {registrationId: '475728438'}};
		scope.womanBefore1554WithSlash = {baseData: {registrationId: '335415/438'}};
		scope.woman = {baseData: {registrationId: '8961080029'}};
		scope.womanWithSlash = {baseData: {registrationId: '895911/1590'}};
		scope.womanAfter2000 = {baseData: {registrationId: '0562171379'}};
		scope.womanAfter2000WithSlash = {baseData: {registrationId: '046023/4511'}};

		var property = calculator.createProperty(SCHEMAS.idToBirthDay);
		$q.all([
			// Men
			expect(property.getter(scope.manBefore1554)).to.eventually.be.equal('23.03.1950'),
			expect(property.getter(scope.manBefore1554WithSlash)).to.eventually.be.equal('14.11.1947'),
			expect(property.getter(scope.man)).to.eventually.be.equal('08.05.1980'),
			expect(property.getter(scope.manWithSlash)).to.eventually.be.equal('11.11.1996'),
			expect(property.getter(scope.manAfter2000)).to.eventually.be.equal('07.06.2005'),
			expect(property.getter(scope.manAfter2000WithSlash)).to.eventually.be.equal('24.01.2007'),

			// Women
			expect(property.getter(scope.womanBefore1554)).to.eventually.be.equal('28.07.1947'),
			expect(property.getter(scope.womanBefore1554WithSlash)).to.eventually.be.equal('15.04.1933'),
			expect(property.getter(scope.woman)).to.eventually.be.equal('08.11.1989'),
			expect(property.getter(scope.womanWithSlash)).to.eventually.be.equal('11.09.1989'),
			expect(property.getter(scope.womanAfter2000)).to.eventually.be.equal('17.12.2005'),
			expect(property.getter(scope.womanAfter2000WithSlash)).to.eventually.be.equal('23.10.2004')
		]).finally(done);

		scope.$apply();
	});

});

describe("xpsui:Calculator:ComputationRegistry", function () {

	var $compile,
		$rootScope,
		$q,
		computationRegistry;

	// Initialize module xpsui:directives
	beforeEach(angular.mock.module('x-registries'));

	// Inject necessary services
	beforeEach(inject(['$compile', '$rootScope', '$q', 'xpsui:Calculator:ComputationRegistry', function (_$compile_, _$rootScope_, _$q_, _computationRegistry_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
		computationRegistry = _computationRegistry_;
		$q = _$q_;
	}]));

	describe('concat', function () {
		it('should exist', function () {
			expect(computationRegistry).to.respondTo('concat');
		});

		it('should concat strings', function () {
			expect(computationRegistry.concat(["Johan", "Straus"])).to.equal('JohanStraus');
			expect(computationRegistry.concat(["Abraham", " ", "Lincoln"])).to.equal('Abraham Lincoln');
		});
	});

	describe('substr', function () {
		it('should exist', function () {
			expect(computationRegistry).to.respondTo('substr');
		});

		it('should substring string', function () {
			expect(computationRegistry.substr(["Johan Straus", 0])).to.equal('Johan Straus');
			expect(computationRegistry.substr(["Johan Straus", 5])).to.equal(' Straus');
			expect(computationRegistry.substr(["Johan Straus", 5, 3])).to.equal(' St');
		});
	});

	describe('mod', function () {
		it('should exist', function () {
			expect(computationRegistry).to.respondTo('mod');
		});

		it('should return modulo', function () {
			expect(computationRegistry.mod([5, 2])).to.equal(5 % 2);
			expect(computationRegistry.mod([10, 3])).to.equal(10 % 3);
		});
	});

	describe('replace', function () {
		it('should exist', function () {
			expect(computationRegistry).to.respondTo('replace');
		});

		it('should return string with replaced substring', function () {
			expect(computationRegistry.replace(["Johan Straus", "Johan", "Abraham"])).to.equal("Abraham Straus");
		});
	});

	describe('if', function () {
		it('should exist', function () {
			expect(computationRegistry).to.respondTo('if');
		});

		it('should return second argument when condition is true', function () {
			expect(computationRegistry.if([true, "Johan", "Abraham"])).to.equal("Johan");
			expect(computationRegistry.if([1 == 1, "Johan", "Abraham"])).to.equal("Johan");
		});

		it('should return second argument when condition is true', function () {
			expect(computationRegistry.if([false, "Johan", "Abraham"])).to.equal("Abraham");
			expect(computationRegistry.if([1 != 1, "Johan", "Abraham"])).to.equal("Abraham");
		});
	});

	describe('length', function () {
		it('should exist', function () {
			expect(computationRegistry).to.respondTo('length');
		});

		it('should return length of the first argument', function () {
			expect(computationRegistry.length(["Johan"])).to.equal(5);
			expect(computationRegistry.length([[1, 5, 6]])).to.equal(3);
		});
	});

	describe('eq', function () {
		it('should exist', function () {
			expect(computationRegistry).to.respondTo('eq');
		});

		it('should test that first and second arguments are equal', function () {
			expect(computationRegistry.eq(["Johan", "Johan"])).to.equal(true);
			expect(computationRegistry.eq([1, 1])).to.equal(true);
			expect(computationRegistry.eq([1, 5])).to.equal(false);
		});
	});

	describe('gt', function () {
		it('should exist', function () {
			expect(computationRegistry).to.respondTo('gt');
		});

		it('should test if the first argument is greater than second argument', function () {
			expect(computationRegistry.gt(["Johan", "Johan"])).to.equal(false);
			expect(computationRegistry.gt([1, 3])).to.equal(false);
			expect(computationRegistry.gt([10, 5])).to.equal(true);
		});
	});

	describe('gte', function () {
		it('should exist', function () {
			expect(computationRegistry).to.respondTo('gte');
		});

		it('should test if the first argument is greater than or equal to second argument', function () {
			expect(computationRegistry.gte(["Johan", "Johan"])).to.equal(true);
			expect(computationRegistry.gte([1, 3])).to.equal(false);
			expect(computationRegistry.gte([3, 3])).to.equal(true);
			expect(computationRegistry.gte([10, 5])).to.equal(true);
		});
	});

	describe('lt', function () {
		it('should exist', function () {
			expect(computationRegistry).to.respondTo('lt');
		});

		it('should test if the first argument is less than second argument', function () {
			expect(computationRegistry.lt(["Johan", "Johan"])).to.equal(false);
			expect(computationRegistry.lt([1, 3])).to.equal(true);
			expect(computationRegistry.lt([10, 5])).to.equal(false);
		});
	});

	describe('lte', function () {
		it('should exist', function () {
			expect(computationRegistry).to.respondTo('lte');
		});

		it('should test if the first argument is less than or equal to second argument', function () {
			expect(computationRegistry.lte(["Johan", "Johan"])).to.equal(true);
			expect(computationRegistry.lte([1, 3])).to.equal(true);
			expect(computationRegistry.lte([3, 3])).to.equal(true);
			expect(computationRegistry.lte([10, 5])).to.equal(false);
		});
	});

	describe('and', function () {
		it('should exist', function () {
			expect(computationRegistry).to.respondTo('and');
		});

		it('should test if the first argument and second argument are true', function () {
			expect(computationRegistry.and([false, false])).to.equal(false);
			expect(computationRegistry.and([true, false])).to.equal(false);
			expect(computationRegistry.and([false, true])).to.equal(false);
			expect(computationRegistry.and([true, true])).to.equal(true);

			// Bonus of the && in JS
			expect(computationRegistry.and(["Johan", "Johan"])).to.equal("Johan");
		});
	});

	describe('or', function () {
		it('should exist', function () {
			expect(computationRegistry).to.respondTo('or');
		});

		it('should test if the first argument or second argument are true', function () {
			expect(computationRegistry.or([false, false])).to.equal(false);
			expect(computationRegistry.or([true, false])).to.equal(true);
			expect(computationRegistry.or([false, true])).to.equal(true);
			expect(computationRegistry.or([true, true])).to.equal(true);

			// Bonus of the && in JS
			expect(computationRegistry.or(["Abraham", "Johan"])).to.equal("Abraham");
			expect(computationRegistry.or([null, "Johan"])).to.equal("Johan");
			expect(computationRegistry.or(["Abraham", false])).to.equal("Abraham");
		});
	});

	describe('pad', function () {
		it('should exist', function () {
			expect(computationRegistry).to.respondTo('pad');
		});

		it('should pad with leading zeros', function () {
			expect(computationRegistry.pad([3, 2])).to.equal("03");
			expect(computationRegistry.pad([10, 2])).to.equal("10");
			expect(computationRegistry.pad([3, 3, '-'])).to.equal("--3");
			expect(computationRegistry.pad([10, 3, '-'])).to.equal("-10");
		});
	});
});
