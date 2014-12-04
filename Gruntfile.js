module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-mocha-istanbul');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('build:schemas', ['copy:schemas']);
	grunt.registerTask('build:server', ['build:schemas', 'copy:server','copy:templates','copy:ssl', 'copy:sharedJsServer']);
	grunt.registerTask('build:client', ['build:schemas', 'copy:html','copy:htmlpartials', 'copy:css', 'copy:js', 'copy:img', 'copy:fonts', 'sass', 'copy:sharedJsClient']);

	grunt.registerTask('build', ['clean:build', 'build:client', 'copy:bower', 'build:server', 'build:schemas']);
	grunt.registerTask('test', ['env:test', 'build', 'mochaTest:unitServer', 'mochaTest:unitShared']);
	grunt.registerTask('unitTest', ['env:test', 'build', 'mochaTest:unitServer', 'mochaTest:unitShared']);
	grunt.registerTask('integrationTest', ['env:test', 'build', 'mochaTest:integration']);
	grunt.registerTask('coverage', ['env:test', 'build', 'mocha_istanbul']);

	grunt.renameTask('clean', '_clean');
	grunt.registerTask('clean', ['_clean:build']);
	grunt.registerTask('mrpropper', ['clean', '_clean:node_modules', '_clean:bower_components', '_clean:coverage']);

	grunt.registerTask('doc', 'yuidoc');

	grunt.registerTask('x', ['uglify', 'copy:xparts', 'copy:xhtml', 'sass:x']);
	grunt.registerTask('default', ['build', 'x', 'unitTest']);

	grunt.registerTask('portal', ['uglify:xpsui', 'build:server', 'build:client'])

	grunt.initConfig({
		copy: {
			html: {
				files: [
					{expand: true, cwd: 'src/client/html', src: ['**'], dest: 'build/client/'}
				]
			},

			htmlpartials: {
				files: [
					{expand: true, cwd: 'src/client/partials', src: ['**'], dest: 'build/client/partials'}
				]
			},

			css: {
				files: [
					{expand: true, cwd: 'src/client/css', src: ['**'], dest: 'build/client/css/'}
				]
			},
			js: {
				files: [
					{expand: true, cwd: 'src/client/js', src: ['**'], dest: 'build/client/js'}
				]
			},
			img: {
				files: [
					{expand: true, cwd: 'src/client/img', src: ['**'], dest: 'build/client/img'}
				]
			},
			fonts: {
				files: [
					{expand: true, cwd: 'src/client/fonts', src: ['**'], dest: 'build/client/fonts'}
				]
			},
			bower: {
				files: [
					{expand: true, cwd: 'bower_components', src: ['**'], dest: 'build/client/lib/'}
				]
			},
			server: {
				files: [
					{expand: true, cwd: 'src/server', src: ['**'], dest: 'build/server/'}
				]
			},
			templates: {
				files: [
					{expand: true, cwd: 'src/server/templates', src: ['**'], dest: 'build/server/templates'}
				]
			},
			ssl: {
				files: [
					{expand: true, cwd: 'util/ssl', src: ['**'], dest: 'build/server/ssl'}
				]
			},
			schemas: {
				files: [
					{expand: true, cwd: 'src/shared/schemas', src: ['**'], dest: 'build/shared/schemas'}
				]
			},
			sharedJsClient: {
				files: [
					{expand: true, cwd: 'src/shared/js', src: ['**'], dest: 'build/client/js'}
				]
			},
			sharedJsServer: {
				files: [
					{expand: true, cwd: 'src/shared/js', src: ['**'], dest: 'build/server'}
				]
			},
			xparts: {
				files: [
					{expand: true, cwd: 'src/client/partials', src: ['**/x-*'], dest: 'build/client/partials'}
				]
			},
			xhtml: {
				files: [
					{expand: true, cwd: 'src/client/html', src: ['**/x-*'], dest: 'build/client/'}
				]
			}
		},
		uglify: {
			xpsui: {
				options: {
					sourceMap: true,
					sourceMapIncludeSources: true
				},
				files: {
					'build/client/js/xpsui.min.js': [
						'src/client/js/xpsui/services-module.js', 'src/client/js/xpsui/services/*.js',
						'src/client/js/xpsui/directives-module.js', 'src/client/js/xpsui/directives/*.js'
					]
				}
			},
			main: {
				options: {
					sourceMap: true,
					sourceMapIncludeSources: true
				},
				files: {
					'build/client/js/x-main.min.js': ['src/client/js/x-main.min.js', 'src/client/js/x-*.js']
				}
			}
		},
		mochaTest: {
			unitServer: {
				options: {
					reporter: 'spec'
				},
				src: ['tests/unit/server/**/*']
			},
			unitShared: {
				options: {
					reporter: 'spec'
				},
				src: ['tests/unit/shared/**/*']
			},
			integration: {
				options: {
					reporter: 'spec'
				},
				src: ['tests/integration/**/*']
			}
		},
		mocha_istanbul: {
			coverage_unit: {
				src: 'tests/unit/server/',
					options: {
					mask: '*.js'
				}
			}
		},
		watch: {
			server: {
				files: ['src/server/**'],
				tasks: ['build:server']
			},
			client: {
				files: ['src/client/html/**', 'src/client/css/**', 'src/client/js/**', 'src/client/img/**','src/client/partials/**', 'src/client/fonts/**'],
				tasks: ['build:client']
			},

			schemas: {
				files: ['src/shared/schemas/**'],
				tasks: ['build:schemas']
			},
			sharedJs: {
				files: ['src/shared/js/**'],
				tasks: ['build:server', 'build:client']
			},
			sass: {
				files: ['src/client/scss/**'],
				tasks: ['sass:compile']
			},
			x: {
				files: ['src/client/**'],
				tasks: ['x']
			},
			portal: {
				files: ['src/**'],
				tasks: ['portal']
			}
		},
		_clean: {
			build: ['build/'],
			node_modules: ['node_modules/'],
			bower_components: ['bower_components/'],
			coverage: ['coverage/']
		},
		sass: {
			compile: {
				options: {
					unixNewlines: true
				},
				files: [{
					expand: true,
					cwd: 'src/client/scss/',
					src: ['main.scss'],
					dest: 'build/client/css/',
					ext: '.css'
				}]
			},
			bootstrap: {
				options: {
					unixNewlines: true
				},
				files: [{
					expand: true,
					cwd: 'src/client/scss/',
					src: ['bootstrap.scss'],
					dest: 'build/client/css/',
					ext: '.css'
				}]
			},
			x: {
				options: {
					unixNewlines: true,
					sourcemap: 'inline'
				},
				files: {
					'build/client/css/x-main.css': 'src/client/scss/x-main.scss',
					'build/client/css/x.css': 'src/client/scss/x/x.scss',
					'build/client/css/x-default.css': 'src/client/scss/x/default/default.scss'
				}
			}
		},
		yuidoc: {
			compile: {
				options: {
					paths: ['src/server/', 'src/client/js/'],
					outdir: 'doc'
				}
			}
		},
		env: {
			test: {
				NODE_ENV: 'test'
			}
		}
	});
};
