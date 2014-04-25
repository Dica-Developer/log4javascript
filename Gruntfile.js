module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-karma');
  require('time-grunt')(grunt);

  // configurable paths
  var config = {
    src: 'src',
    dist: 'dist',
    test: 'test'
  };

  grunt.initConfig({
    config: config,
    watch: {
      options: {
        nospawn: true
      },
      dev: {
        files: [
          '<%= config.src %>/**/*.js'
        ],
        tasks: ['devWatch']
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: ['<%= config.dist %>/*']
        }]
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= config.dist %>/log4javascript.min.js': ['<%= config.dist %>/log4javascript.js']
        }
      }
    },
    jsdoc : {
      dist : {
        src: ['<%= config.lib %>/*.js', '<%= config.lib %>/api/*.js', 'README.md'],
        options: {
          destination: 'doc',
          configure: 'jsdoc.conf.json',
          template: 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
          tutorials: 'tutorials'
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: ['<%= config.src %>/*.js']
    },
    requirejs: {
      options: {
        loglevel: 5,
        inlineText: true,
        baseUrl: './<%= config.src %>',
        optimize: 'uglify',
        name: 'log4js',
        out: 'dist/log4js.min.js'
      },
      dist: {}
    },
    karma: {
      dist: {
        configFile: '<%= config.test %>/dist.karma.conf.js'
      },
      dev: {
        configFile: '<%= config.test %>/console.karma.conf.js'
      },
      travis: {
        configFile: '<%= config.test %>/travis.karma.conf.js'
      }
    }
  });

  grunt.registerTask('devWatch', [
    'jshint'
  ]);

  grunt.registerTask('dev', [
    'jshint',
    'watch:dev'
  ]);

  grunt.registerTask('build', [
    'jshint',
    'clean:dist',
    'concat:dist',
    'karma:dist',
    'uglify:dist'
  ]);

  grunt.registerTask('test', [
    'jshint',
    'karma:dev'
  ]);

  grunt.registerTask('travis', [
    'jshint',
    'karma:travis'
  ]);
};