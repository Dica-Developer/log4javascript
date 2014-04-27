/*global window*/
define(['log4js.helper', 'log4js.core', 'log4js.consoleAppenderHtml', 'log4js.appender', 'log4js.layout.pattern'], function (helper, log4js, consoleAppenderHtml) {
  'use strict';

  function LogCache(size) {
    this.size = size || 100;
    this.cache = [];
  }

  LogCache.prototype.setSize = function (newSize) {
    this.size = newSize;
  };

  LogCache.prototype.add = function (loggingEvent) {
    if (this.cache.length === this.size) {
      this.cache.shift();
    }

    this.cache.push(loggingEvent);
  };

  LogCache.prototype.getAtIndex = function (index) {
    return this.cache[index];
  };

  LogCache.prototype.getFirst = function () {
    return this.getAtIndex(0);
  };

  LogCache.prototype.getLast = function () {
    return this.getAtIndex(this.cache.length);
  };

  LogCache.prototype.get = function () {
    return this.cache;
  };

  LogCache.prototype.clear = function () {
    this.cache = [];
  };

  function ConsoleAppender(options) {
    options = options || {};
    this.options = {
      inPage: options.inPage || true,
      layout: options.layout || new log4js.PatternLayout('%d{HH:mm:ss} %-5p - %m{1}%n'),
      logCacheSize: options.logCacheSize || 100
    };
  }

  ConsoleAppender.prototype = new log4js.Appender();

  ConsoleAppender.prototype.create = function () {

    this.setLayout(this.options.layout);

    this.logCache = new LogCache(this.options.logCacheSize);
    this.mainContainer = window.document.createElement('div');
    this.logContainer = window.document.createElement('div');
    this.logDiv = window.document.createElement('div');

    this.prepareContainer();

    if (this.options.inPage) {
      this.addContainerToPage();
    } else {
      this.addContainerToPopup();
    }
  };

  ConsoleAppender.prototype.prepareContainer = function () {
    this.mainContainer.style.position = 'fixed';
    this.mainContainer.style.left = '0';
    this.mainContainer.style.right = '0';
    this.mainContainer.style.bottom = '0';
//    this.mainContainer.style.display = 'none';

    this.logContainer.style.width = '100%';
    this.logContainer.style.height = '200px';
    this.logContainer.style.border = 'solid gray 1px';
    this.logContainer.style.borderWidth = '1px 0 0 0';
    this.logContainer.innerHTML = consoleAppenderHtml;
  };

  ConsoleAppender.prototype.addContainerToPage = function () {
    window.document.body.appendChild(this.mainContainer);
    this.logContainer.appendChild(this.logDiv);
    this.mainContainer.appendChild(this.logContainer);
  };

  ConsoleAppender.prototype.addContainerToPopup = function () {
    window.document.body.appendChild(this.mainContainer);
    this.mainContainer.appendChild(this.logContainer);
  };

  ConsoleAppender.prototype.renderLogs = function () {
    var layout = this.layout;
    var logs = this.logCache.get();
    var logEntries = [];
    logs.forEach(function (loggingEvent) {
      logEntries.push('<div>' + layout.format(loggingEvent) + '</div>');
    });
    this.logDiv.innerHTML = logEntries.join('');
  };

  ConsoleAppender.prototype.doAppend = function (loggingEvent) {
    this.logCache.add(loggingEvent);
    this.renderLogs();
  };

  ConsoleAppender.prototype.group = function () {

  };

  ConsoleAppender.prototype.groupEnd = function () {

  };

  ConsoleAppender.prototype.toString = function () {
    return 'ConsoleAppender';
  };

  log4js.ConsoleAppender = ConsoleAppender;

});
