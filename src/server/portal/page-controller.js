/* jshint node:true */
'use strict';

var log = require('../logging.js').getLogger('page-controller.js');
var config = require('../config.js');
var QueryFilter = require('../QueryFilter.js');
var universalDaoModule = require('../UniversalDao.js');
var swig = require('swig');
var path = require('path');

var articlesCollection = 'portalArticles';
var menuCollection = 'portalMenu';

var async = require('async');

var pageController;

function PageController(mongoDriver) {
	this.mongoDriver = mongoDriver;

	this.menuDao = new universalDaoModule.UniversalDao(mongoDriver, {collectionName: menuCollection});
	this.articlesDao = new universalDaoModule.UniversalDao(mongoDriver, {collectionName: articlesCollection});
	this.competitionDao = new universalDaoModule.UniversalDao(mongoDriver, {collectionName: 'competitions'});
	this.refereeReportsDao = new universalDaoModule.UniversalDao(mongoDriver, {collectionName: 'refereeReports'});
	this.rostersDao = new universalDaoModule.UniversalDao(mongoDriver, {collectionName: 'rosters'});
}

PageController.prototype.competitionsList = function(req, res, next) {
	this.competitionDao.list({}, function(err, data) {
		if (err) {
			log.error('Failed to get list of competitions', err);
			next(err);
			return;
		}

		var result = [];

		for (var i in data) {
			result.push({
				id: data[i].id,
				name: data[i].baseData.name
			});
		}

		res.json(result);
	});

};

PageController.prototype.competitionMatches = function(req, res, next) {
	var cid = req.params.cid;

	var qf = QueryFilter.create();

	qf.addCriterium('baseData.matchDate', QueryFilter.operation.LESS_EQUAL, require('../DateUtils.js').DateUtils.nowToReverse());
	qf.addCriterium('baseData.competition.oid', QueryFilter.operation.EQUAL, cid);
	qf.addSort('baseData.matchDate', QueryFilter.sort.DESC);
	qf.setLimit(12);

	this.refereeReportsDao.list(qf, function(err, data) {
		if (err) {
			log.error('Failed to get list of matches for competition %s', cid, err);
			next(err);
			return;
		}

		var result = [];

		for (var i in data) {
			result.push({
				id: data[i].id,
				homeId: data[i].baseData.homeClub.oid,
				guestId: data[i].baseData.awayClub.oid,
				matchDate: data[i].baseData.matchDate,
				fullTimeScoreHome: data[i].baseData.fullTimeScoreHome,
				fullTimeScoreAway: data[i].baseData.fullTimeScoreAway,
				webNo: data[i].delegatedPerson && data[i].delegatedPerson.webNumber
			});
		}

		var rostersQf = QueryFilter.create();
		rostersQf.addCriterium('baseData.competition.oid', QueryFilter.operation.EQUAL, cid);
		pageController.rostersDao.list(rostersQf, function(err, data) {
			if (err) {
				log.error('Failed to get list of rosters for competition %s', cid, err);
				next(err);
				return;
			}

			var rosters = {};

			for (var i in data) {
				rosters[data[i].id] = data[i].baseData.prName;
			}

			for (i in result) {
				if (rosters[result[i].homeId]) {
					result[i].homeName = rosters[result[i].homeId];
				} else {
					result[i].homeName = '---';
				}

				if (rosters[result[i].guestId]) {
					result[i].guestName = rosters[result[i].guestId];
				} else {
					result[i].guestName = '---';
				}
			}
			
			res.json(result);
		});

	});

};

