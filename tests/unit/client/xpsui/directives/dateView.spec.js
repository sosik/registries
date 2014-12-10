describe("xpsuiDateView", function () {

	var $compile,
		$rootScope,
		element,
		container;

	// Initialize module xpsui:directives
	beforeEach(angular.mock.module('x-registries'));

	// Inject necessary services
	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
	}));

	beforeEach(function createElement() {
		$rootScope.date = '4.12.2014';

		// Create an element and compile it
		element = $compile('<div xpsui-date-view ng-model="date"></div>')($rootScope);
		container = element.find('div');

		// Run $digest
		$rootScope.$digest();
	});

	it("should create a div wrapper inside element", function () {
		// Check div tag
		expect(container).to.have.length(1);
	});

	it("should intialize the container from model", function () {
		// Check if the input has value
		expect(container.text()).to.be.equal('4.12.2014');
	});

});
