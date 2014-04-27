/*global require, requirejs*/
requirejs.config({
  baseUrl: '../dist/'
});
require(['log4js'], function(log4js){
  'use strict';

  var log = log4js.getLogger('testLogger');

  var consoleWithNull = new log4js.BrowserConsoleAppender();
  consoleWithNull.setThreshold(log4js.Level.TRACE);

  var consoleWithSimple = new log4js.BrowserConsoleAppender();
  consoleWithSimple.setThreshold(log4js.Level.TRACE);
  var logSimple = new log4js.SimpleLayout();
  consoleWithSimple.setLayout(logSimple);

  var consoleWithPattern = new log4js.BrowserConsoleAppender();
  consoleWithPattern.setThreshold(log4js.Level.TRACE);
  var logPattern = new log4js.PatternLayout('%r [%c] %l{r:l:c} %-5p %m');
  consoleWithPattern.setLayout(logPattern);

  var consoleWithJSON = new log4js.BrowserConsoleAppender();
  consoleWithJSON.setThreshold(log4js.Level.TRACE);
  var logJSON = new log4js.JsonLayout();
  consoleWithJSON.setLayout(logJSON);

  var consoleWithXML = new log4js.BrowserConsoleAppender();
  consoleWithXML.setThreshold(log4js.Level.TRACE);
  var logXML = new log4js.XmlLayout();
  consoleWithXML.setLayout(logXML);

  var consoleWithHttpPostData = new log4js.BrowserConsoleAppender();
  consoleWithHttpPostData.setThreshold(log4js.Level.TRACE);
  var logHttpPostData = new log4js.HttpPostDataLayout();
  consoleWithHttpPostData.setLayout(logHttpPostData);

//  var popupAppender = new log4js.PopUpAppender();
//  popupAppender.setThreshold(log4js.Level.TRACE);

//  var inlineAppender = new log4js.InlineAppender();
//  inlineAppender.setThreshold(log4js.Level.TRACE);

  var alertAppender = new log4js.AlertAppender();
  alertAppender.setThreshold(log4js.Level.TRACE);

  log.addAppender(consoleWithNull);
  log.addAppender(consoleWithSimple);
  log.addAppender(consoleWithPattern);
  log.addAppender(consoleWithJSON);
  log.addAppender(consoleWithXML);
  log.addAppender(consoleWithHttpPostData);
//  log.addAppender(popupAppender);
//  log.addAppender(inlineAppender);
  log.addAppender(alertAppender);
  log.setLevel(log4js.Level.ALL);
  log.trace('It work\'s', {'It': 'work\'s'}, ['It', 'work\'s']);
});
