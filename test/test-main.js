var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/-spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

requirejs.config({
  // Karma serves files from '/base'
  baseUrl: '/base/src',

  paths: {
//    'log4javascript': '../dist/log4javascript',
//    'params': '../src/log4js.params',
    'simpleDateFormat': '../src/log4js.simpleDateFormat',
//    'formatObjectExpansion': '../src/log4js.formatObjectExpansion',
    'log4js': '../src/log4js.core',
    'helper': '../src/log4js.helper',
    'level': '../src/log4js.level',
    'logger': '../src/log4js.logger',
    'eventSupport': '../src/log4js.eventSupport',
    'appender': '../src/log4js.appender',
    'appender.alert': '../src/log4js.appender.alert',
    'layout': '../src/log4js.layout',
    'layout.pattern': '../src/log4js.layout.pattern',
    'layout.null': '../src/log4js.layout.null',
    'layout.simple': '../src/log4js.layout.simple',
    'layout.httpPostData': '../src/log4js.layout.httpPostData',
    'layout.json': '../src/log4js.layout.json',
    'layout.xml': '../src/log4js.layout.xml'
//    'lodash': '../test/vendor/lodash/dist/lodash.min'
  },
  map: {
    '*': {
      'log4js.core': 'log4js',
      'log4js.helper': 'helper',
      'log4js.level': 'level',
      'log4js.logger': 'logger',
      'log4js.eventSupport': 'eventSupport',
      'log4js.appender': 'appender',
      'log4js.appender.alert': 'log4js.appender.alert',
      'log4js.layout': 'layout',
      'log4js.layout.pattern': 'layout.pattern',
      'log4js.layout.null': 'layout.null',
      'log4js.layout.simple': 'layout.simple',
      'log4js.layout.httpPostData': 'layout.httpPostData',
      'log4js.layout.json': 'layout.json',
      'log4js.layout.xml': 'layout.xml',
      'log4js.simpleDateFormat': 'simpleDateFormat'
    }
  },

  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: window.__karma__.start
});