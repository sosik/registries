module.exports = function(grunt) {
	'use strict';

	var fs = require('fs');
	var path = require('path');

	grunt.registerTask('dataVersionCheck',
	'Checks compatibility of data set in data directory with provided code',
	function() {
		var done = this.async();

		fs.readFile(path.join(process.cwd(), 'data', 'COMPATIBILITY_VERSION'), function(err1, dataVer) {
			if (err1) {
				grunt.log.subhead('FAILED TO LOAD COMPATIBILITY VERSION OF DATA');
				grunt.log.error('Failed to read data version file');
				done(false);
				return;
			}

			fs.readFile(path.join(process.cwd(), 'REQUIRED_VERSION'), function(err2, coreVer) {
				if (err2) {
					grunt.log.subhead('FAILED TO LOAD COMPATIBILITY VERSION OF CORE');
					grunt.log.error('Failed to read core version file');
					done(false);
					return;
				}

				var coreStr = coreVer.toString();
				var dataStr = dataVer.toString();

				if (Number(coreStr) > Number(dataStr)) {
					grunt.log.subhead('INCOMPATIBLE CORE AND DATA VERSIONS');
					grunt.log.error('Required version: ', coreStr);
					grunt.log.error('Data version: ', dataStr);
					done(false);
					return;
				}

				done();
				return;
			});
		});
	});
};

