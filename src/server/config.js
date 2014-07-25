var fs = require('fs');
var path = require('path');
var extend = require('extend');



var config = {
	webserverPort: process.env.REGISTRIES_HTTP_PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000,
	webserverSecurePort: process.env.REGISTRIES_HTTPS_PORT || process.env.OPENSHIFT_NODEJS_PORT || 3443,
	webserverHost: process.env.REGISTRIES_HTTP_IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
	webserverPublicUrl: process.env.REGISTRIES_PUBLIC_URL || process.env.OPENSHIFT_PUBLIC_URL || 'https://app.unionsoft.sk',
	mongoDbURI: (
				process.env.REGISTRIES_MONGODB_URL || process.env.OPENSHIFT_MONGODB_DB_URL
				|| 'mongodb://' + (process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost') + ':' + (process.env.OPENSHIFT_MONGODB_DB_PORT || '27017')
			) + '/registry',
	mongoDbURI_test: 'mongodb://localhost:27017/integration_test_' + new Date().getTime(),
	paths : {
		photos: process.env.REGISTRIES_PATH_PHOTOS || process.cwd() + '/data/photos',
		schemas: process.env.REGISTRIES_PATH_SCHEMAS || process.cwd() + '/data/schemas',
		dataset: process.env.REGISTRIES_PATH_DATASET || process.cwd() + '/data/'
	},
	schemaRegistry:{
		schemas : [ 'permissions.json', 'login.json', 'systemCredentials.json', 'people.json',
			        'group.json', 'groupMaster.json', 'member.json', 'organization.json', 
					'club.json', 'coach.json', 'player.json', 'referee.json', 'stadium.json', 'person.json']
	},
	logging: (function() {
			switch (process.env.NODE_ENV) {
				case 'test': return {
						cfg: {
							console: {
								level: 'warn',
								colorize: true,
								prettyPrint: true,
								timestamp: false,
								silent: true
							},
						},
						addLabel: true
					};
				case 'prod': return {
						cfg: {
							console: {
								level: 'info',
								colorize: true,
								prettyPrint: false,
								timestamp: true
							}
						},
						addLabel: true
					};
				default: return {
						cfg: {
							console: {
								level: 'silly',
								colorize: true,
								prettyPrint: true,
								timestamp: true
							}
						},
						addLabel: true
					};
			}
		}()),
	collation : {
		numberOfChars: 5,
		language: 'sk'
	}
};

// merge default configuration with local configuration if exists
var localConfigFile = (process.env.REGISTRIES_LOCAL_CONFIG || path.join(process.cwd(), 'local-config.js'));
if (fs.existsSync(localConfigFile)) {
	var localConfig = JSON.parse(fs.readFileSync(localConfigFile));

	config = extend(true, config, localConfig);
}
module.exports = config;
