var chai = require('chai'),
	chaiAsPromised = require('chai-as-promised'),
	mixins = require('../mixins'),
	peopleSchema = require('./../../../data/schemas/people.json');

var safeUrlEncoder = require('./../../../build/server/safeUrlEncoder');

chai.use(chaiAsPromised);

var expect = chai.expect;

describe("[SEARCH]", function () {
	this.timeout(30000);
	this.slow(10000);

	var password = 'johndoe',
		login = 'Administrator';

	var profile = mixins.generateProfile(),
		person = mixins.generatePerson(null, [profile.id], login, password);

	before(function createLogin(done) {
		mixins.createLogin(person, profile, done);
	});

	before(function logIn(done) {
		mixins.logIn(login, password, done);
	});

	after(function cleanupLogin(done) {
		mixins.cleanupLogin(done);
	});

	describe('Person', function () {
		it('should display a person search form', function (done) {
			browser.get('/#/search/' + safeUrlEncoder.encode('uri://registries/person'));

			var section = element(by.id('SearchPage'));

			expect(section.isPresent()).to.eventually.equal(true);
			expect(section.isDisplayed()).to.eventually.equal(true).notify(done);
		});

		it('should display profile in search results', function(done) {
			var firstCriteria = element(by.repeater('crit in searchCrit').row(0));

			// Select Name criteria
			firstCriteria.element(by.model('crit.attribute')).click().element(by.css('option[value="2"]'));
			firstCriteria.element(by.css('[ng-model="crit.value"][name="name"]')).sendKeys(person.baseData.name);

			var submit = element(by.css('[ng-click="search()"]'));
			submit.click();

			var result = element(by.repeater('obj in data').row(0));
			var columns = result.all(by.repeater('header in headers')).getText();

			var expected = [];

			for (var i = 0; i < peopleSchema.listFields.length; i++) {

				var field = peopleSchema.listFields[i].field.split('.');
				var property = field.reduce(function(obj, key) { return obj.properties[key]; }, peopleSchema);
				var value = field.reduce(function(obj, key) { return obj[key]; }, person);

				if (property.render && property.render.component == 'psui-datepicker') {
					// Convert reverse date to date
					value = value.substr(4, 2) + "." + value.substr(4, 2) + "." + value.substr(0, 4);
				}

				expected.push(value || "");
			}

			expect(columns).to.eventually.deep.equal(expected);
		});

		it('should display person detail link', function(done) {
			var result = element(by.repeater('obj in data').row(0));
			var link = result.element(by.css('.psui-actions-holder a'));

			expect(link.getAttribute('href')).to.eventually.equal(browser.baseUrl + '/#/registry/view/' + safeUrlEncoder.encode('uri://registries/person') + "/" + person.id).notify(done);
		});

		it('should display person profile when clicked on link', function(done) {
			var result = element(by.repeater('obj in data').row(0));
			var link = result.element(by.css('.psui-actions-holder a'));
			link.click();

			var section = element(by.id('RegistryView'));

			expect(section.isPresent()).to.eventually.equal(true);
			expect(section.isDisplayed()).to.eventually.equal(true).notify(done);
		});
	});
});