PageController.prototype.competitionResults = function(req, res, next) {
	var cid = req.params.cid;

	var qf = QueryFilter.create();

	qf.addCriterium('baseData.competition.oid', QueryFilter.operation.EQUAL, cid);

	this.refereeReportsDao.list(qf, function(err, data) {
		if (err) {
			log.error('Failed to get list of matches for competition %s', cid, err);
			next(err);
			return;
		}

		var result = {};

		for (var i in data) {
			var homeId = data[i].baseData.homeClub.oid;
			var guestId = data[i].baseData.awayClub.oid;
			var scoreHome = data[i].baseData.fullTimeScoreHome;
			var scoreAway = data[i].baseData.fullTimeScoreAway;

			if (typeof result[homeId] === 'undefined') {
				result[homeId] = { points: 0, matches: 0};
			}
			if (typeof result[guestId] === 'undefined') {
				result[guestId] = { points: 0, matches: 0};
			}

			if (scoreHome || scoreAway) {
				if ((scoreHome + 0) > (scoreAway + 0)) {
					result[homeId].points += 2;
				} else if ((scoreHome + 0) < (scoreAway + 0)) {
					result[guestId].points += 2;
				} else {
					result[homeId].points += 1;
					result[guestId].points += 1;
				}

				result[homeId].matches += 1;
				result[guestId].matches += 1;
			}
		}

		console.log(result);

		var rostersQf = QueryFilter.create();
		rostersQf.addCriterium('baseData.competition.oid', QueryFilter.operation.EQUAL, cid);
		pageController.rostersDao.list(rostersQf, function(err, data) {
			if (err) {
				log.error('Failed to get list of rosters for competition %s', cid, err);
				next(err);
				return;
			}

			var rosters = {};

			for (var i in data) {
				rosters[data[i].id] = data[i].baseData.prName;
			}

			for (i in result) {
				if (rosters[i]) {
					result[i].name = rosters[i];
				} else {
					result[i].name = '---';
				}
			}
			
			var finres = [];
			for (var i in result) {
				finres.push(result[i]);
			}

			res.json(finres);
		});

	});

};
PageController.prototype.renderPage = function(req, res, next) {
	var locals = {};

	var aid, page = 0;

	if (req.params && req.params.aid) {
		aid = req.params.aid;
	}
	if (req.params && req.params.page) {
		page = parseInt(req.params.page);
	}

	this.getArticle(aid, function(err, data) {
		if (err) {
			log.error('Failed to get article %s', aid);
			next(err);
			return;
		}

		locals.article = data;

		pageController.getMenu(function(err, data) {
			if (data && data.index && data.index.subElements) {
				// strip root menu element
				locals.menu = data.index.subElements;
			} else {
				locals.menu = data;
			}

			var menuResolvers = [];

			function createMenuArticleResolver(elm) {
				return function(callback) {
					pageController.getArticlesByTags(elm.tags, 0, 1, function(err, data) {
						if (err) {
							log.verbose('Failed to resolve article for menu entry %s', elm.name, err);
							callback(err);
						}

						if (data && data.length > 0) {
							elm.aid = data[0].id;
						}
						callback();

					});

				};
			}

			function createCategoryResolver(elm, aid) {
				log.silly('Creating category block resolver');

				elm.data.aid = aid;
				if ((typeof elm.data.pageSize === "undefined") || elm.data.pageSize == '') {
					elm.data.pageSize = 20;
				}
				function findFirstOfType(obj, type) {
					for (var j = 0; j < obj.length; ++j) {
						if (obj[j].meta.name === type) {
							return obj[j].data;
						}
					}
				}

				return function(callback) {
					pageController.getArticlesByTags(elm.data.tags, page, elm.data.pageSize, function(err, data) {
						if (err) {
							log.verbose('Failed to resolve articles for article block %s', elm, err);
							callback(err);
						}

						if (data) {
							var currPage = 0;
							if (page) {
								currPage = page;
							}
							elm.data.prevPage = 0;
							if (currPage > 0) {
								elm.data.prevPage = currPage - 1;
							}
							elm.data.nextPage = currPage + 1;
							if (data.length <= elm.data.pageSize) {
								elm.data.nextPage = currPage;
							}
							elm.data.articles = [];
							var noOfPageElements =
								(data.length <= elm.data.pageSize)? data.length :elm.data.pageSize;
							for (var i=0; i < noOfPageElements; ++i) {
								elm.data.articles.push({
									id: data[i].id,
									title: findFirstOfType(data[i].data, 'title'),
									abstract: findFirstOfType(data[i].data, 'abstract'),
									img: findFirstOfType(data[i].data, 'image')
								});
							}
						}
						
						callback();
					});
				};
			}

			for (var i in locals.menu) {
				menuResolvers.push(createMenuArticleResolver(locals.menu[i]));
				for (var j in locals.menu[i].subElements) {
					menuResolvers.push(createMenuArticleResolver(locals.menu[i].subElements[j]));
				}
			}

			async.parallel(menuResolvers, function(err, data) {
				if (err) {
					log.verbose('Failed to resolve all menu entries');
					next(err);
					return;
				}

				var blocksResolvers = [];

				if (locals.article) {
					for (var i in locals.article.data) {
						if (locals.article.data[i] && locals.article.data[i].meta.type === 'category' || locals.article.data[i].meta.type === 'showcase') {
							blocksResolvers.push(createCategoryResolver(locals.article.data[i], aid));
						}
					}
				}

				async.parallel(blocksResolvers, function(err, data) {
					if (err) {
						log.verbose('Failed to resolve all article blocks');
						next(err);
						return;
					}
					swig.renderFile(path.join(config.portalTemplatesPath, 'index.html'), locals, function(err, output) {
						if (err) {
							log.error('Failed to render %s', 'index.html', err);
							next(err);
							return;
						}
						res.send(output);
					});
				});

			});
		}); // this.getMenu
	}); // this.getArticle

};


