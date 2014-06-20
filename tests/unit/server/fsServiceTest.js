var expect = require('chai').expect;
var fs = require('fs.extra');
var path = require('path');
var async = require('async');
var util = require('util');
var stream = require('stream');
var fsCtrlModule = require(process.cwd() + '/build/server/fsService.js');
var log = require(process.cwd() + '/build/server/logging.js').getLogger('fsServiceTest.js');

var testDataPath = path.join(process.cwd(), 'testData');

describe('FsService', function() {
	beforeEach(function(done) {
		fs.mkdir(testDataPath, function(err) {
			if (err) {
				if (err.code !== 'EEXIST') {
					throw err;
				}
			}
			done();
		});
	});

	afterEach(function(done) {
		fs.rmrf(testDataPath, function(err) {
			done();
		});
	});

	var fsCtrl = new fsCtrlModule.FsCtrl({rootPath: testDataPath});

	it('should be instantiated correctly by require()', function(done) {
		expect(fsCtrlModule).to.include.key('FsCtrl');

		done();
	});

	
	
	it('should identify safe/unsafe paths', function(done) {
		var fsCtrl = new fsCtrlModule.FsCtrl({rootPath: testDataPath});
		expect(fsCtrl.isPathSafe(path.join(testDataPath, '../data/'))).to.be.false;
		expect(fsCtrl.isPathSafe(path.join(testDataPath, '/data/'))).to.be.true;
		done();
	});

	it('should calculate intended fs path from url', function(done) {
		var fsCtrl = new fsCtrlModule.FsCtrl({
			rootPath: testDataPath,
			filePathRegexp: /^\/fs\/\w+\//i
		});
		
		expect(fsCtrl.calculateFsPath('/dir/file.jpg')).to.be.equal(path.join(testDataPath, '/dir/file.jpg'));

		done();
	});

	it('should list directory', function(done) {
		fs.mkdirSync(path.join(testDataPath, 'lsDir'));
		fs.writeFileSync(path.join(testDataPath, 'lsDir/f1'), "xxxx");
		fs.writeFileSync(path.join(testDataPath, 'lsDir/f2'), "yyy");
		fs.mkdirSync(path.join(testDataPath, 'lsDir/subdir'));

		var fsCtrl = new fsCtrlModule.FsCtrl({rootPath: testDataPath});

		var reqMock =  '/lsDir';
		var resMock = {
			statusCode: null,
			data: null,
			send: function(code, data) {
				this.statusCode = code;
				this.data = data;
			}
		};
		
		fsCtrl.ls(reqMock, resMock,  function(err) {
			expect(err).to.not.exist;
			expect(resMock.statusCode).to.be.equal(200);
			expect(resMock.data.length).to.be.equal(3);

			done();
		});
	});

	
	it('should list directory and filter reults', function(done) {
		fs.mkdirSync(path.join(testDataPath, 'lsDir'));
		fs.writeFileSync(path.join(testDataPath, 'lsDir/f1'), "xxxx");
		fs.writeFileSync(path.join(testDataPath, 'lsDir/f3.1'), "xxxx.2");
		fs.writeFileSync(path.join(testDataPath, 'lsDir/f2'), "yyy");
		fs.mkdirSync(path.join(testDataPath, 'lsDir/subdir'));

		var filterMeth= function(item){
			if (! /.*\.[0-9]+/.test(item.name)) {
				return true;
			
			}
			return false;
		}; 
		
		var fsCtrl = new fsCtrlModule.FsCtrl({rootPath: testDataPath, fileFilter:filterMeth});

		var reqMock = '/lsDir';
		var resMock = {
			statusCode: null,
			data: null,
			send: function(code, data) {
				this.statusCode = code;
				this.data = data;
			}
		};

		var filter= function( item){
			var regexp = /.*\.[0-9]+/;
			if (!regexp.test(item.name)) {
				return true;
			}
			return false;
		};
		
		fsCtrl.ls(reqMock, resMock,  function(err) {
			expect(err).to.not.exist;
			expect(resMock.statusCode).to.be.equal(200);
			expect(resMock.data.length).to.be.equal(3);

			done();
		});
	});
	
	it('should remove files and directories', function(done) {
		fs.mkdirSync(path.join(testDataPath, 'lsDir'));
		fs.writeFileSync(path.join(testDataPath, 'lsDir/f1'), "xxxx");
		fs.writeFileSync(path.join(testDataPath, 'lsDir/f2'), "yyy");
		fs.mkdirSync(path.join(testDataPath, 'lsDir/subdir'));
		fs.mkdirSync(path.join(testDataPath, 'lsDir/subdir2'));
		fs.writeFileSync(path.join(testDataPath, 'lsDir/subdir2/f3'), "yyy");

		var fsCtrl = new fsCtrlModule.FsCtrl({rootPath: testDataPath});

		var reqMock = function(_path) {
			this.path = _path;
		};

		var resMock = function() {
			this.statusCode = null;
			this.data = null;
			this.send = function(code, data) {
				this.statusCode = code;
				this.data = data;
			};
		};

		async.parallel([
			function(callback) {
				var req = '/lsDir/f1';
				var res = new resMock();

				fsCtrl.rm(req, res, function(err) {
					expect(err).to.not.exist;
					
					fs.exists(path.join(testDataPath, 'lsDir/f1'), function(exists) {
						expect(exists).to.be.false;
						callback();
					});
				});
			},
			function(callback) {
				var req = '/lsDir/subdir';
				var res = new resMock();

				fsCtrl.rm(req, res, function(err) {
					expect(err).to.not.exist;
					
					fs.exists(path.join(testDataPath, 'lsDir/subdir'), function(exists) {
						expect(exists).to.be.false;
						callback();
					});
				});
			},
			function(callback) {
				var req = '/lsDir/subdir2';
				var res = new resMock();

				fsCtrl.rm(req, res, function(err) {
					expect(err).to.exist;
					expect(err.statusCode||500).to.be.equal(500);
					callback();
				});
			},
			function(callback) {
				var req = '/lsDir/nonexisting';
				var res = new resMock();

				fsCtrl.rm(req, res, function(err) {
					expect(err).to.exist;
					expect(err.code).to.be.equal(404);
					callback();
				});
			}
		],
		function(err) {
			done();
		});
	});

	
	it('should increment index if existing dstfile', function(done) {
		
		fs.mkdirSync(path.join(testDataPath, 'replaceDir'));
		
		fs.writeFileSync(path.join(testDataPath, 'replaceDir/f1'), "xxxx");

		var fsCtrl = new fsCtrlModule.FsCtrl({rootPath: testDataPath});

		var reqMock = function(_path, _data) {
			stream.Readable.call(this);
			this.path = _path;
			this.data = _data;
		};
		util.inherits(reqMock, stream.Readable);

		reqMock.prototype._read = function(size) {
			this.push(this.data);
			this.push(null);
		};

		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.send = function(code, data) {
				this.statusCode = code;
				if (data) {
					this.data += data;
				}
			};
		};
		util.inherits(resMock, require('stream').Writable);

		resMock.prototype._write = function(chunk, encoding, callback) {
			if (chunk) {
				this.data += chunk.toString(encoding);
			}

			callback();
		};
		async.parallel([
			function(callback) {
				var req = new reqMock('replaceDir/f1','yyyy');
				var res = new resMock();
				

				fsCtrl.replace('/replaceDir/f1',req, res, function(err) {

					expect(err).to.not.exist;
					expect(fs.existsSync(path.join(testDataPath, "replaceDir/f1.1"))).to.be.true;
					expect(fs.existsSync(path.join(testDataPath, "replaceDir/f1"))).to.be.true;
					callback();
				});
			}
		],
		function(err) {
			done();
		});
	});
	

	
	it('should create new file index if dst does not exist no index files', function(done) {
		
		fs.mkdirSync(path.join(testDataPath, 'replaceDir'));
		

		var fsCtrl = new fsCtrlModule.FsCtrl({rootPath: testDataPath});

		var reqMock = function(_path, _data) {
			stream.Readable.call(this);
			this.path = _path;
			this.data = _data;
		};
		util.inherits(reqMock, stream.Readable);

		reqMock.prototype._read = function(size) {
			this.push(this.data);
			this.push(null);
		};

		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.send = function(code, data) {
				this.statusCode = code;
				if (data) {
					this.data += data;
				}
			};
		};
		util.inherits(resMock, require('stream').Writable);

		resMock.prototype._write = function(chunk, encoding, callback) {
			if (chunk) {
				this.data += chunk.toString(encoding);
			}

			callback();
		};
		async.parallel([
			function(callback) {
				var req = new reqMock('/replaceDir/f2','yyyy');
				var res = new resMock();
				

				fsCtrl.replace('/replaceDir/f2',req, res, function(err) {

					expect(err).to.not.exist;
					expect(fs.existsSync(path.join(testDataPath, "replaceDir/f2.1"))).to.be.false;
					expect(fs.existsSync(path.join(testDataPath, "replaceDir/f2"))).to.be.true;
					callback();
				});
			}
		],
		function(err) {
			done();
		});
	});
	

	
	
	it('should get file', function(done) {
		fs.writeFileSync(path.join(testDataPath, 'f1'), "xxxx");

		
		var fsCtrl = new fsCtrlModule.FsCtrl({rootPath: testDataPath});

		var reqMock = function(_path) {
			this.path = _path;
		};
		

		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.send = function(code, data) {
				this.statusCode = code;
				if (data) {
					this.data += data;
				}
			};
		};
		util.inherits(resMock, require('stream').Writable);

		resMock.prototype._write = function(chunk, encoding, callback) {
			if (chunk) {
				this.data += chunk.toString('utf8');
			}

			callback();
		};

		fsCtrl.get('f1', res = new resMock(), function(err) {
			expect(err).to.not.exist;
			expect(res.data).to.be.equal('xxxx');
			done();
		});
	});

	it('should create directory', function(done) {
		var fsCtrl = new fsCtrlModule.FsCtrl({rootPath: testDataPath});

		var reqMock = function(_path) {
			this.path = _path;
		};

		var resMock = function() {
			this.statusCode = null;
			this.data = null;
			this.send = function(code, data) {
				this.statusCode = code;
				this.data = data;
			};
		};

		fsCtrl.mkdir('/xxx', res = new resMock(), function(err) {
			expect(err).to.not.exist;
			expect(res.statusCode).to.be.equal(200);
			fs.exists(path.join(testDataPath, '/xxx'), function(exists) {
				expect(exists).to.be.true;
				done();
			});
		});
	});

	it('should put file into dir and return path', function(done) {
		fs.writeFileSync(path.join(testDataPath, 'fX3'), "xxxxiYYYY");

		var fsCtrl = new fsCtrlModule.FsCtrl({rootPath: testDataPath});

		var reqMock = function(_path, _data) {
			stream.Readable.call(this);
			this.path = _path;
			this.data = _data;
		};
		util.inherits(reqMock, stream.Readable);

		reqMock.prototype._read = function(size) {
			this.push(this.data);
			this.push(null);
		};

		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.send = function(code, data) {
				this.statusCode = code;
				if (data) {
					this.data += data;
				}
			};
		};
		util.inherits(resMock, require('stream').Writable);

		resMock.prototype._write = function(chunk, encoding, callback) {
			if (chunk) {
				this.data += chunk.toString(encoding);
			}

			callback();
		};

		async.parallel([function(callback) {
			// no content type
			var req = new reqMock('.', 'abcd');
			var res = new resMock();
			fsCtrl.putGetPath('.', req, null, function(err, path) {
				expect(err).to.not.exist;
				expect(path).to.exist;
				callback();
			});
		},
		function(callback) {
			var req = new reqMock('.', 'abcd');
			var res = new resMock();
			fsCtrl.putGetPath('.', req, 'image/jpeg', function(err, path) {
				expect(err).to.not.exist;
				expect(path).to.exist;
				callback();
			});

		}],
		function(err) {
			done();
		});
	});

	it('should put file', function(done) {
		fs.writeFileSync(path.join(testDataPath, 'f1'), "xxxx");

		var fsCtrl = new fsCtrlModule.FsCtrl({rootPath: testDataPath});

		var reqMock = function(_path, _data) {
			stream.Readable.call(this);
			this.path = _path;
			this.data = _data;
		};
		util.inherits(reqMock, stream.Readable);

		reqMock.prototype._read = function(size) {
			this.push(this.data);
			this.push(null);
		};

		var resMock = function() {
			require('stream').Writable.call(this);
			this.statusCode = null;
			this.data = '';
			this.send = function(code, data) {
				this.statusCode = code;
				if (data) {
					this.data += data;
				}
			};
		};
		util.inherits(resMock, require('stream').Writable);

		resMock.prototype._write = function(chunk, encoding, callback) {
			if (chunk) {
				this.data += chunk.toString(encoding);
			}

			callback();
		};

		async.parallel([function(callback) {
			// saving to existing file
			var req = new reqMock('f1', 'abcd');
			var res = new resMock();
			fsCtrl.put('f1',req, res, function(err) {
				expect(err).to.exist;
				callback();
			});
		}, function(callback) {
			// correct save
			var req = new reqMock('f2', 'abcd');
			var res = new resMock();
			fsCtrl.put('f2',req, res, function(err) {
				expect(err).to.not.exist;
				expect(res.statusCode).to.be.equal(200);
				expect(fs.readFileSync(path.join(testDataPath, 'f2'), {encoding:'utf8'})).to.be.eql('abcd');
				callback();
			});
		}, function(callback) {
			// wrong path
			var req = new reqMock('../../../f2', 'abcd');
			var res = new resMock();
			fsCtrl.put('../../../f2',req, res, function(err) {
				expect(err).to.exist;
				callback();
			});
		}],
		function(err) {
			done();
		});
	});
});
