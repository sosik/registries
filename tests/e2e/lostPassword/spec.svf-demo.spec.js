
describe('demo version tests', function() {

	var serverFullURL = 'https://localhost:3443';

	beforeEach(function() {
		browser.driver.manage().window().maximize();
		browser.get(serverFullURL);
	});

	it('should go to lost password page and enter data', function() {
		// go to lost password form
		$('.forgotten a').click();
		
		// check it is lost password form
		expect(element(by.css('legend')).getText()).toEqual('ZABUDNUTÉ HESLO');
		// fill out lost password form
		var emailEl = element(by.model('email'));
		emailEl.sendKeys('abcNonExistingUser');
		var captchEl = element(by.css('input#recaptcha_response_field'));
		captchEl.sendKeys('nnnNNNNNNN');
		element(by.css('button.btn-primary')).click();

		// check it is still the lost password form
		expect(element(by.css('legend')).getText()).toEqual('ZABUDNUTÉ HESLO');
		// go to login form
		$('.forgotten a').click();
		// check we are at login form
		expect(element(by.css('span.legend')).getText()).toEqual('PRIHLÁSENIE');
	});

	it('should go to lost password page and enter data', function() {
		browser.get(serverFullURL + '/#/forgotten/reset/555');
		expect(element(by.css('.logo-wrapper img')).isPresent()).toBe(true);
	});

});
