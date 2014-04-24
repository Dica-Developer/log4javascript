/*global require, requirejs*/
requirejs.config({
  baseUrl: '../../src/'
});
require(['log4js.core', 'log4js.appender.browserConsole'], function(log4js){
  'use strict';

  var log = log4js.getLogger('testLogger');

  var consoleWithPattern = new log4js.BrowserConsoleAppender();
  consoleWithPattern.setThreshold(log4js.Level.TRACE);
  var logPattern = new log4js.PatternLayout('%r [%c] %l{r:l:c} %-5p %m');
  consoleWithPattern.setLayout(logPattern);

  log.addAppender(consoleWithPattern);
  log.setLevel(log4js.Level.ALL);
  log.trace('Trace Level', {'Trace': 'Level'}, ['Trace', 'Level'], new Error('Trace Level'));
  log.info('Info Level', {'Info': 'Level'}, ['Info', 'Level'], new Error('Info Level'));
  log.debug('Debug Level', {'Debug': 'Level'}, ['Debug', 'Level'], new Error('Debug Level'));
  log.warn('Warn Level', {'Warn': 'Level'}, ['Warn', 'Level'], new Error('Warn Level'));
  log.error('Error Level', {'Error': 'Level'}, ['Error', 'Level'], new Error('Error Level'));
  log.fatal('Fatal Level', {'Fatal': 'Level'}, ['Fatal', 'Level'], new Error('Fatal Level'));
});
