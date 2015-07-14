var serverFullURL = 'http://localhost:3000';
var user = 'testGeneral';
var password = 'johndoe';
var request = require('request');
var options = {
	url: "",
	rejectUnauthorized: false,
  	headers: {
    	'Host': 'http://localhost:3000/',
		'Connection': 'keep-alive',
		'Accept': 'application/json, text/plain, */*',
		'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.65 Safari/537.36',
		'Referer': 'http://localhost:3000/',
		'Accept-Encoding': 'gzip, deflate, sdch',
		'Accept-Language': 'en-US,en;q=0.8,sk;q=0.6,cs;q=0.4,en-GB;q=0.2',
		'Cookie': ''
     }            
};

var config = require('./test_config.json');
var schemas = {
people:'',
club:'',
stadium:"",
assoc:''
};



describe('General test:', function() {

	beforeEach(function() {
		browser.manage().deleteAllCookies(); 
		browser.get(serverFullURL + '/');
		browser.driver.manage().window().maximize();
		var loginNameEl = element(by.model('user'));
		loginNameEl.sendKeys(user);
		var passwordEl = element(by.model('password'));
		passwordEl.sendKeys(password);
		element(by.buttonText('Prihlásenie')).click();
		browser.waitForAngular();
	});
	it('should get schemas', function(done) {
		browser.manage().getCookies().then(function(cookies) {
			options.headers.Cookie='securityToken='+cookies[1].value+'; loginName='+cookies[3].value+'; profile='+cookies[2].value;
			for(key in schemas) {
				options.url = config[key].url;
				(function(type, options) {
					request(options, function(error, response, body) {
						if (!error && response.statusCode == 200) {
							schemas[type] = (JSON.parse(body));
							console.log('<<'+schemas[type].title+'>> w/ StatusCode==200');	
			   			} else {if (!error) {console.log('statusCode=='+response.statusCode);done(false)} else {console.log('* error *');done(false)}}
        			});
    			})(key, options);
			}
		}).then(function() {console.log('done w/ getting schema'); done();});
	});

	it('should create club, find it in search and check values', function(done) {		
		var interact = require('./testLib/interact.js');
		element.all(by.css('#main-menu div div > ul > li')).get(1).$('a.x-submenu-toggle').click();
		element.all(by.css('#main-menu div div > ul > li')).get(1).all(by.css('ul > li')).get(0).click();
	    interact.create('club', schemas.stadium.properties);
		//association.create('club', schemas.assoc.properties);
		//club.creteFull(schemas.club.properties);
		done();
  	});
	
	/*it('should create Stadion, find it in search and check values', function(done) {
		var stad = schemas.stadium.properties.stadium;
	    for (key in stad.properties){
			if ( stad.properties[key].hasOwnProperty('enum') || stad.properties[key].hasOwnProperty('objectLink2') ) {
    			console.log('stad.properties['+key+'] '+'has enum');
				element(by.model('model.obj..'+key)).$('.x-dropdown-action').click();
				element(by.model('model.obj..'+key)).$('.x-dropdown-content-inner').all(by.css('.x-item')).get(0).click();
						}
			//if (stad.properties[key].hasOwnProperty('enum')
		}
		done();
  	});*/

});


