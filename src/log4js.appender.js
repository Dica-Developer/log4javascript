define([
  'log4js.helper',
  'log4js.core',
  'log4js.eventSupport',
  'log4js.layout',
  'log4js.layout.pattern'
], function (helper, log4js, EventSupport) {
  'use strict';

  /**
   *
   * @constructor
   * @mixin
   */
  var Appender = function () {
  };

  /**
   *
   * @type {EventSupport}
   */
  Appender.prototype = new EventSupport();

  /**
   *
   * @type {PatternLayout}
   */
  Appender.prototype.layout = new log4js.PatternLayout();

  /**
   *
   * @type {Level}
   */
  Appender.prototype.threshold = log4js.Level.ALL;

  /**
   *
   * @type {Array}
   */
  Appender.prototype.loggers = [];

  /**
   * Performs threshold checks before delegating actual logging to the
   * subclass's specific append method.
   * @param {LoggingEvent} loggingEvent
   */
  Appender.prototype.doAppend = function (loggingEvent) {
    if (log4js.enabled && loggingEvent.level.level >= this.threshold.level) {
      this.append(loggingEvent);
    }
  };

  /**
   *
   * @param {LoggingEvent} loggingEvent
   */
  /*jshint unused:false*/
  Appender.prototype.append = function (loggingEvent) {
  };

  /**
   *
   * @param {Layout} layout
   */
  Appender.prototype.setLayout = function (layout) {
    if (layout instanceof log4js.Layout) { //TODO
      this.layout = layout;
    } else {
      helper.handleError('Appender.setLayout: layout supplied to ' +
        this.toString() + ' is not a subclass of Layout');
    }
  };

  /**
   *
   * @returns {Layout}
   */
  Appender.prototype.getLayout = function () {
    return this.layout;
  };

  /**
   *
   * @param {Level} threshold
   */
  Appender.prototype.setThreshold = function (threshold) {
    if (threshold instanceof log4js.Level) {
      this.threshold = threshold;
    } else {
      helper.handleError('Appender.setThreshold: threshold supplied to ' +
        this.toString() + ' is not a subclass of Level');
    }
  };

  /**
   *
   * @returns {Level}
   */
  Appender.prototype.getThreshold = function () {
    return this.threshold;
  };

  /**
   *
   * @param {Logger} logger
   */
  Appender.prototype.setAddedToLogger = function (logger) {
    this.loggers.push(logger);
  };

  /**
   *
   * @param {Logger} logger
   */
  Appender.prototype.setRemovedFromLogger = function (logger) {
    helper.arrayRemove(this.loggers, logger);
  };

  /**
   *
   * @type {emptyFunction}
   */
  Appender.prototype.group = function(){};

  /**
   *
   * @type {emptyFunction}
   */
  Appender.prototype.groupEnd = function(){};

  /**
   * @todo document document document
   */
  Appender.prototype.toString = function () {
    helper.handleError('Appender.toString: all appenders must override this method');
  };

  log4js.Appender = Appender;

});
