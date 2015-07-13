module.exports.create = create;
module.exports.createFull = createAndCheck;
module.exports.erase = deleteFromDatabase;
var element = require('./element.js');
function create(name,schema){
	browser.waitForAngular();
	for (key in schema) {
		(function (schemicka,k){			//schemicka  =  jeden block (napr. baseData)
			for (keys in schemicka) {
				if ((schemicka[keys].hasOwnProperty('required')) && (schemicka[keys].required=true)) {
					element.interact(schemicka[keys] , name, k, keys);
					//element(by.model('model.obj.'+k+'.'+keys)).$('input').sendKeys(name);	
				}
			}
		})(schema[key].properties,key);
	}
	//element(by.css('button.btn-ok')).click();  //confirm
}

function createAndCheck(){
	var Uniquename = 'Uniquename' + new Date().getTime();
	var Uniquestreet = 'Radlinskeho' + new Date().getTime();
	  // Open the Klub submenu
	/*browser.sleep(2000);
	element.all(by.css('#main-menu div div > ul > li')).get(2).$('a.x-submenu-toggle').click();
 	element.all(by.css('#main-menu div div > ul > li')).get(2).all(by.css('ul > li')).get(0).click();
        browser.sleep(3000);
	expect($('.x-fieldset.ng-scope .x-fieldset-title').getText()).toEqual('ZÁKLADNÉ ÚDAJE');
	expect(element.all(by.css('.x-fieldset')).get(1).$('.x-fieldset-title').getText()).toEqual('LOGO');
	expect($('.x-form div[class="x-form-title"]').getText()).toEqual('Klub');
	  // Fill in the club
	element(by.model('model.obj.club.name')).$('input').sendKeys(Uniquename);
	element(by.model('model.obj.clubAdress.street')).$('input').sendKeys(Uniquestreet);
	element(by.model('model.obj.clubAdress.houseNumber')).$('input').sendKeys('21');
	element(by.model('model.obj.clubAdress.zipCode')).$('input').sendKeys('44237');
	element(by.model('model.obj.club.association')).$('.x-dropdown-action').click();
	element(by.model('model.obj.club.association')).$('.x-dropdown-content-inner').all(by.css('.x-item')).get(1).click();
	element(by.model('model.obj.club.stadium')).$('.x-dropdown-action').click();
	element(by.model('model.obj.club.stadium')).$('.x-dropdown-content-inner').all(by.css('.x-item')).get(0).click();
	//element.all(by.css('.form-group')).get(3).element(by.css('button.psui-icon-chevron-down')).click();
	//element.all(by.css('.form-group')).get(3).element(by.css('header input')).sendKeys('Da');
	//element.all(by.css('.form-group')).get(3).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
	element(by.css('button.btn-ok')).click();  //confirm
	  // Open Hladaj submenu
	element.all(by.css('#main-menu div div > ul > li')).get(2).all(by.css('ul > li')).get(1).click();
	  // Fill in the filter
	$('option[label="Ulica"]').click();
	element(by.model('crit.val')).click();
	element(by.model('crit.val')).$('input').sendKeys(Uniquestreet);
	element(by.css('button.btn-primary')).click();
	// Check the number of found Objects
	expect(element.all(by.repeater('d in data')).count()).toEqual(1);
	// Open the new Object
	element.all(by.repeater('a in $parent.schema.clientActions')).get(0).click();

	expect($('.x-fieldset.ng-scope .x-fieldset-title').getText()).toEqual('ZÁKLADNÉ ÚDAJE');
	expect(element.all(by.css('.x-fieldset')).get(1).$('.x-fieldset-title').getText()).toEqual('LOGO');
	expect($('.x-form div[class="x-form-title"]').getText()).toEqual('Klub');*/
}

function deleteFromDatabase(name){
	
}