PageController.prototype.renderNotFound = function(req, res, next) {
	swig.renderFile(path.join(config.portalTemplatesPath, '404.html'), {}, function (err, output) {
		if (err) {
			log.error('Failed to render %s', 'NotFound', err);
			next(err);
		}

		res.send(output);
		res.status(404);
	});
};

PageController.prototype.getMenu = function(callback) {
	this.menuDao.list({}, function(err, data) {
		if (err) {
			log.verbose('Error while getting menu entries', err);
			callback(err);
			return;
		}

		// return only first found menu
		if (data && data.length > 0) {
			callback(null, data[0]);
		} else {
			callback(null, null);
		}
	});
};

PageController.prototype.getArticle = function(aid, callback) {
	if (aid) {
		this.articlesDao.get(aid, function(err, data) {
			if (err) {
				log.verbose('Failed to get article %s', aid);
				callback(err);
				return;
			}

			callback(null, data);
		});
	} else {
		this.getArticlesByTags(['menu:index'], 0, 1, function(err, data) {
			if (err) {
				log.verbose('Failed to get indexpage by menu:index tag');
				callback(err);
				return;
			}

			if (!(data && data.length > 0)) {
				log.verbose('Not enought articles found for fixed tag menu:index');
				callback(err);
				return;
			} else {
				callback(null, data[0]);
			}
		});
	}
};

PageController.prototype.getArticlesByTags = function(tags, page, countPerPage, callback) {
	var _tags = [];
	var _limit = 20;
	var _skip = 0;

	if (tags) {
		_tags = tags;
	}

	if (countPerPage) {
		_limit = countPerPage;
	}

	if (page) {
		_skip = page * _limit;
	}
	if (countPerPage && countPerPage>1) {
		_limit = countPerPage+1;
	}
	log.info('Query limits:' + page + ' ' + _limit + ' ' + countPerPage + ' ' + _skip);

	var qf = QueryFilter.create();

	if (_tags.length > 0) {
		qf.addCriterium('meta.tags', QueryFilter.operation.ALL, _tags);
	}
	qf.addCriterium('meta.enabled', QueryFilter.operation.EQUAL, true);
	qf.addCriterium('meta.publishFrom', QueryFilter.operation.LESS_EQUAL, require('../DateUtils.js').DateUtils.nowToReverse());

	qf.addSort('meta.publishFrom', QueryFilter.sort.DESC);
	qf.addSort('meta.lastModTimestamp', QueryFilter.sort.DESC);

	qf.setSkip(_skip);
	qf.setLimit(_limit);

	this.articlesDao.list(qf, function(err, data) {
		if (err) {
			log.verbose('Error while getting articles by tag', err);
			callback(err);
			return;
		}

		callback(null, data);
	});
};


module.exports = {
	init: function(mongoDriver) {
		pageController = new PageController(mongoDriver);
	},
	renderPage: function(req, res, next) {
		if (pageController) {
			pageController.renderPage(req, res, next);
		} else {
			throw new Error('page-controller module not initialized');
		}
	},
	competitionsList: function(req, res, next) {
		if (pageController) {
			pageController.competitionsList(req, res, next);
		} else {
			throw new Error('page-controller module not initialized');
		}
	},
	competitionMatches: function(req, res, next) {
		if (pageController) {
			pageController.competitionMatches(req, res, next);
		} else {
			throw new Error('page-controller module not initialized');
		}
	},
	competitionResults: function(req, res, next) {
		if (pageController) {
			pageController.competitionResults(req, res, next);
		} else {
			throw new Error('page-controller module not initialized');
		}
	}
};
