module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib');
  require('time-grunt')(grunt);

  // configurable paths
  var config = {
    src: 'src',
    dist: 'dist'
  };

  grunt.initConfig({
    config: config,
    clean: {
      dist: {
        files: [{
          dot: true,
          src: ['<%= config.dist %>/*']
        }]
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: '<%= config.src %>/*.js'
    },
    copy: {
      sample: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>/app.nw',
          src: '**'
        }]
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          'src/log4js.core.js',
          'src/log4js.layout.js',
          'src/log4js.layout.httpPostData.js',
          'src/log4js.layout.null.js',
          'src/log4js.layout.json.js',
          'src/log4js.layout.pattern.js',
          'src/log4js.layout.simple.js',
          'src/log4js.layout.xml.js',
          'src/log4js.appender.js',
          'src/log4js.appender.ajax.js',
          'src/log4js.appender.alert.js',
          'src/log4js.appender.browserConsole.js'
        ],
        dest: 'dist/log4javascript.js'
      }
    }
  });

  grunt.registerTask('check', [
    'jshint'
  ]);

  grunt.registerTask('build', [
//    'jshint',
    'clean:dist',
    'concat:dist'
  ]);
};