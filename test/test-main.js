var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/Spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

requirejs.config({
  // Karma serves files from '/base'
  baseUrl: '/base/src',

  paths: {
    'log4javascript': '../dist/log4javascript',
    'params': '../src/log4js.params',
    'core': '../src/log4js.core',
    'level': '../src/log4js.level',
    'logger': '../src/log4js.logger',
    'eventSupport': '../src/log4js.eventSupport',
    'appender': '../src/log4js.appender',
    'layout': '../src/log4js.layout',
    'layout.pattern': '../src/log4js.layout.pattern',
    'lodash': '../test/vendor/lodash/dist/lodash.min'
  },

  shim: {
    'layout': ['params'],
    'logger': ['params', 'level'],
    'appender': ['params', 'level', 'logger', 'eventSupport', 'layout.pattern'],
    'layout.pattern': ['layout']

  },

  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: window.__karma__.start
});