module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.registerTask('build:server', ['copy:server']);
	grunt.registerTask('build:client', ['copy:html', 'copy:css', 'copy:js', 'copy:img']);

	grunt.registerTask('build', ['clean:build', 'build:client', 'copy:bower', 'build:server']);
	grunt.registerTask('test', ['build', 'mochaTest:unitServer', 'mochaTest:integration']);
	grunt.registerTask('unitTest', ['build', 'mochaTest:unitServer']);
	grunt.registerTask('integrationTest', ['build', 'mochaTest:integration']);

	grunt.registerTask('default', ['build', 'unitTest']);

	grunt.initConfig({
		copy: {
			html: {
				files: [
					{expand: true, cwd: 'src/client/html', src: ['**'], dest: 'build/client/'}
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
			bower: {
				files: [
					{expand: true, cwd: 'bower_components', src: ['**'], dest: 'build/client/lib/'}
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
				files: ['src/client/**', 'src/client/html', 'src/client/css', 'src/client/js', 'src/client/img'],
				tasks: ['build:client']
			}
		},
		clean: {
			build: ['build/']
		}
	});
};
