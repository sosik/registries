describe("xpsui:Calculator", function () {

	var $compile,
		$rootScope,
		$q,
		calculator;

	var SCHEMAS = {
		concatenateStatic: {
			func: 'concatenate',
			args: {
				p1: 'Johan',
				p2: ' ',
				p3: 'Straus'
			}
		},
		concatenate: {
			func: 'concatenate',
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
		concatenateWithDefaults: {
			func: 'concatenate',
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
		concatenateWithWatch: {
			func: 'concatenate',
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
		concatenateStatic: {},
		concatenate: {
			baseData: {
				firstName: 'Abraham',
				lastName: 'Lincoln'
			}
		},
		concatenateWithDefaults: {
			baseData: {
				firstName: 'Janko'
			}
		}
	};

	// Initialize module xpsui:directives
	beforeEach(angular.mock.module('x-registries'));

	// Inject necessary services
	beforeEach(inject(['$compile', '$rootScope', 'xpsui:Calculator', '$q', function (_$compile_, _$rootScope_, _calculator_, _$q_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
		calculator = _calculator_;
		$q = _$q_;
	}]));

	it("should have a createProperty function", function() {
		expect(calculator.createProperty).to.not.be.undefined;
	});

	it('should create a ComputedProperty instance from schema with "getter" and "watcher"', function() {
		var property = calculator.createProperty(SCHEMAS.concatenateStatic);
		expect(property.getter).to.not.be.undefined;
		expect(property.watcher).to.not.be.undefined;
	});

	it('should concatenate static string arguments', function(done) {
		var scope = $rootScope.$new();
		scope.person = SCOPES.concatenateStatic;

		var property = calculator.createProperty(SCHEMAS.concatenateStatic);
		expect(property.getter(scope.person)).to.eventually.be.equal('Johan Straus').notify(done);
		scope.$apply();
	});

	it('should concatenate string arguments from scope', function(done) {
		var scope = $rootScope.$new();
		scope.person = SCOPES.concatenate;

		var property = calculator.createProperty(SCHEMAS.concatenate);
		expect(property.getter(scope.person)).to.eventually.be.equal('Abraham Lincoln').notify(done);

		scope.$apply();
	});

	it('should concatenate string arguments from scope and apply defaults', function(done) {
		var scope = $rootScope.$new();
		scope.person = SCOPES.concatenateWithDefaults;

		var property = calculator.createProperty(SCHEMAS.concatenateWithDefaults);
		expect(property.getter(scope.person)).to.eventually.be.equal('Janko Hraško').notify(done);

		scope.$apply();
	});

	it('should have watcher to watch scope changes', function() {
		var scope = $rootScope.$new();
		scope.person = angular.copy(SCOPES.concatenate);

		var changed = false;
		var property = calculator.createProperty(SCHEMAS.concatenateWithWatch);

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
