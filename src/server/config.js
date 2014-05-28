module.exports = {
	webserverPort: process.env.OPENSHIFT_NODEJS_PORT || 3000,
	webserverHost: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
	mongoDbURI: (
				process.env.REGISTRIES_MONGODB_DB_URL
				|| 'mongodb://' + (process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost') + ':' + (process.env.OPENSHIFT_MONGODB_DB_PORT || '27017')
			) + '/registry',
	mongoDbURI_test: 'mongodb://localhost:27017/integration_test_' + new Date().getTime()
};
