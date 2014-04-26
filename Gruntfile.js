module.exports = function (grunt) {
  'use strict';

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-karma-coveralls');

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
        optimize: 'none',
        preserveLicenseComments: false,
//        generateSourceMaps: true,
        wrap: {
          start: '(function() {\n \'use strict\'',
          end: '}());'
        }
      },
      browserConsole: {
        options:{
          include: 'log4js.part.browserConsole',
          out: 'dist/log4js.part.browserConsole.js'
        }
      },
      console: {
        options:{
          include: 'log4js.part.console',
          out: 'dist/log4js.part.console.js'
        }
      }
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
    },
    coveralls: {
      options: {
        'debug': true,
        'coverage_dir': 'test/coverage'
      }
    },
    complexity: {
      generic: {
        src: ['<%= config.src %>/**/*.js'],
        options: {
          breakOnErrors: false,
//          jsLintXML: 'report.xml',         // create XML JSLint-like report
//          checkstyleXML: 'checkstyle.xml', // create checkstyle report
          errorsOnly: false,               // show only maintainability errors
          cyclomatic: [3, 7, 12],          // or optionally a single value, like 3
          halstead: [8, 13, 20],           // or optionally a single value, like 8
          maintainability: 100,
          hideComplexFunctions: false      // only display maintainability
        }
      }
    }
  });

  grunt.registerTask('devWatch', [
    'jshint',
    'complexity'
  ]);

  grunt.registerTask('dev', [
    'jshint',
    'complexity',
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
    'karma:travis',
    'coveralls'
  ]);
};