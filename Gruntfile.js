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
      afterconcat:  ['<%= config.dist %>/log4javascript.js'],
      beforeconcat:  ['<%= config.src %>/*.js']
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
      options: {},
      dist: {
        options: {
          banner: 'define(\'log4javascript\', [], function() {\n \'use strict\';\n ',
          footer: '\nreturn log4javascript;\n});'
        },
        src: [
          'src/log4js.params.js',
          'src/log4js.formatObjectExpansion.js',
          'src/log4js.simpleDateFormat.js',
          'src/log4js.level.js',
          'src/log4js.logger.js',
          'src/log4js.eventSupport.js',
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
          'src/log4js.appender.browserConsole.js',
          'src/log4js.consoleHtmlLines.js',
          'src/log4js.appender.console.js',
          'src/log4js.appender.popup.js',
          'src/log4js.appender.inPage.js',
          'src/log4js.popupInpage.init.js'
        ],
        dest: 'dist/log4javascript.js'
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
      dev : {
        src: ['src/*.js'],
        options: {
          destination: 'documentation'
        }
      }
    },
    karma: {
      dist: {
        configFile: '<%= config.test %>/dist.karma.conf.js'
      },
      dev: {
        configFile: '<%= config.test %>/console.karma.conf.js'
      }
    }
  });

  grunt.registerTask('check', [
    'jshint'
  ]);

  grunt.registerTask('build', [
    'jshint:beforeconcat',
    'clean:dist',
    'concat:dist',
    'karma:dist',
    'uglify:dist'
  ]);

  grunt.registerTask('dev', [
    'karma:dev'
  ]);
};