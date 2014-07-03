module.exports = {
	webserverPort: process.env.REGISTRIES_HTTP_PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000,
	webserverSecurePort: process.env.REGISTRIES_HTTPS_PORT || process.env.OPENSHIFT_NODEJS_PORT || 3443,
	webserverHost: process.env.REGISTRIES_HTTP_IP || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
	mongoDbURI: (
				process.env.REGISTRIES_MONGODB_URL || process.env.OPENSHIFT_MONGODB_DB_URL
				|| 'mongodb://' + (process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost') + ':' + (process.env.OPENSHIFT_MONGODB_DB_PORT || '27017')
			) + '/registry',
	mongoDbURI_test: 'mongodb://localhost:27017/integration_test_' + new Date().getTime(),
	paths : {
		photos: process.env.REGISTRIES_PATH_PHOTOS || process.cwd() + '/build/client/img',
		schemas: process.env.REGISTRIES_PATH_SCHEMAS || process.cwd() + '/data/schemas'
	},
	schemaRegistry:{
		schemas : [ 'permissions.json', 'login.json', 'systemCredentials.json', 'people.json',
			        'company.json', 'group.json', 'groupMaster.json', 'member.json', 'organization.json' ]
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
		}())
};
