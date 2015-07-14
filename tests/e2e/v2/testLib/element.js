module.exports.interact = elementInteraction;

function elementInteraction(schema,name,KEY, key) {
	var Uniquename = name + new Date().getTime();
	browser.waitForAngular();	
	if (schema.hasOwnProperty('enum') || schema.hasOwnProperty('objectLink2')) {
		element(by.model('model.obj.'+KEY+'.'+key)).$('.x-dropdown-action').click();
		element(by.model('model.obj.'+KEY+'.'+key)).$('.x-dropdown-content-inner').all(by.css('.x-item')).get(0).click();
	} else { if (schema.hasOwnProperty('render') && (schema.render.component=="psui-selectbox")) {	
				
			}}
	
}
