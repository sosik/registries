describe.only("xpsui:Calculator", function () {

	var $compile,
		$rootScope,
		calculator;

	var SCHEMAS = {
		concatStatic: {
			func: 'concat',
			args: [ 'Johan', ' ', 'Straus' ]
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
	beforeEach(inject(['$compile', '$rootScope', 'xpsui:Calculator', function (_$compile_, _$rootScope_, _calculator_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
		calculator = _calculator_;
	}]));

	it("should have a createProperty function", function() {
		expect(calculator).to.respondTo('createProperty');
	});

	it('should create a ComputedProperty instance from schema with "getter" and "watcher"', function() {
		var property = calculator.createProperty(SCHEMAS.concatStatic);
		expect(property).to.respondTo('getter');
		expect(property).to.respondTo('watcher');
	});

	it('should concat static string arguments', function(done) {
		var scope = $rootScope.$new();
		scope.person = SCOPES.concatStatic;

		var property = calculator.createProperty(SCHEMAS.concatStatic);
		expect(property.getter(scope.person)).to.eventually.be.equal('Johan Straus').notify(done);
		scope.$apply();
	});

	it('should concat string arguments from scope', function(done) {
		var scope = $rootScope.$new();
		scope.person = SCOPES.concat;

		var property = calculator.createProperty(SCHEMAS.concat);
		expect(property.getter(scope.person)).to.eventually.be.equal('Abraham Lincoln').notify(done);

		scope.$apply();
	});

	it('should concat string arguments from scope and apply defaults', function(done) {
		var scope = $rootScope.$new();
		scope.person = SCOPES.concatWithDefaults;

		var property = calculator.createProperty(SCHEMAS.concatWithDefaults);
		expect(property.getter(scope.person)).to.eventually.be.equal('Janko Hraško').notify(done);

		scope.$apply();
	});

	it('should have watcher to watch scope changes', function() {
		var scope = $rootScope.$new();
		scope.person = angular.copy(SCOPES.concat);

		var changed = false;
		var property = calculator.createProperty(SCHEMAS.concatWithWatch);

		scope.$watch(property.watcher(scope.person), function(newValue, oldValue) {
			if (newValue != oldValue) {
				changed = true;
			}
		}, true);

		scope.$apply();

		expect(changed).to.be.equal(false);

		scope.person.baseData.firstName = 'Jonas';

		scope.$apply();

		expect(changed).to.be.equal(true);
    });

});

describe.only("xpsui:Calculator:ComputationRegistry", function() {

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

	it('should concat strings', function() {
		expect(computationRegistry).to.respondTo('concat');
		expect(computationRegistry.concat([ "Johan","Straus" ])).to.be.equal('JohanStraus');
		expect(computationRegistry.concat([ "Abraham", " ", "Lincoln" ])).to.be.equal('Abraham Lincoln');
	});

});
