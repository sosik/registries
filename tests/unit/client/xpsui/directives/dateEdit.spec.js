describe("xpsuiDateEdit", function () {

	var $compile,
		$rootScope,
		scope,
		element,
		controller;

	// Initialize module xpsui:directives
	beforeEach(angular.mock.module('x-registries'));

	// Inject necessary services
	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
	}));

	beforeEach(function createElement() {
		scope = $rootScope.$new();
		scope.date = '4.12.2014';

		// Create an element and compile it
		element = $compile('<div xpsui-date-edit ng-model="date"></div>')(scope);
		angular.element(document.body).append(element);

		controller = element.controller('xpsuiDateEdit');

		// Run $digest
		scope.$digest();
	});

	afterEach(function removeElementFromDOM() {
		element.remove();
	});

	it("should have API for getting input field", function() {
		expect(controller.getInput).to.not.be.undefined;
		expect(controller.getInput()).to.be.deep.equal(element.find('input'));
	});

	it("should create an input field inside element", function () {
		// Check input tag
		expect(controller.getInput()).to.have.length(1);
	});

	it("should intialize the input from model", function () {
		// Check if the input has value
		expect(controller.getInput().val()).to.be.equal('4.12.2014');
	});

	it("should focus input on focus", function () {
		// When element is focused
		element.triggerHandler('focus');
		// the input should get a focus
		expect(document.activeElement).to.be.equal(controller.getInput()[0]);
	});

	it("should change model when input had changed", function () {
		// Change input
		controller.getInput().val('5.12.2014').triggerHandler('change');
		// Test new value
		expect(scope.date).to.be.equal('5.12.2014');
	});

});
