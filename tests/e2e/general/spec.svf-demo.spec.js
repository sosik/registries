
describe('demo version tests', function() {

	var serverFullURL = 'http://localhost:3000';
	var user = 'Administrator';
	var password = 'johndoe';
	var DATA_TYPE_SZH = 'szh',
		DATA_TYPE_SVF = 'svf',
		DATA_TYPE_DEMO = 'demo';
	var dataType = DATA_TYPE_DEMO;

	beforeEach(function() {
		browser.driver.manage().window().maximize();
		browser.get(serverFullURL + '/');

		var loginNameEl = element(by.model('user'));
		loginNameEl.sendKeys(user);
		var passwordEl = element(by.model('password'));
		passwordEl.sendKeys(password);
		element.all(by.css('button.btn')).get(1).click();
	});

	it('should create new Osoba and find it in search', function() {
		var Uniquesurname = 'Uniquesurname' + new Date().getTime();
		// Open the Osoba submenu
		element(by.css('li[title="Osoba"] div')).click();
		element.all(by.css('li[title="Osoba"] ul a')).get(0).click();
		console.log('data type je teraz: ' + dataType);
		if (dataType == DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		} else {
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ INFORMÁCIE');
		}
		// Fill in the person
		var identNo = element(by.model('model.obj.baseData.id'));
		identNo.sendKeys('D38' + Math.floor(Math.random()*10000));
		var personName = element(by.model('model.obj.baseData.name'));
		personName.sendKeys('Radim');
		var personSurname = element(by.model('model.obj.baseData.surName'));
		personSurname.sendKeys(Uniquesurname);
		//var birthDate = element(by.model('model.obj.baseData.birthDate'));
		element.all(by.css('.form-group')).get(7).element(by.css('.btn.psui-icon-calendar')).click();
		element.all(by.css('.form-group')).get(7).element(by.css('tr.days td:nth-child(5)')).click();
		//var gender = element(by.model('model.obj.baseData.gender'));
		element.all(by.css('.form-group')).get(8).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(8).element(by.css('header input')).sendKeys('Mu');
		element.all(by.css('.form-group')).get(8).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		//var nationality = element(by.model('model.obj.baseData.nationality'));
//		element.all(by.css('.form-group')).get(9).element(by.css('button.psui-icon-chevron-down')).click();
//		element.all(by.css('.form-group')).get(9).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		//var stateOfPerson = element(by.model('model.obj.baseData.stateOfPerson'));
		element.all(by.css('.form-group')).get(15).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(15).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Create the new person
		element(by.css('button.btn-ok')).click();
		// Open Hladaj Osobu submenu
		element.all(by.css('li[title="Osoba"] ul a')).get(1).click();
		// Fill in the filter
		element(by.model('crit.attribute')).element(by.css('option:nth-child(4)')).click();
		element(by.model('crit.value')).click();
		element(by.model('crit.value')).sendKeys(Uniquesurname);
		element(by.css('button.btn.btn-primary')).click();
		// Check the number of found Osobas
		expect(element.all(by.repeater('obj in data')).count()).toEqual(1);
		// Open the new Osoba
		element(by.css('a.psui-btn.psui-view-btn')).click();
		if (dataType == DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		} else {
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ INFORMÁCIE');
		}
	});

	it('should create new Sportovy objekt and find it in search', function() {
		if (dataType == DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			return;
		}
		var Uniquename = 'Uniquename' + new Date().getTime();
		var Uniquestreet = 'Radlinskeho' + new Date().getTime();
		// Open the Osoba submenu
		element(by.css('li[title="Športový objekt"] div')).click();
		element.all(by.css('li[title="Športový objekt"] ul a')).get(0).click();
		expect(element(by.css('h1')).getText()).toEqual('NOVÝ ŠPORTOVÝ OBJEKT');
		expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		// Fill in the person
		var objectName = element(by.model('model.obj.baseData.name'));
		objectName.sendKeys(Uniquename);
		var objectStreet = element(by.model('model.obj.baseData.street'));
		objectStreet.sendKeys(Uniquestreet);
		var objectStreetNo = element(by.model('model.obj.baseData.houseNumber'));
		objectStreetNo.sendKeys('21');
		element.all(by.css('.form-group')).get(3).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(3).element(by.css('header input')).sendKeys('Da');
		element.all(by.css('.form-group')).get(3).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		var objectZipCode = element(by.model('model.obj.baseData.postcode'));
		objectZipCode.sendKeys('44237');
		// Create the new object
		element(by.css('button.btn-ok')).click();
		// Open Hladaj submenu
		element.all(by.css('li[title="Športový objekt"] ul a')).get(1).click();
		// Fill in the filter
		element(by.model('crit.attribute')).element(by.css('option:nth-child(2)')).click();
		element(by.model('crit.value')).click();
		element(by.model('crit.value')).sendKeys(Uniquestreet);
		element(by.css('button.btn.btn-primary')).click();
		// Check the number of found Objects
		expect(element.all(by.repeater('obj in data')).count()).toEqual(1);
		// Open the new Object
		element(by.css('a.psui-btn.psui-view-btn')).click();
		expect(element(by.css('h1')).getText()).toEqual('ŠPORTOVÝ OBJEKT');
		expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
	});

	it('should create new Stadion and find it in search', function() {
		if (dataType != DATA_TYPE_SVF && dataType != DATA_TYPE_DEMO) {
			return;
		}
		var Uniquename = 'Uniquename' + new Date().getTime();
		var Uniquestreet = 'Radlinskeho' + new Date().getTime();
		// Open the Osoba submenu
//		element(by.css('li[title="Štadión"] div')).click();
//		element.all(by.css('li[title="Štadión"] ul a')).get(0).click();
		browser.get(serverFullURL + '/#/registry/new/uri~3A~2F~2Fregistries~2Fstadiums~23views~2Fstadium');
		expect(element(by.css('h1')).getText()).toEqual('ŠPORTOVÝ OBJEKT');
		expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		// Fill in the person
		var objectName = element(by.model('model.obj.baseData.name'));
		objectName.sendKeys(Uniquename);
		var objectStreet = element(by.model('model.obj.baseData.street'));
		objectStreet.sendKeys(Uniquestreet);
		var objectStreetNo = element(by.model('model.obj.baseData.houseNumber'));
		objectStreetNo.sendKeys('21');
		element.all(by.css('.form-group')).get(3).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(3).element(by.css('header input')).sendKeys('Da');
		element.all(by.css('.form-group')).get(3).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		var objectZipCode = element(by.model('model.obj.baseData.postcode'));
		objectZipCode.sendKeys('44237');
		// Create the new object
		element(by.css('button.btn-ok')).click();
		// Open Hladaj submenu
		browser.get(serverFullURL + '/#/search/uri~3A~2F~2Fregistries~2Fstadiums~23views~2Fstadium');
		// Fill in the filter
		element.all(by.css('option')).get(2).click();
		element(by.model('crit.value')).click();
		element(by.model('crit.value')).sendKeys(Uniquestreet);
		element(by.css('button.btn.btn-primary')).click();
		// Check the number of found Objects
		expect(element.all(by.repeater('obj in data')).count()).toEqual(1);
		// Open the new Object
		element(by.css('a.psui-btn.psui-view-btn')).click();
		expect(element(by.css('h1')).getText()).toEqual('ŠPORTOVÝ OBJEKT');
		expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
	});

	it('should create new Zvaz and find it in search', function() {
		var Uniquename = 'Uniquename' + new Date().getTime();
		var Uniqueshortname = 'Short' + new Date().getTime();
		// Open the Zvaz submenu
		element(by.css('li[title="Zväz"] div')).click();
		element.all(by.css('li[title="Zväz"] ul a')).get(0).click();
		expect(element(by.css('h1')).getText()).toEqual('ZVÄZ');
		expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		// Fill in the new Zvaz
		var zvazName = element(by.model('model.obj.association.associationName'));
		zvazName.sendKeys(Uniquename);
		var shortName = element(by.model('model.obj.association.shortName'));
		shortName.sendKeys(Uniqueshortname);
		// Nadradeny zvaz - in initial database, there is no other Zvaz
//		element.all(by.css('.form-group')).get(2).element(by.css('button.psui-icon-chevron-down')).click();
//		element.all(by.css('.form-group')).get(2).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Datum zalozenia
		element.all(by.css('.form-group')).get(3).element(by.css('.btn.psui-icon-calendar')).click();
		element.all(by.css('.form-group')).get(3).element(by.css('tr.days td:nth-child(2)')).click();
		// Stav zvazu
		element.all(by.css('.form-group')).get(4).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(4).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Neplatic
		element.all(by.css('.form-group')).get(5).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(5).element(by.css('div.psui-dropdown section div:nth-child(2)')).click();
		// Datum registracie
		element.all(by.css('.form-group')).get(6).element(by.css('.btn.psui-icon-calendar')).click();
		element.all(by.css('tr.days td')).get(60).click();
		if (dataType == DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			var zvazICO = element(by.model('model.obj.bankInfo.ico'));
			zvazICO.sendKeys('KDLKJKLJD');
			var zvazStreet = element(by.model('model.obj.bankInfo.street'));
			zvazStreet.sendKeys('Hornozemska');
			var zvazHouseNumber = element(by.model('model.obj.bankInfo.houseNumber'));
			zvazHouseNumber.sendKeys('45');
			element.all(by.css('.form-group')).get(37).element(by.css('button.psui-icon-chevron-down')).click();
			element.all(by.css('.form-group')).get(37).element(by.css('div.psui-dropdown section div:nth-child(2)')).click();
			var zvazZipCode = element(by.model('model.obj.bankInfo.zipCode'));
			zvazZipCode.sendKeys('44 808');
		}
		// Create the new object
		element(by.css('button.btn-ok')).click();
		// Open Hladaj submenu
		element.all(by.css('li[title="Zväz"] ul a')).get(1).click();
		// Fill in the filter
		element.all(by.css('option')).get(1).click();
		element(by.model('crit.value')).click();
		element(by.model('crit.value')).sendKeys(Uniquename);
		element(by.css('button.btn.btn-primary')).click();
		// Check the number of found Objects
		expect(element.all(by.repeater('obj in data')).count()).toEqual(1);
		// Open the new Object
		element(by.css('a.psui-btn.psui-view-btn')).click();
		if (dataType == DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			expect(element(by.css('h1')).getText()).toEqual('ZVÄZ');
		} else {
			expect(element(by.css('h1')).getText()).toEqual('DETAIL ZVÄZU');
		}
		expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
	});

	it('should create new Klub and find it in search', function() {
		var Uniquename = 'Uniquename' + new Date().getTime();
		// Open the Osoba submenu
		element(by.css('li[title="Klub"] div')).click();
		element.all(by.css('li[title="Klub"] ul a')).get(0).click();
		if (dataType == DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			expect(element(by.css('h1')).getText()).toEqual('KLUB');
		} else {
			expect(element(by.css('h1')).getText()).toEqual('NOVÝ KLUB');
		}
		expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		// Fill in the person
		var codeOfClub = element(by.model('model.obj.club.codeOfClub'));
		codeOfClub.sendKeys('C0323');
		var clubName = element(by.model('model.obj.club.name'));
		clubName.sendKeys(Uniquename);
		element.all(by.css('button.psui-icon-chevron-down')).get(0).click();
		element.all(by.css('div.psui-dropdown section div')).get(0).click();
		var objectStreet = element(by.model('model.obj.club.ico'));
		objectStreet.sendKeys('3838727823');
		element.all(by.css('.btn.psui-icon-calendar')).get(0).click();
		element.all(by.css('tr.days td')).get(9).click();
		// Stadion
		element.all(by.css('.form-group')).get(5).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(5).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Stav klubu
		element.all(by.css('.form-group')).get(6).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(6).element(by.css('div.psui-dropdown section div:nth-child(2)')).click();
		// Neplatic
		element.all(by.css('.form-group')).get(7).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(7).element(by.css('div.psui-dropdown section div:nth-child(2)')).click();
		// Datum registracie
		element.all(by.css('.form-group')).get(8).element(by.css('.btn.psui-icon-calendar')).click();
		element.all(by.css('.form-group')).get(8).element(by.css('tr.days td:nth-child(6)')).click();
		// Create the new object
		element(by.css('button.btn-ok')).click();
		// Open Hladaj submenu
		element.all(by.css('li[title="Klub"] ul a')).get(1).click();
		// Fill in the filter
		element(by.model('crit.attribute')).element(by.css('option:nth-child(2)')).click();
		element(by.model('crit.value')).click();
		element(by.model('crit.value')).sendKeys(Uniquename);
		element(by.css('button.btn.btn-primary')).click();
		// Check the number of found Objects
		expect(element.all(by.repeater('obj in data')).count()).toEqual(1);
		// Open the new Object
		element(by.css('a.psui-btn.psui-view-btn')).click();
		if (dataType == DATA_TYPE_DEMO) {
			expect(element(by.css('h1')).getText()).toEqual('KLUB');
		} else {
			expect(element(by.css('h1')).getText()).toEqual('DETAIL KLUBU');
		}
		expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
	});

	it('should create new Sutazny rocnik and find it in search', function() {
		var Uniquename = 'NazovRocnika' + new Date().getTime();
		browser.get(serverFullURL + '/#/registry/new/uri~3A~2F~2Fregistries~2Fseasons~23views~2Fseasons');
		if (dataType == DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			expect(element(by.css('h1')).getText()).toEqual('SÚŤAŽNÝ ROČNÍK');
		} else {
			expect(element(by.css('h1')).getText()).toEqual('NOVÝ SÚŤAŽNÝ ROČNÍK');
		}
		expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		// Nazov rocnika
		var yearName = element(by.model('model.obj.baseData.name'));
		yearName.sendKeys(Uniquename);
		if (dataType != DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			// Datum zaciatku
			element.all(by.css('.form-group')).get(1).element(by.css('.btn.psui-icon-calendar')).click();
			element.all(by.css('.form-group')).get(1).element(by.css('tr.days td:nth-child(2)')).click();
			// Datum konca
			element.all(by.css('.form-group')).get(2).element(by.css('.btn.psui-icon-calendar')).click();
			element.all(by.css('.form-group')).get(2).element(by.css('tr.days td:nth-child(6)')).click();
		}
		// Create item
		element(by.css('button.btn.btn-primary.btn-ok')).click();
		// Open Hladaj submenu
		browser.get(serverFullURL + '/#/search/uri~3A~2F~2Fregistries~2Fseasons~23views~2Fseasons');
		// Fill in the filter
		element.all(by.css('option')).get(1).click();
		element(by.model('crit.value')).click();
		element(by.model('crit.value')).sendKeys(Uniquename);
		element(by.css('button.btn.btn-primary')).click();
		// Check the number of found Objects
		expect(element.all(by.repeater('obj in data')).count()).toEqual(1);
		// Open the new Object
		element(by.css('a.psui-btn.psui-view-btn')).click();
		if (dataType == DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			expect(element(by.css('h1')).getText()).toEqual('SÚŤAŽNÝ ROČNÍK');
		} else {
			expect(element(by.css('h1')).getText()).toEqual('SÚŤAŽNÝ ROČNÍK');
		}
		expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
	});

	it('should create new Zmena kl. prislusnosti and find it in search', function() {
		var Uniquenote = 'Poznamka' + new Date().getTime();
		var UniqueId = 'C03' + Math.floor(Math.random()*10000);
		// Open the Zmena kl. prislusnosti submenu
		element(by.css('li[title="Zmena kl. príslušnosti"] div')).click();
		element.all(by.css('li[title="Zmena kl. príslušnosti"] ul a')).get(0).click();
		if (dataType == DATA_TYPE_SVF) {
			expect(element(by.css('h1')).getText()).toEqual('NOVÁ ZMENA KL. PRÍSLUŠNOSTI');
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		} else {
			expect(element(by.css('h1')).getText()).toEqual('ZMENA KL. PRÍSLUŠNOSTI');
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ INFORMÁCIE');
		}
		// Fill in the new Zmena kl. prislusnosti
		// ID
		var idOfZmena = element(by.model('model.obj.baseData.id'));
		idOfZmena.sendKeys(UniqueId);
		// Hrac
		element.all(by.css('.form-group')).get(1).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(1).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Z klubu
		element.all(by.css('.form-group')).get(2).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(2).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Do klubu
		element.all(by.css('.form-group')).get(3).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(3).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Sutazny rocnik
		element.all(by.css('.form-group')).get(4).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(4).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Typ zmeny
		element.all(by.css('.form-group')).get(5).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(5).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Datum realizacie
		element.all(by.css('.form-group')).get(6).element(by.css('.btn.psui-icon-calendar')).click();
		element.all(by.css('.form-group')).get(6).element(by.css('tr.days td:nth-child(6)')).click();
		// Zaciatok hostovania
		element.all(by.css('.form-group')).get(7).element(by.css('.btn.psui-icon-calendar')).click();
		element.all(by.css('.form-group')).get(7).element(by.css('tr:nth-child(5)')).element(by.css('td:nth-child(3)')).click();
		// Koniec hostovania
		element.all(by.css('.form-group')).get(8).element(by.css('.btn.psui-icon-calendar')).click();
		element.all(by.css('.form-group')).get(8).element(by.css('tr:nth-child(6)')).element(by.css('td:nth-child(1)')).click();
		// Datum dorucenia
		element.all(by.css('.form-group')).get(9).element(by.css('.btn.psui-icon-calendar')).click();
		element.all(by.css('.form-group')).get(9).element(by.css('tr:nth-child(6)')).element(by.css('td:nth-child(1)')).click();
		// Stav
		element.all(by.css('.form-group')).get(10).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(10).element(by.css('div.psui-dropdown section div:nth-child(3)')).click();
		// Aktivny
		element.all(by.css('.form-group')).get(11).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(11).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Poznamka
		var note = element(by.model('model.obj.baseData.note'));
		note.sendKeys(Uniquenote);
		// Create the new object
		element(by.css('button.btn-ok')).click();
		// Open Hladaj submenu
		element.all(by.css('li[title="Zmena kl. príslušnosti"] ul a')).get(1).click();
		// Fill in the filter
		if (dataType == DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			element.all(by.css('option')).get(1).click();
			element(by.model('crit.value')).click();
			element(by.model('crit.value')).sendKeys(UniqueId);
		} else {
			element(by.model('crit.attribute')).element(by.css('option:nth-child(9)')).click();
			element(by.model('crit.value')).click();
			element(by.model('crit.value')).sendKeys(Uniquenote);
		}
		element(by.css('button.btn.btn-primary')).click();
		// Check the number of found Objects
		expect(element.all(by.repeater('obj in data')).count()).toEqual(1);
		// Open the new Object
		element(by.css('a.psui-btn.psui-view-btn')).click();
		if (dataType == DATA_TYPE_SVF) {
			expect(element(by.css('h1')).getText()).toEqual('NOVÁ ZMENA KL. PRÍSLUŠNOSTI');
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		} else {
			expect(element(by.css('h1')).getText()).toEqual('ZMENA KL. PRÍSLUŠNOSTI');
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ INFORMÁCIE');
		}
	});

	it('should create new Vekova kategoria and find it in search', function() {
		var Uniquename = 'NazovKategorie' + new Date().getTime();
		browser.get(serverFullURL + '/#/registry/new/uri~3A~2F~2Fregistries~2FageCategory~23views~2FageCategory');
		if (dataType == DATA_TYPE_SVF) {
			expect(element(by.css('h1')).getText()).toEqual('VEKOVÁ KATEGÓRIA');
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE O SÚŤAŽI');
		} else if (dataType == DATA_TYPE_DEMO) {
			expect(element(by.css('h1')).getText()).toEqual('VEKOVÁ KATEGÓRIA');
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		} else {
			expect(element(by.css('h1')).getText()).toEqual('NOVÁ VEKOVÁ KATEGÓRIA');
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		}
		// Nazov kategorie
		var categoryName = element(by.model('model.obj.baseData.name'));
		categoryName.sendKeys(Uniquename);
		// Nazov popis
		var categoryDescription = element(by.model('model.obj.baseData.description'));
		categoryDescription.sendKeys('Toto je popis.');
		// Den
		var categoryDay = element(by.model('model.obj.computation.day'));
		categoryDay.sendKeys('3');
		if (dataType == DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			// Mesiac
			var categoryMonth = element(by.model('model.obj.computation.month'));
			categoryMonth.sendKeys('8');
			// Rok
			var categoryYear = element(by.model('model.obj.computation.age'));
			categoryYear.sendKeys('2015');
		} else {
			// Mesiac
			var categoryMonth = element(by.model('model.obj.computation.month'));
			categoryMonth.sendKeys('8');
			// Rok
			var categoryYear = element(by.model('model.obj.computation.year'));
			categoryYear.sendKeys('2015');
		}
		// Operacia
		element.all(by.css('.form-group')).get(5).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(5).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Create item
		element(by.css('button.btn.btn-primary.btn-ok')).click();
		// Open Hladaj submenu
		browser.get(serverFullURL + '/#/search/uri~3A~2F~2Fregistries~2FageCategory~23views~2FageCategory');
		// Fill in the filter
		element.all(by.css('option')).get(1).click();
		element(by.model('crit.value')).click();
		element(by.model('crit.value')).sendKeys(Uniquename);
		element(by.css('button.btn.btn-primary')).click();
		// Check the number of found Objects
		expect(element.all(by.repeater('obj in data')).count()).toEqual(1);
		// Open the new Object
		element(by.css('a.psui-btn.psui-view-btn')).click();
		if (dataType == DATA_TYPE_SVF) {
			expect(element(by.css('h1')).getText()).toEqual('VEKOVÁ KATEGÓRIA');
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE O SÚŤAŽI');
		} else {
			expect(element(by.css('h1')).getText()).toEqual('VEKOVÁ KATEGÓRIA');
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		}
	});

	it('should create new Sutaz and find it in search', function() {
		var Uniquename = 'NazovSutaze' + new Date().getTime();
		// Open the Zmena kl. prislusnosti submenu
		element(by.css('li[title="Súťaž"] div')).click();
		element.all(by.css('li[title="Súťaž"] ul a')).get(0).click();
		expect(element(by.css('h1')).getText()).toEqual('SÚŤAŽ');
		expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		// Fill in the new Zmena kl. prislusnosti
		// Nazov sutaze
		var unitName = element(by.model('model.obj.baseData.name'));
		unitName.sendKeys(Uniquename);
		if (dataType == DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			// Sutazny rocnik
			element.all(by.css('.form-group')).get(1).element(by.css('button.psui-icon-chevron-down')).click();
			element.all(by.css('.form-group')).get(1).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
			// Zvaz
			element.all(by.css('.form-group')).get(2).element(by.css('button.psui-icon-chevron-down')).click();
			element.all(by.css('.form-group')).get(2).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
			// Vekova kategoria
			element.all(by.css('.form-group')).get(3).element(by.css('button.psui-icon-chevron-down')).click();
			element.all(by.css('.form-group')).get(3).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
			// Pohlavie
			element.all(by.css('.form-group')).get(4).element(by.css('button.psui-icon-chevron-down')).click();
			element.all(by.css('.form-group')).get(4).element(by.css('div.psui-dropdown section div:nth-child(2)')).click();
		} else {
			// Sutazny rocnik
			element.all(by.css('.form-group')).get(1).element(by.css('button.psui-icon-chevron-down')).click();
			element.all(by.css('.form-group')).get(1).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
			// Vekova kategoria
			element.all(by.css('.form-group')).get(2).element(by.css('button.psui-icon-chevron-down')).click();
			element.all(by.css('.form-group')).get(2).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
			// Pohlavie
			element.all(by.css('.form-group')).get(3).element(by.css('button.psui-icon-chevron-down')).click();
			element.all(by.css('.form-group')).get(3).element(by.css('div.psui-dropdown section div:nth-child(2)')).click();
		}
		// Uroven sutaze
		var competitionLevel = element(by.model('model.obj.baseData.competitionLevel'));
		competitionLevel.sendKeys('Pokrocili');
		// Create the new object
		element(by.css('button.btn-ok')).click();
		// Open Hladaj submenu
		if (dataType == DATA_TYPE_SVF) {
			browser.get(serverFullURL + '/#/search/uri~3A~2F~2Fregistries~2Fcompetition');
		} else {
			element.all(by.css('li[title="Súťaž"] ul a')).get(1).click();
		}
		// Fill in the filter
		element.all(by.css('option')).get(1).click();
		element(by.model('crit.value')).click();
		element(by.model('crit.value')).sendKeys(Uniquename);
		element(by.css('button.btn.btn-primary')).click();
		// Check the number of found Objects
		expect(element.all(by.repeater('obj in data')).count()).toEqual(1);
		// Open the new Object
		element(by.css('a.psui-btn.psui-view-btn')).click();
		expect(element(by.css('h1')).getText()).toEqual('SÚŤAŽ');
		expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
	});

	it('should create new Supiska and find it in search', function() {
		var Uniquename = 'Druzstvo' + new Date().getTime();
		// Open the Zmena kl. prislusnosti submenu
		element(by.css('li[title="Súpisky"] div')).click();
		element.all(by.css('li[title="Súpisky"] ul a')).get(0).click();
		expect(element(by.css('h1')).getText()).toEqual('SÚPISKA');
		expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		// Fill in the new Zmena kl. prislusnosti
		// Nazov druzstva
		var unitName = element(by.model('model.obj.baseData.prName'));
		unitName.sendKeys(Uniquename);
		// Klub
		element.all(by.css('.form-group')).get(1).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(1).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Sutazny rocnik
		element.all(by.css('.form-group')).get(2).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(2).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Pohlavie
		element.all(by.css('.form-group')).get(3).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(3).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Vekova kategoria
		element.all(by.css('.form-group')).get(4).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(4).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Sutaz
		element.all(by.css('.form-group')).get(5).element(by.css('button.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(5).element(by.css('div.psui-dropdown section div:nth-child(1)')).click();
		// Create the new object
		element(by.css('button.btn-ok')).click();
		// Open Hladaj submenu
		element.all(by.css('li[title="Súpisky"] ul a')).get(1).click();
		// Fill in the filter
		element.all(by.css('option')).get(1).click();
		element(by.model('crit.value')).click();
		element(by.model('crit.value')).sendKeys(Uniquename);
		element(by.css('button.btn.btn-primary')).click();
		// Check the number of found Objects
		expect(element.all(by.repeater('obj in data')).count()).toEqual(1);
		// Open the new Object
		element(by.css('a.psui-btn.psui-view-btn')).click();
		expect(element(by.css('h1')).getText()).toEqual('SÚPISKA');
		expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
	});

	it('should create and remove player psui dropdown attribute', function() {
		// Open Hladaj Osobu submenu
		element(by.css('li[title="Zväz"] div')).click();
		element.all(by.css('li[title="Zväz"] ul a')).get(1).click();
		// Fill in the filter
//		element(by.model('crit.attribute')).element(by.css('option:nth-child(4)')).click();
//		element(by.model('crit.value')).click();
//		element(by.model('crit.value')).sendKeys('UnionSoft s.r.o.');
		element(by.css('button.btn.btn-primary')).click();
		// Open the new Osoba
		element(by.css('a.psui-btn.psui-view-btn')).click();
		if (dataType == DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		} else {
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ INFORMÁCIE');
		}

		element(by.model('model.obj.association.higherAssociation')).click();
		element(by.css('button.btn.psui-icon-chevron-down')).click();
		element.all(by.css('.form-group')).get(2).element(by.css('div.psui-dropdown section td:nth-child(1)')).click();
		element.all(by.css('span.psui-commit-btn')).get(2).click();
		browser.sleep(5*1000);

		element(by.model('model.obj.association.higherAssociation')).click();
		element.all(by.css('cancelpart button')).get(0).click();
		element.all(by.css('span.psui-commit-btn')).get(2).click();
		browser.sleep(5*1000);

	});

	it('should update member profile information', function() {
		element(by.css('li[title="Môj profil"] div')).click();
		element.all(by.css('li[title="Môj profil"] ul a')).get(0).click();
		if (dataType == DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			expect(element(by.css('h1')).getText()).toEqual('MÔJ PROFIL');
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');

			element(by.binding('model.obj.baseData.bornName')).click();

			element(by.model('model.obj.baseData.bornName')).clear();
			var newHouseNumber = new Date().getTime();
			element(by.model('model.obj.baseData.bornName')).sendKeys(newHouseNumber);
			element.all(by.css('.psui-commit-btn')).get(4).click();

		} else {
			expect(element(by.css('h1')).getText()).toEqual('MÔJ PROFIL');
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ INFORMÁCIE');

			element(by.binding('model.obj.contactInfo.houseNumber')).click();

			element(by.model('model.obj.contactInfo.houseNumber')).clear();
			var newHouseNumber = new Date().getTime();
			element(by.model('model.obj.contactInfo.houseNumber')).sendKeys(newHouseNumber);
			element.all(by.css('.psui-commit-btn')).get(11).click();
		}
	});

	it('should create new Skupina opravneni and find it in search', function() {
		var Uniquename = 'NazovSkupiny' + new Date().getTime();
		// Open the Skupina opravneni submenu
		if (dataType == DATA_TYPE_SVF || dataType == DATA_TYPE_DEMO) {
			browser.get(serverFullURL + '/#/registry/new/uri~3A~2F~2Fregistries~2Fsecurity~23groupmaster');
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		} else {
			element(by.css('li[title="Oprávnenia"] div')).click();
			element.all(by.css('li[title="Oprávnenia"] ul a')).get(0).click();
			expect(element(by.css('h1')).getText()).toEqual('NOVÁ SKUPINA');
			expect(element(by.css('legend')).getText()).toEqual('ZÁKLADNÉ ÚDAJE');
		}
		// Fill in the new Skupina opravneni
		var groupId = element(by.model('model.obj.baseData.id'));
		groupId.sendKeys('L' + new Date().getTime());
		var groupName = element(by.model('model.obj.baseData.name'));
		groupName.sendKeys(Uniquename);
		// Create the new object
		element(by.css('button.btn-ok')).click();
	});

});
