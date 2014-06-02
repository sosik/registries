'use strict';

var log = require('./logging.js').getLogger('FsCtrl.js');
var extend = require('extend');
var fs = require('fs');
var async = require('async');
var path = require('path');

var DEFAULT_CFG = {
	rootPath : '/tmp/',
	routeToSubtract : '/fs/',
	filePathRegexp : /^\/fs\/\w+/
};

var contentTypes = {
	'.bin' : 'application/octet-stream',
	'.jpg' : 'image/jpeg',
	'.jpeg' : 'image/jpeg'
};

var getContentTypeByExt = function(ext) {
	if (ext && ext.length > 0) {
		var r = contentTypes[ext.toLowerCase()];
		if (r) {
			return r;
		}
	}
	return 'application/octet-stream';
};

var realPathCache = {};

var getPathWithoutRoutePrefix = function(inPath) {
	return inPath.substr(cfg.routeToSubtract.length) || '/';
};

var FsCtrl = function(options) {
	var cfg = extend(true, {}, DEFAULT_CFG, options);
	var realPathCache = {};

	cfg.rootPath = path.resolve(cfg.rootPath);
	var safePathPrefixRegexp = new RegExp("^" + cfg.rootPath);

	/**
	 * Get actual configuration
	 */
	this.getCfg = function() {
		return extend({}, cfg);
	};

	/**
	 * Calculates real intended file path
	 * 
	 * @param {string}
	 *            p - path provided in request
	 */
	this.calculateFsPath = function(p) {
		return path.resolve(path.join(cfg.rootPath, p.replace(cfg.filePathRegexp, '')));
	};

	/**
	 * Checks if provided path is save, it means it is: - path has prefix of
	 * rootPath
	 * 
	 * @return {boolean} - true if path is safe, otherwise false
	 */
	this.isPathSafe = function(p) {
		return safePathPrefixRegexp.test(path.normalize(p));
	};

	/**
	 * get directory listing filter is applied to result
	 */
	this.ls = function(req, res, filter, next) {

		var p = this.calculateFsPath(req.path);

		if (!this.isPathSafe(p)) {
			res.send(500);
			next();
		} else {
			// path is safe
			fs.lstat(p, function(err, stat) {
				if (err) {
					if (err.code === 'ENOENT') {
						res.send(404, 'Directory not found');
					} else {
						res.send(500, 'Failed to stat directory');
					}
					next();
				} else {
					if (!stat.isDirectory()) {
						log.verbose('not a dir');
						res.send(500, 'Path is not directory');
						next();
					} else {
						fs.readdir(p, function(err, entries) {
							if (err) {
								res.send(500);
								next();
							} else {
								var result = [];
								async.each(entries, function(item, callback) {
									fs.lstat(path.join(p, item), function(err, stat) {
										if (err) {
											callback(err);
											return;
										}

										var res = {};
										if (stat.isFile()) {
											res.type = 'f';
											res.size = stat.size;
											res.contentType = getContentTypeByExt(path.extname(item));
										} else if (stat.isDirectory()) {
											res.type = 'd';
										} else {
											// unsupported
											// object
											// type,
											// skipping
											callback();
											return;
										}

										res.name = item;
										if (filter != null) {
											if (filter(res)==true) {
												result.push(res);
											}
										} else {
											result.push(res);
										}

										callback();
										return;
									});
								}, function(err) {
									if (err) {
										res.send(500);
									} else {
										res.send(200, result);
									}
									next();
								});
							}
						});
					}
				}
			});
		}
	};

	/**
	 * Remove file or directory
	 */
	this.rm = function(req, res, next) {
		var p = this.calculateFsPath(req.path);

		if (!this.isPathSafe(p)) {
			res.send(500);
			next();
		} else {
			// path is safe
			fs.lstat(p, function(err, stat) {
				if (err) {
					if (err.code === 'ENOENT') {
						res.send(404, 'Entity not found');
					} else {
						res.send(500, 'Failed to stat entity');
					}
					next();
				} else {
					if (stat.isDirectory()) {
						fs.rmdir(p, function(err) {
							if (err) {
								res.send(500, 'Failed to remove directory');
								next();
							} else {
								res.send(200, 'Directory removed');
								next();
							}
						});
					} else if (stat.isFile()) {
						fs.unlink(p, function(err) {
							if (err) {
								res.send(500, 'Failed to remove file');
								next();
							} else {
								res.send(200, 'File removed');
								next();
							}
						});
					} else {
						res.send(500, 'Unknown entity type');
						next();
					}
				}
			});
		}
	};

	/**
	 * Get content of file
	 */
	this.get = function(req, res, next) {
		var p = this.calculateFsPath(req.path);

		if (!this.isPathSafe(p)) {
			res.send(500);
			next();
		} else {
			// path is safe
			fs.lstat(p, function(err, stat) {
				if (err) {
					if (err.code === 'ENOENT') {
						res.send(404, 'File not found');
					} else {
						res.send(500, 'Failed to stat file');
					}
					next();
				} else {
					if (!stat.isFile) {
						res.send(500, 'Cannot get non-file');
						next();
					} else {
						var rs = fs.createReadStream(p);
						rs.on('error', function(evt) {
							res.send(500);
							next();
						});
						res.on('error', function(evt) {
							res.send(500);
							next();
						});
						res.on('finish', function(evt) {
							next();
						});
						rs.pipe(res);
					}
				}
			});
		}
	};

	/**
	 * Create directory
	 */
	this.mkdir = function(req, res, next) {
		var p = this.calculateFsPath(req.path);

		if (!this.isPathSafe(p)) {
			res.send(500);
			next();
		} else {
			// path is safe
			fs.exists(p, function(exists) {
				if (exists) {
					res.send(500, 'Entity already exists');
					next();
				} else {
					fs.mkdir(p, function(err) {
						if (err) {
							res.send(500);
							next();
						} else {
							res.send(200);
							next();
						}
					});
				}
			});
		}
	};

	/**
	 * Put content to file
	 */
	this.put = function(req, res, next) {
		var p = this.calculateFsPath(req.path);

		if (!this.isPathSafe(p)) {
			res.send(500);
			next();
		} else {
			// path is safe
			fs.exists(p, function(exists) {
				if (exists) {
					res.send(500, 'Entity already exists');
					next();
				} else {
					var ws = fs.createWriteStream(p);
					ws.on('error', function(evt) {
						res.send(500);
						next();
					});
					req.on('error', function(evt) {
						res.send(500);
						next();
					});
					ws.on('finish', function(evt) {
						res.send(200);
						next();
					});
					req.pipe(ws);
				}
			});
		}
	};

	/**
	 * moves file to non-existing index
	 */

	this.moveRotate = function(srcFile, dstProposal, next) {

		var fileExists = true;

		var index = 0;
		var candidate = dstProposal;
		var count = 0;

		async.whilst(function() {
			return fileExists
		}, function(callback) {

			fs.exists(candidate, function(exists) {
				if (exists) {
					index++;
					candidate = dstProposal + "." + index;
				} else {
					fileExists = false;
				}
				callback();
			});
		}, function(err) {
			if (err) {
				log.verbose(err);
				next();
			} else {
				if (srcFile == candidate) {
					next();
				} else {
					fs.rename(srcFile, candidate, function(err) {
						if (err)
							throw err;
						next();
					});
				}

			}

		});

	};

	/**
	 * Replaces content of file, Original file is moved to lowest free index
	 */
	this.replace = function(req, res, next) {
		var p = this.calculateFsPath(req.path);

		var tmpPath = p + ".tmp";

		var ctrl = this;

		if (!this.isPathSafe(tmpPath)) {
			res.send(500);
			next();
		} else {
			// path is safe
			fs.exists(tmpPath, function(exists) {
				if (exists) {
					res.send(500, 'Entity already exists');
					next();
				} else {
					var ws = fs.createWriteStream(tmpPath);
					ws.on('error', function(evt) {
						res.send(500);
						next();
					});
					req.on('error', function(evt) {
						res.send(500);
						next();
					});
					ws.on('finish', function(evt) {
						res.send(200);
						// moves actual to end
						ctrl.moveRotate(p, p, function() {
							ctrl.moveRotate(tmpPath, p, next);
						});
						// moves tmp to actual

					});
					req.pipe(ws);
				}
			});
		}

	};

};

module.exports = {
	FsCtrl : FsCtrl
};
