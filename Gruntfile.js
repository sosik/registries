module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-env');

	grunt.registerTask('build:server', ['copy:server']);
	grunt.registerTask('build:shared', ['copy:shared_schemas']);
	grunt.registerTask('build:client', ['copy:html','copy:htmlpartials', 'copy:css', 'copy:js', 'copy:img', 'copy:fonts', 'sass:compile']);

	grunt.registerTask('build', ['clean:build', 'build:client', 'copy:bower', 'build:server', 'build:shared']);
	grunt.registerTask('test', ['env:test', 'build', 'mochaTest:unitServer']);
	grunt.registerTask('unitTest', ['env:test', 'build', 'mochaTest:unitServer']);
	grunt.registerTask('integrationTest', ['env:test', 'build', 'mochaTest:integration']);

	grunt.renameTask('clean', '_clean');
	grunt.registerTask('clean', ['_clean:build']);
	grunt.registerTask('mrpropper', ['clean', '_clean:node_modules', '_clean:bower_components']);

	grunt.registerTask('default', ['build', 'unitTest']);

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
			shared_schemas: {
				files: [
					{expand: true, cwd: 'src/shared/schemas', src: ['**'], dest: 'build/shared/schemas/'}
				]
			},
			server: {
				files: [
					{expand: true, cwd: 'src/server', src: ['**'], dest: 'build/server/'}
				]
			}
		},
		mochaTest: {
			unitServer: {
				options: {
					reporter: 'spec'
				},
				src: ['tests/unit/server/**/*']
			},
			integration: {
				options: {
					reporter: 'spec'
				},
				src: ['tests/integration/**/*']
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
			
			shared: {
				files: ['src/shared/schemas/**'],
				tasks: ['build:shared']
			},
			sass: {
				files: ['src/client/scss/**'],
				tasks: ['sass:compile']
			}
		},
		_clean: {
			build: ['build/'],
			node_modules: ['node_modules/'],
			bower_components: ['bower_components/']
		},
		sass: {
			compile: {
				options: {
					unixNewlines: true,
					sourcemap: true
				},
				files: [{
					expand: true,
					cwd: 'src/client/scss/',
					src: ['*.scss'],
					dest: 'build/client/css/',
					ext: '.css'
				}]
			}
		},
		env: {
			test: {
				NODE_ENV: 'test'
			}
		}
	});
};
