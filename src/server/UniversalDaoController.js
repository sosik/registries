
var universalDaoModule = require(process.cwd() + '/build/server/UniversalDao.js');

var UniversalDaoController = function(mongoDriver) {

	this.save = function(req, res) {
		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: req.route.params.table}
		);

		console.log(req.body);
		_dao.save(req.body, function(err, data){
			if (err) {
				throw err;
			}

			res.json(data);
		});
	};

	this.get = function(req, res) {
		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: req.route.params.table}
		);

		console.log(req.route.params);
		_dao.get(req.route.params.id, function(err, data){
			if (err) {
				throw err;
			}

			res.json(data);
		});
	};

	this.list = function(req, res) {
		_dao = new universalDaoModule.UniversalDao(
			mongoDriver,
			{collectionName: req.route.params.table}
		);

		console.log(req.route.params);
		_dao.list({}, function(err, data){
			if (err) {
				throw err;
			}

			res.json(data);
		});
	};
}

module.exports = {
	UniversalDaoController: UniversalDaoController
}
