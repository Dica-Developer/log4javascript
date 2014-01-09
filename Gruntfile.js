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
          src: [
            '<%= config.dist %>/*',
            '<%= config.tmp %>/*'
          ]
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
    }
  });

  grunt.registerTask('check', [
    'jshint'
  ]);
};