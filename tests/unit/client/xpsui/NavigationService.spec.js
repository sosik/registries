describe("xpsui:NavigationService", function () {

	var $compile,
		$rootScope,
		$location,
		navigation;

	// Initialize module xpsui:directives
	beforeEach(angular.mock.module('x-registries'));

	// Inject necessary services
	beforeEach(inject(['$compile', '$rootScope', '$location', 'xpsui:NavigationService', function (_$compile_, _$rootScope_, _$location_, _navigation_) {
		$compile = _$compile_;
		$rootScope = _$rootScope_;
		$location = _$location_;
		navigation = _navigation_;
	}]));

	it("should navigate and restore the same context", function () {
		$location.path("/testpath");
		var testContext = { data: "12345" };

		navigation.navigate(testContext);
		var restoredContext = navigation.restore();

		expect(restoredContext.data).to.be.equal(testContext.data);
	});

	it("should not restore different path", function () {
		$location.path("/testpath");

		var testContext = { data: "12345" };
		navigation.navigate(testContext);
		$location.path("/newpath");

		var restoredContext = navigation.restore();
		expect(restoredContext).to.be.equal(null);
	});

	it("should navigate to path and go back to original path", function () {
		var originalPath = "/testpath";
		var newPath = "/newpath";
		$location.path(originalPath);

		navigation.navigate();
		$location.path(newPath);
		navigation.back();

		expect($location.path()).to.be.equal(originalPath);
	});

	it("should clear all navigation paths (tested using back())", function () {
		var originalPath = "/testpath";
		var newPath = "/newpath";
		$location.path(originalPath);

		navigation.navigate();
		$location.path(newPath);
		navigation.clear();

		expect(navigation.back()).to.be.equal(false);
	});

	it("should clear all navigation paths (tested using restore())", function () {
		var originalPath = "/testpath";
		var newPath = "/newpath";
		$location.path(originalPath);

		navigation.navigate();
		$location.path(newPath);
		navigation.clear();

		expect(navigation.restore()).to.be.equal(null);
	});
});
