define([
  'log4js.helper',
  'log4js.level',
  'log4js.eventSupport',
  'log4js.logger'
], function (helper, Level, EventSupport, Logger) {
  'use strict';

  var loggers = {};
  var loggerNames = [];
  var defaultLogger = null;
  var rootLogger = null;

  /**
   * Create main Log4js object; this will be assigned public properties
   * @property {String} version
   * @property {String} edition
   * @constructor
   */
  function Log4js() {
    this.version = '0.0.2';
    this.enabled = true;
    this.showStackTraces = false;
    this.setRootLogger();
    this.applicationStartDate = new Date();
  }

  /**
   *
   * @type {EventSupport}
   */
  Log4js.prototype = new EventSupport();

  /**
   *
   */
  Log4js.prototype.setRootLogger = function(){
    rootLogger = new Logger(helper.rootLoggerName, this);
    rootLogger.setLevel(Level.ROOT_LOGGER_DEFAULT_LEVEL);
  };

  /**
   *
   * @param {Boolean} enable
   */
  Log4js.prototype.setEnabled = function (enable) {
    if (helper.isBoolean(enable)) {
      this.enabled = enable;
    } else {
      helper.handleError('Log4js [' + this + ']: setEnabled: enable must be a boolean');
    }
  };

  /**
   *
   * @returns {Boolean}
   */
  Log4js.prototype.isEnabled = function () {
    return this.enabled;
  };

  Log4js.prototype.useTimeStampsInMilliseconds = true;

  /**
   *
   * @param {Boolean} timeStampsInMilliseconds
   */
  Log4js.prototype.setTimeStampsInMilliseconds = function (timeStampsInMilliseconds) {
    if (helper.isBoolean(timeStampsInMilliseconds)) {
      this.useTimeStampsInMilliseconds = timeStampsInMilliseconds;
    } else {
      helper.handleError('Log4js [' + this + ']: setTimeStampsInMilliseconds: timeStampsInMilliseconds must be a boolean');
    }
  };

  /**
   *
   * @returns {Boolean}
   */
  Log4js.prototype.isTimeStampsInMilliseconds = function () {
    return this.useTimeStampsInMilliseconds;
  };

  /**
   * This evaluates the given expression in the current scope, thus allowing
   * scripts to access private variables. Particularly useful for testing
   * @param expr
   * @returns {Object}
   */
  Log4js.prototype.evalInScope = function (expr) {
    /* jshint evil:true */
    return eval(expr);
  };

  /**
   *
   * @param {Boolean} show
   */
  Log4js.prototype.setShowStackTraces = function (show) {
    if (helper.isBoolean(show)) {
      this.showStackTraces = show;
    } else {
      helper.handleError('Log4js [' + this + ']: setShowStackTraces: show must be a boolean');
    }
  };

  /**
   *
   * @returns {Logger}
   */
  Log4js.prototype.getRootLogger = function () {
    return rootLogger;
  };

  /**
   *
   * @param {String} loggerName
   * @returns {Logger}
   */
  Log4js.prototype.getLogger = function (loggerName) {
    // Use default logger if loggerName is not specified or invalid
    if (!helper.isString(loggerName)) {
      helper.handleError(
          'Log4js [' + this + ']: getLogger: non-string logger name ' +
          loggerName +
          ' supplied, returning anonymous logger'
      );
      loggerName = helper.anonymousLoggerName;
    }

    // Do not allow retrieval of the root logger by name
    if (loggerName === helper.rootLoggerName) {
      helper.handleError('Log4js [' + this + ']: getLogger: root logger may not be obtained by name');
    }

    // Create the logger for this name if it doesn't already exist
    if (!loggers[loggerName]) {
      var logger = new Logger(loggerName, this);
      loggers[loggerName] = logger;
      loggerNames.push(loggerName);

      // Set up parent logger, if it doesn't exist
      var lastDotIndex = loggerName.lastIndexOf('.');
      var parentLogger;
      if (lastDotIndex > -1) {
        var parentLoggerName = loggerName.substring(0, lastDotIndex);
        parentLogger = this.getLogger(parentLoggerName); // Recursively sets up grandparents etc.
      } else {
        parentLogger = rootLogger;
      }
      parentLogger.addChild(logger);
    }
    return loggers[loggerName];
  };

  /**
   *
   * @returns {Logger}
   */
  Log4js.prototype.getDefaultLogger = function () {
    if (!defaultLogger) {
      defaultLogger = this.getLogger(helper.defaultLoggerName);
      var appender = new Log4js.PopUpAppender(); //TODO
      defaultLogger.addAppender(appender);
    }
    return defaultLogger;
  };

  var nullLogger = null;

  /**
   *
   * @returns {Logger}
   */
  Log4js.prototype.getNullLogger = function () {
    if (!nullLogger) {
      nullLogger = new Logger(helper.nullLoggerName, this);
      nullLogger.setLevel(Level.OFF);
    }
    return nullLogger;
  };

  /**
   * Destroys all loggers
   */
  Log4js.prototype.resetConfiguration = function () {
    rootLogger.setLevel(Level.ROOT_LOGGER_DEFAULT_LEVEL);
    loggers = {};
  };

  /**
   *
   * @type {Level}
   */
  Log4js.prototype.Level = Level;

  /**
   *
   * @type {LoggingEvent}
   */
  Log4js.prototype.LoggingEvent = Logger.LoggingEvent;

  return new Log4js();
});