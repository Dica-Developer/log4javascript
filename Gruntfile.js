module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-jsdoc');
  require('time-grunt')(grunt);

  var getFooter = function(){
    return '\nif (typeof module === "object" && module && typeof module.exports === "object") {\n' +
      'module.exports = log4javascript;\n' +
      '} else {\n' +
      'window.log4javascript = log4javascript;\n'+
      'if (typeof define === "function" && define.amd) {\n' +
      '  define("log4javascript", [], function() {\n'+
      '    return log4javascript;\n'+
      ' });\n'+
      '}\n'+
      '}\n'+
      '}(window));\n';
  };

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
      files: '<%= config.src %>/*.js',
      afterconcat:  ['<%= config.dist %>/log4javascript.js']
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
        options: {
          banner: '(function(window){\n  \'use strict\';\n',
          footer: getFooter()
        },
        src: [
          'src/log4js.params.js',
          'src/log4js.logger.js',
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
          'src/log4js.appender.popup.js'
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
        src: [
          'src/log4js.core.js',
          'src/log4js.logger.js',
          'src/log4js.appender.js',
          'src/log4js.appender.ajax.js',
          'src/log4js.appender.alert.js',
          'src/log4js.appender.browserConsole.js',
          'src/log4js.layout.js',
          'src/log4js.layout.json.js',
          'src/log4js.layout.null.js',
          'src/log4js.layout.httpPostData.js'
        ],
        options: {
          destination: 'documentation'
        }
      }
    }
  });

  grunt.registerTask('check', [
    'jshint'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'concat:dist',
    'jshint:afterconcat',
    'uglify:dist'
  ]);
};