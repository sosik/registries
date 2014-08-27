'use strict';

var log = require('./logging.js').getLogger('fsService.js');
var extend = require('extend');
var fs = require('fs');
var async = require('async');
var pathM = require('path');
var uuid =  require('node-uuid');

var DEFAULT_CFG = {
		rootPath : '/tmp/'
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

	var getExtByContentType = function(contentType) {
		if (contentType && contentType.length > 0) {
			for (var i in contentTypes) {
				if (contentTypes[i] === contentType) {
					return i;
				}
			}
		}

		return '.bin'
	}

var escapeRegExp = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

var FsCtrl = function(options) {
	
	this.cfg={};
	this.cfg = extend(true, {}, DEFAULT_CFG, options);
	
	log.silly(this.cfg);
	
	var realPathCache = {};

	this.cfg.rootPath = pathM.resolve(this.cfg.rootPath);
	var safePathPrefixRegexp = new RegExp("^" + escapeRegExp(this.cfg.rootPath));
	
	var realPathCache = {};

	
	
	/**
	 * Get content of file
	 */
	this.get = function(path, res, callback) {
		var p = this.calculateFsPath(path);

		if (!this.isPathSafe(p)) {
			callback('Path not safe')
		} else {
			// path is safe
			fs.lstat(p, function(err, stat) {
				if (err) {
					if (err.code === 'ENOENT') {
						err.code=400;
						err.message='Entity not found';
					} else {
						err.code=500;
					}
					
					callback(err);
				} else {
					if (!stat.isFile) {
						callback( 'Cannot get non-file');
					} else {
						var rs = fs.createReadStream(p);
						rs.on('error', function(evt) {
							callback(evt);
						});
						res.on('error', function(evt) {
							callback(evt);
						});
						res.on('finish', function(evt) {
							callback(null);
						});
						if (path.indexOf('.css')>1){
							res.setHeader('Content-Type','text/css');
						}
						rs.pipe(res);
					}
				}
			});
		}
	};
	
	this.ls = function(path, res,  callback) {

		
		var filter=this.cfg.fileFilter;
		var p = this.calculateFsPath(path);

		
		if (!this.isPathSafe(p)) {
			callback('Path not save ' + p);
		} else {
			// path is safe
			fs.lstat(p, function(err, stat) {
				if (err) {
					if (err.code === 'ENOENT') {
						err.message='Directory not found: '+path;
						err.code=400;
					} 
					callback(err);
					
				} else {
					if (!stat.isDirectory()) {
						callback('Path is not directory: '+path);
						next();
					} else {
						fs.readdir(p, function(err, entries) {
							
							if (err) {
								err.code=500;
								callback(err);
								next();
							} else {
								var result = [];
								async.each(entries, function(item, acallback) {
									fs.lstat(pathM.join(p, item), function(err, stat) {
										
										if (err) {
											acallback(err);
											return;
										}

										var res = {};
										if (stat.isFile()) {
											res.type = 'f';
											res.size = stat.size;
											res.contentType = getContentTypeByExt(pathM.extname(item));
										} else if (stat.isDirectory()) {
											res.type = 'd';
										} else {
											// unsupported object type,skipping
											acallback();
											return;
										}

										res.name = item;
										if (filter != null) {
											if (filter(res) === true) {
												result.push(res);
											}
										} else {
											result.push(res);
										}

										acallback();
										return;
									});
								}, function(err) {
									if (err) {
										callback(err);
									} else {
										res.send(200, result);
										callback(null);
									}
								});
							}
						});
					}
				}
			});
		}
	};

	
	/**
	 * Put content to file
	 */
	this.put = function(path,req, res, callback) {
		var p = this.calculateFsPath(req.path);

		if (!this.isPathSafe(p)) {
			callback('Path is not safe: '+ path);
		} else {
			// path is safe
			fs.exists(p, function(exists) {
				if (exists) {
					callback( 'Entity already exists: '+path);
					
				} else {
					var ws = fs.createWriteStream(p);
					ws.on('error', function(evt) {
						callback(evt);
					});
					req.on('error', function(evt) {
						callback(evt);
					});
					ws.on('finish', function(evt) {
						res.send(200);
						callback(null);
					});
					req.pipe(ws);
				}
			});
		}
	};

	/**
	 * Puts content to file into target directory and returns path to file
	 */
	this.putGetPath = function(path, content, contentType, callback) {
		var filename = uuid.v4() + getExtByContentType(contentType);
		var p = this.calculateFsPath(pathM.join(path, filename));

		if (!this.isPathSafe(p)) {
			callback('Path is not safe: '+ path);
		} else {
			// path is safe
			fs.exists(p, function(exists) {
				if (exists) {
					// statistics sometimes fail
					that.putGetPath(path, content, contentType, callback);
					
				} else {
					var ws = fs.createWriteStream(p);
					ws.on('error', function(evt) {
						callback(evt);
					});
					content.on('error', function(evt) {
						callback(evt);
					});
					ws.on('finish', function(evt) {
						callback(null, filename);
					});
					content.pipe(ws);
				}
			});
		}
	}

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
				callback(err);
			} else {
				if (srcFile === candidate) {
					next();
				} else {
					fs.rename(srcFile, candidate, function(err) {
						next(err);
					});
				}

			}

		});

	};

	/**
	 * Replaces content of file, Original file is moved to lowest free index
	 */
	this.replace = function(path,req, res, callback) {
		var p = this.calculateFsPath(path);
	
		// works as lock
		var tmpPath = p + ".tmp";

		var ctrl = this;

		if (!this.isPathSafe(tmpPath)) {
			callback('Path is not safe'+ path)
		} else {
			// path is safe
			fs.exists(tmpPath, function(exists) {
				if (exists) {
					callback('Entity already exists');
				} else {
					var ws = fs.createWriteStream(tmpPath);
					ws.on('error', function(evt) {
						callback(evt);
					});
					req.on('error', function(evt) {
						callback(evt);
					});
					ws.on('finish', function(evt) {
						res.send(200);
						// moves actual to end
						ctrl.moveRotate(p, p, function() {
							ctrl.moveRotate(tmpPath, p, callback);
						});
						// moves tmp to actual

					});
					req.pipe(ws);
				}
			});
		}

	};
	

	/**
	 * Create directory
	 */
	this.mkdir = function(path, res, callback) {
		
		var p = this.calculateFsPath(path);

		if (!this.isPathSafe(p)) {
			callback('Path is not safe'+ path);
		} else {
			// path is safe
			fs.exists(p, function(exists) {
				if (exists) {
					callback('Entity already exists'+path);
					
				} else {
					fs.mkdir(p, function(err) {
						if (err) {
							callback(err);
						} else {
							res.send(200);
							callback();
						}
					});
				}
			});
		}
	};
	
	/**
	 * Remove file or directory
	 */
	this.rm = function(path, res, callback) {
		var p = this.calculateFsPath(path);
		

		if (!this.isPathSafe(p)) {
			calback('Path not safe'+path);
		} else {
			// path is safe
			fs.lstat(p, function(err, stat) {
				if (err) {
					if (err.code === 'ENOENT') {
						err.code=404;
						err.message='Entity not found: '+path;
					} else {
						err.message='Failed to stat entity: '+path;
					}
					
					callback(err);
				} else {
					if (stat.isDirectory()) {
						fs.rmdir(p, function(err) {
							if (err) {
								err.message='Failed to remove directory: '+path;
								callback(err);
							} else {
								res.send(200, 'Directory removed: '+ path);
								callback(null);
							}
						});
					} else if (stat.isFile()) {
						fs.unlink(p, function(err) {
							if (err) {
								err.message='Failed to remove file: '+path;
								callback(err);
							} else {
								res.send(200, 'File removed '+ path);
								callback(null);
							}
						});
					} else {
						err= 'Unknown entity type: '+ path;
						callback(err);
					}
				}
			});
		}
	};

	

	
	
	/**
	 * Calculates real intended file path
	 * 
	 * @param {string}
	 *            p - path provided in request
	 */
	this.calculateFsPath = function(p) {
		return pathM.resolve(pathM.join(this.cfg.rootPath, p));
	};

	/**
	 * Checks if provided path is save, it means it is: - path has prefix of
	 * rootPath
	 * 
	 * @return {boolean} - true if path is safe, otherwise false
	 */
	this.isPathSafe = function(p) {
		return safePathPrefixRegexp.test(pathM.normalize(p));
	};

};

module.exports = {
	FsCtrl : FsCtrl
};
