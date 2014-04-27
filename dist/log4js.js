(function() {
 
/*global window*/
define('log4js.helper',[],function () {
  

  /**
   *
   * @constructor
   */
  var Helper = function () {
  };

  Helper.prototype = {
    getUUID: function getUUID(){
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    },
    isUndefined: function isUndefined(obj) {
      return obj === void 0;
    },
    isNotUndefined: function isNotUndefined(obj) {
      return !this.isUndefined(obj);
    },
    isFunction: function isFunction(fn) {
      return typeof fn === 'function';
    },
    isBoolean: function isBoolean(bool){
      return typeof bool === 'boolean';
    },
    toBoolean: function isBoolean(bool){
      return Boolean(bool);
    },
    isString: function isString(str) {
      return typeof str === 'string';
    },
    toString: function toString(obj) {
      return (obj && obj.toString) ? obj.toString() : String(obj);
    },
    isArray: function isArray(array) {
      return array instanceof Array;
    },
    arrayContains: function arrayContains(arr, val) {
      var found = false;
      for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === val) {
          found = true;
          break;
        }
      }
      return found;
    },
    arrayRemove: function arrayRemove(arr, val) {
      var removed = false;
      for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === val) {
          arr.splice(i, 1);
          removed = true;
          break;

        }
      }
      return removed;
    },
    trim: function trim(str) {
      return str.replace(/^\s+/, '').replace(/\s+$/, '');
    },
    splitIntoLines: function splitIntoLines(text) {
      // Ensure all line breaks are \n only
      var text2 = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      return text2.split('\n');
    },
    getExceptionMessage: function getExceptionMessage(ex) {
      var message = '';
      if (ex.message) {
        message = ex.message;
      } else if (ex.description) {
        message = ex.description;
      } else {
        message = this.toString(ex);
      }
      return message;
    },
    getUrlFileName: function getUrlFileName(url) {
      var lastSlashIndex = Math.max(url.lastIndexOf('/'), url.lastIndexOf('\\'));
      return url.substr(lastSlashIndex + 1);
    },
    handleError: function handleError(message){
      window.alert(message);
    },
    extractStringFromParam: function(param, defaultValue){
      return this.isUndefined(param) ? defaultValue : String(param);
    },
    extractBooleanFromParam: function extractBooleanFromParam(param, defaultValue) {
      return this.isUndefined(param) ? defaultValue : this.toBoolean(param);
    },
    getExceptionStringRep: function(ex){
      if (ex) {
        var exStr = 'Exception: ' + this.getExceptionMessage(ex);
        if (ex.lineNumber) {
          exStr += ' on line number ' + ex.lineNumber;
        }
        if (ex.fileName) {
          exStr += ' in file ' + this.getUrlFileName(ex.fileName);
        }
//        if (showStackTraces && ex.stack) {
//          exStr += this.newLine + 'Stack trace:' + this.newLine + ex.stack;
//        }
        return exStr;
      }
      return null;
    },
    anonymousLoggerName: '[anonymous]',
    defaultLoggerName: '[default]',
    nullLoggerName: '[null]',
    rootLoggerName: 'root',
    newLine: '\r\n'
  };
  return new Helper();
});
define('log4js.level',[],function(){
  

  /**
   * Levels
   * @param {Number} level
   * @param {String} name
   * @property {Number} level
   * @property {String} name
   * @constructor
   */
  function Level(level, name) {
    this.level = level;
    this.name = name;
  }

  /**
   *
   * @returns {String}
   */
  Level.prototype.toString = function () {
    return this.name;
  };

  /**
   *
   * @param {Number} level
   * @returns {Boolean}
   */
  Level.prototype.equals = function (level) {
    return this.level === level.level;
  };

  /**
   *
   * @param {Number} level
   * @returns {Boolean}
   */
  Level.prototype.isGreaterOrEqual = function (level) {
    return this.level >= level.level;
  };

  /**
   *
   * @type {Level}
   */
  Level.ALL = new Level(Number.MIN_VALUE, 'ALL');
  /**
   *
   * @type {Level}
   */
  Level.TRACE = new Level(10000, 'TRACE');
  /**
   *
   * @type {Level}
   */
  Level.DEBUG = new Level(20000, 'DEBUG');
  /**
   *
   * @type {Level}
   */
  Level.INFO = new Level(30000, 'INFO');
  /**
   *
   * @type {Level}
   */
  Level.WARN = new Level(40000, 'WARN');
  /**
   *
   * @type {Level}
   */
  Level.ERROR = new Level(50000, 'ERROR');
  /**
   *
   * @type {Level}
   */
  Level.FATAL = new Level(60000, 'FATAL');
  /**
   *
   * @type {Level}
   */
  Level.OFF = new Level(Number.MAX_VALUE, 'OFF');

  /**
   *
   * @type {Level}
   */
  Level.ROOT_LOGGER_DEFAULT_LEVEL = Level.DEBUG;

  return Level;
});
define('log4js.eventSupport',['log4js.helper'], function(helper){
  

  /**
   * Custom event support
   * @constructor
   */
  function EventSupport() {
    this.eventTypes = [];
    this.eventListeners = {};
  }

  /**
   *
   * @param {Array} eventTypesParam
   */
  EventSupport.prototype.setEventTypes = function (eventTypesParam) {
    if (helper.isArray(eventTypesParam)) {
      this.eventTypes = eventTypesParam;
      this.eventListeners = {};
      for (var i = 0, len = this.eventTypes.length; i < len; i++) {
        this.eventListeners[this.eventTypes[i]] = [];
      }
    } else {
      helper.handleError('EventSupport [' + this + ']: setEventTypes: eventTypes parameter must be an Array');
    }
  };

  /**
   *
   * @param {String} eventType
   * @param {Function} listener
   */
  EventSupport.prototype.addEventListener = function (eventType, listener) {
    if (helper.isFunction(listener)) {
      if (!helper.arrayContains(this.eventTypes, eventType)) {
        helper.handleError('EventSupport [' + this + ']: addEventListener: no event called "' + eventType + '"');
      } else {
        this.eventListeners[eventType].push(listener);
      }
    } else {
      helper.handleError('EventSupport [' + this + ']: addEventListener: listener must be a function');
    }
  };

  /**
   *
   * @param {String} eventType
   * @param {Function} listener
   */
  EventSupport.prototype.removeEventListener = function (eventType, listener) {
    if (helper.isFunction(listener)) {
      if (!helper.arrayContains(this.eventTypes, eventType)) {
        helper.handleError('EventSupport [' + this + ']: removeEventListener: no event called "' + eventType + '"');
      } else {
        helper.arrayRemove(this.eventListeners[eventType], listener);
      }
    } else {
      helper.handleError('EventSupport [' + this + ']: removeEventListener: listener must be a function');
    }
  };

  /**
   *
   * @param {String} eventType
   * @param {Array} eventArgs
   */
  EventSupport.prototype.dispatchEvent = function (eventType, eventArgs) {
    if (helper.arrayContains(this.eventTypes, eventType)) {
      var listeners = this.eventListeners[eventType];
      for (var i = 0, len = listeners.length; i < len; i++) {
        listeners[i].call(this, eventType, eventArgs);
      }
    } else {
      helper.handleError('EventSupport [' + this + ']: dispatchEvent: no event called "' + eventType + '"');
    }
  };

  return EventSupport;
});
define('log4js.logger',['log4js.helper', 'log4js.level'], function (helper, Level) {
  

  /**
   *
   * @param {String} name
   * @param {Level} level
   * @property {String} name
   * @property {Level} [level]
   * @property {Date} start
   * @constructor
   */
  function Timer(name, level) {
    this.name = name;
    this.level = helper.isUndefined(level) ? Level.INFO : level;
    this.start = new Date();
  }

  /**
   *
   * @returns {Number}
   */
  Timer.prototype.getElapsedTime = function () {
    return new Date().getTime() - this.start.getTime();
  };

  /**
   *
   * @param {Logger} logger
   * @param {Date} timeStamp
   * @param {Level} level
   * @param {Array} messages
   * @param {Error} exception
   * @property {Logger} logger
   * @property {Date} timeStamp
   * @property {Number} timeStampInMilliseconds
   * @property {Number} timeStampInSeconds
   * @property {Number} milliseconds
   * @property {Level} level
   * @property {Array} messages
   * @property {Error} exception
   * @constructor
   */
  var LoggingEvent = function (logger, timeStamp, level, messages, exception) {
    this.logger = logger;
    this.timeStamp = timeStamp;
    this.timeStampInMilliseconds = timeStamp.getTime();
    this.timeStampInSeconds = Math.floor(this.timeStampInMilliseconds / 1000);
    this.milliseconds = this.timeStamp.getMilliseconds();
    this.level = level;
    this.messages = messages;
    this.exception = exception;
  };

  /**
   *
   * @returns {String}
   */
  LoggingEvent.prototype.getThrowableStrRep = function () {
    return this.exception ? helper.getExceptionStringRep(this.exception) : ''; //TODO
  };

  /**
   *
   * @returns {String}
   */
  LoggingEvent.prototype.getCombinedMessages = function () {
    return (this.messages.length === 1) ? this.messages[0] :
      this.messages.join(helper.newLine);
  };

  /**
   *
   * @returns {String}
   */
  LoggingEvent.prototype.toString = function () {
    return 'LoggingEvent[' + this.level + ']';
  };

  /**
   *
   * @param {String} [name]
   * @property {String} name
   * @property {} parent
   * @property {Array} children
   * @constructor
   */
  function Logger(name, log4js) {
    this.name = name;
    this.parent = null;
    this.children = [];

    var appenders = [];
    var loggerLevel = null;
    var isRoot = (this.name === helper.rootLoggerName);
    var isNull = (this.name === helper.nullLoggerName);

    var appenderCache = null;
    var appenderCacheInvalidated = false;

    /**
     *
     * @param {Logger} childLogger
     */
    this.addChild = function (childLogger) {
      this.children.push(childLogger);
      childLogger.parent = this;
      childLogger.invalidateAppenderCache();
    };

    // Additivity
    var additive = true;
    /**
     *
     * @returns {boolean}
     */
    this.getAdditivity = function () {
      return additive;
    };

    /**
     *
     * @param additivity
     */
    this.setAdditivity = function (additivity) {
      var valueChanged = (additive !== additivity);
      additive = additivity;
      if (valueChanged) {
        this.invalidateAppenderCache();
      }
    };

    /**
     * Create methods that use the appenders variable in this scope
     * @param appender
     */
    this.addAppender = function (appender) {
      if (isNull) {
        helper.handleError('Logger.addAppender: you may not add an appender to the null logger');
      } else {
        if (appender instanceof log4js.Appender) {
          if (!helper.arrayContains(appenders, appender)) {
            appenders.push(appender);
            appender.setAddedToLogger(this);
            this.invalidateAppenderCache();
          }
        } else {
          helper.handleError('Logger.addAppender: appender supplied ("' + helper.toString(appender) + '") is not a subclass of Appender');
        }
      }
    };

    /**
     *
     * @param appender
     */
    this.removeAppender = function (appender) {
      helper.arrayRemove(appenders, appender);
      appender.setRemovedFromLogger(this);
      this.invalidateAppenderCache();
    };

    /**
     * Deletes all registred Appenders
     */
    this.removeAllAppenders = function () {
      var appenderCount = appenders.length;
      if (appenderCount > 0) {
        for (var i = 0; i < appenderCount; i++) {
          appenders[i].setRemovedFromLogger(this);
        }
        appenders.length = 0;
        this.invalidateAppenderCache();
      }
    };

    /**
     *
     * @returns {*}
     */
    this.getEffectiveAppenders = function () {
      if (appenderCache === null || appenderCacheInvalidated) {
        // Build appender cache
        var parentEffectiveAppenders = (isRoot || !this.getAdditivity()) ?
          [] : this.parent.getEffectiveAppenders();
        appenderCache = parentEffectiveAppenders.concat(appenders);
        appenderCacheInvalidated = false;
      }
      return appenderCache;
    };

    /**
     * @todo document
     */
    this.invalidateAppenderCache = function () {
      appenderCacheInvalidated = true;
      for (var i = 0, len = this.children.length; i < len; i++) {
        this.children[i].invalidateAppenderCache();
      }
    };

    /**
     *
     * @param {Level} level
     * @param {Object} params
     */
    this.log = function (level, params) {
      if (log4js.isEnabled() && level.isGreaterOrEqual(this.getEffectiveLevel())) {
        // Check whether last param is an exception
        var exception;
        var finalParamIndex = params.length - 1;
        var lastParam = params[finalParamIndex];
        if (params.length > 1 && lastParam instanceof Error) {
          exception = lastParam;
          finalParamIndex--;
        }

        // Construct genuine array for the params
        var messages = [];
        for (var i = 0; i <= finalParamIndex; i++) {
          messages[i] = params[i];
        }

        var loggingEvent = new LoggingEvent(
          this, new Date(), level, messages, exception);

        this.callAppenders(loggingEvent);
      }
    };

    /**
     *
     * @param loggingEvent
     */
    this.callAppenders = function (loggingEvent) {
      var effectiveAppenders = this.getEffectiveAppenders();
      for (var i = 0, len = effectiveAppenders.length; i < len; i++) {
        effectiveAppenders[i].doAppend(loggingEvent);
      }
    };

    /**
     *
     * @param {Level} level
     */
    this.setLevel = function (level) {
      // Having a level of null on the root logger would be very bad.
      if (isRoot && level === null) {
        helper.handleError('Logger.setLevel: you cannot set the level of the root logger to null');
      } else if (level instanceof Level) {
        loggerLevel = level;
      } else {
        helper.handleError('Logger.setLevel: level supplied to logger ' + this.name + ' is not an instance of log4js.Level');
      }
    };

    /**
     *
     * @returns {Level}
     */
    this.getLevel = function () {
      return loggerLevel;
    };

    /**
     *
     * @returns {Level}
     */
    this.getEffectiveLevel = function () {
      var level;
      for (var logger = this; logger !== null; logger = logger.parent) {
        level = logger.getLevel();
        if (level !== null) {
          break;
        }
      }
      return level;
    };

    /**
     *
     * @param {String} name
     * @param {Boolean} initiallyExpanded
     */
    this.group = function (name, initiallyExpanded) {
      if (log4js.isEnabled()) {
        var effectiveAppenders = this.getEffectiveAppenders();
        for (var i = 0, len = effectiveAppenders.length; i < len; i++) {
          effectiveAppenders[i].group(name, initiallyExpanded);
        }
      }
    };

    /**
     * @todo document
     */
    this.groupEnd = function () {
      if (log4js.isEnabled()) {
        var effectiveAppenders = this.getEffectiveAppenders();
        for (var i = 0, len = effectiveAppenders.length; i < len; i++) {
          effectiveAppenders[i].groupEnd();
        }
      }
    };

    var timers = {};

    /**
     *
     * @param {String} name
     * @param {Level} level
     */
    this.time = function (name, level) {
      if (log4js.isEnabled()) {
        if (helper.isUndefined(name)) {
          helper.handleError('Logger.time: a name for the timer must be supplied');
        } else if (level && !(level instanceof Level)) {
          helper.handleError('Logger.time: level supplied to timer ' + name + ' is not an instance of log4javascript.Level');
        } else {
          timers[name] = new Timer(name, level);
        }
      }
    };

    /**
     *
     * @param {String} name
     */
    this.timeEnd = function (name) {
      if (log4js.isEnabled()) {
        if (helper.isUndefined(name)) {
          helper.handleError('Logger.timeEnd: a name for the timer must be supplied');
        } else if (timers[name]) {
          var timer = timers[name];
          var milliseconds = timer.getElapsedTime();
          this.log(timer.level, ['Timer ' + helper.toString(name) + ' completed in ' + milliseconds + 'ms']);
          delete timers[name];
        } else {
          helper.handleError('Logger.timeEnd: no timer found with name ' + name);
        }
      }
    };

    /**
     *
     * @param expr
     */
    this.assert = function (expr) {
      if (log4js.isEnabled() && !expr) {
        var args = [];
        for (var i = 1, len = arguments.length; i < len; i++) {
          args.push(arguments[i]);
        }
        args = (args.length > 0) ? args : ['Assertion Failure'];
        args.push(helper.newLine);
        args.push(expr);
        this.log(Level.ERROR, args);
      }
    };

    /**
     *
     * @returns {String}
     */
    this.toString = function () {
      return 'Logger[' + this.name + ']';
    };
  }

  /**
   * @todo document
   */
  Logger.prototype.trace = function () {
    this.log(Level.TRACE, arguments);
  };

  /**
   * @todo document
   */
  Logger.prototype.debug = function () {
    this.log(Level.DEBUG, arguments);
  };

  /**
   * @todo document
   */
  Logger.prototype.info = function () {
    this.log(Level.INFO, arguments);
  };

  /**
   * @todo document
   */
  Logger.prototype.warn = function () {
    this.log(Level.WARN, arguments);
  };

  /**
   * @todo document
   */
  Logger.prototype.error = function () {
    this.log(Level.ERROR, arguments);
  };

  /**
   * @todo document
   */
  Logger.prototype.fatal = function () {
    this.log(Level.FATAL, arguments);
  };

  /**
   *
   * @param {Level} level
   * @returns {Boolean}
   */
  Logger.prototype.isEnabledFor = function (level) {
    return level.isGreaterOrEqual(this.getEffectiveLevel());
  };

  /**
   *
   * @returns {Boolean}
   */
  Logger.prototype.isTraceEnabled = function () {
    return this.isEnabledFor(Level.TRACE);
  };

  /**
   *
   * @returns {Boolean}
   */
  Logger.prototype.isDebugEnabled = function () {
    return this.isEnabledFor(Level.DEBUG);
  };

  /**
   *
   * @returns {Boolean}
   */
  Logger.prototype.isInfoEnabled = function () {
    return this.isEnabledFor(Level.INFO);
  };

  /**
   *
   * @returns {Boolean}
   */
  Logger.prototype.isWarnEnabled = function () {
    return this.isEnabledFor(Level.WARN);
  };

  /**
   *
   * @returns {Boolean}
   */
  Logger.prototype.isErrorEnabled = function () {
    return this.isEnabledFor(Level.ERROR);
  };

  /**
   *
   * @returns {Boolean}
   */
  Logger.prototype.isFatalEnabled = function () {
    return this.isEnabledFor(Level.FATAL);
  };

  /**
   *
   * @type {boolean}
   */
  Logger.prototype.trace.isEntryPoint = true;
  /**
   *
   * @type {boolean}
   */
  Logger.prototype.debug.isEntryPoint = true;
  /**
   *
   * @type {boolean}
   */
  Logger.prototype.info.isEntryPoint = true;
  /**
   *
   * @type {boolean}
   */
  Logger.prototype.warn.isEntryPoint = true;
  /**
   *
   * @type {boolean}
   */
  Logger.prototype.error.isEntryPoint = true;
  /**
   *
   * @type {boolean}
   */
  Logger.prototype.fatal.isEntryPoint = true;

  /**
   *
   * @type {LoggingEvent}
   */
  Logger.LoggingEvent = LoggingEvent;

  return Logger;
});
define('log4js.core',[
  'log4js.helper',
  'log4js.level',
  'log4js.eventSupport',
  'log4js.logger'
], function (helper, Level, EventSupport, Logger) {
  

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
    this.applicationStartDate = new Date();
    this.setRootLogger();
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
    this.enabled = helper.toBoolean(enable);
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
    this.useTimeStampsInMilliseconds = helper.toBoolean(timeStampsInMilliseconds);
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
    this.showStackTraces = helper.toBoolean(show);
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
          'Log4js [' + this.toString() + ']: getLogger: non-string logger name ' +
          loggerName +
          ' supplied, returning anonymous logger'
      );
      loggerName = helper.anonymousLoggerName;
    }

    // Do not allow retrieval of the root logger by name
    if (loggerName === helper.rootLoggerName) {
      helper.handleError('Log4js [' + this.toString() + ']: getLogger: root logger may not be obtained by name');
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

  Log4js.prototype.toString = function () {
    return 'log4js.core';
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
/*global window*/
define('log4js.layout',['log4js.helper', 'log4js.core'], function (helper, log4js) {
  

  /**
   * Layout
   * @constructor
   * @mixin
   */
  function Layout() {
  }

  /**
   *
   * @type {{loggerKey: string, timeStampKey: string, millisecondsKey: string, levelKey: string, messageKey: string, exceptionKey: string, urlKey: string}}
   */
  Layout.prototype.defaults = {
    loggerKey: 'logger',
    timeStampKey: 'timestamp',
    millisecondsKey: 'milliseconds',
    levelKey: 'level',
    messageKey: 'message',
    exceptionKey: 'exception',
    urlKey: 'url'
  };

  /**
   *
   * @type {string}
   */
  Layout.prototype.loggerKey = 'logger';

  /**
   *
   * @type {string}
   */
  Layout.prototype.timeStampKey = 'timestamp';

  /**
   *
   * @type {string}
   */
  Layout.prototype.millisecondsKey = 'milliseconds';

  /**
   *
   * @type {string}
   */
  Layout.prototype.levelKey = 'level';

  /**
   *
   * @type {string}
   */
  Layout.prototype.messageKey = 'message';

  /**
   *
   * @type {string}
   */
  Layout.prototype.exceptionKey = 'exception';

  /**
   *
   * @type {string}
   */
  Layout.prototype.urlKey = 'url';

  /**
   *
   * @type {string}
   */
  Layout.prototype.batchHeader = '';

  /**
   *
   * @type {string}
   */
  Layout.prototype.batchFooter = '';

  /**
   *
   * @type {string}
   */
  Layout.prototype.batchSeparator = '';

  /**
   *
   * @type {boolean}
   */
  Layout.prototype.returnsPostData = false;

  /**
   *
   * @type {boolean}
   */
  Layout.prototype.overrideTimeStampsSetting = false;

  /**
   *
   * @type {null}
   */
  Layout.prototype.useTimeStampsInMilliseconds = null;

  /**
   *
   * @type {Array}
   */
  Layout.prototype.customFields = [];

  /**
   * @todo document
   */
  Layout.prototype.format = function () {
    helper.handleError('Layout.format: layout supplied has no format() method');
  };

  /**
   * @todo document
   */
  Layout.prototype.ignoresThrowable = function () {
    helper.handleError('Layout.ignoresThrowable = layout supplied has no ignoresThrowable() method');
  };

  /**
   *
   * @returns {String}
   */
  Layout.prototype.getContentType = function () {
    return 'text/plain';
  };

  /**
   *
   * @returns {Boolean}
   */
  Layout.prototype.allowBatching = function () {
    return true;
  };

  /**
   *
   * @param {Boolean} timeStampsInMilliseconds
   */
  Layout.prototype.setTimeStampsInMilliseconds = function (timeStampsInMilliseconds) {
    this.overrideTimeStampsSetting = true;
    this.useTimeStampsInMilliseconds = helper.toBoolean(timeStampsInMilliseconds);
  };

  /**
   *
   * @returns {null|Layout.useTimeStampsInMilliseconds|*}
   */
  Layout.prototype.isTimeStampsInMilliseconds = function () {
    return this.overrideTimeStampsSetting ?
      this.useTimeStampsInMilliseconds : this.useTimeStampsInMilliseconds;
  };

  /**
   *
   * @param loggingEvent
   * @returns {Number|LoggingEvent.timeStampInMilliseconds|*}
   */
  Layout.prototype.getTimeStampValue = function (loggingEvent) {
    return this.isTimeStampsInMilliseconds() ?
      loggingEvent.timeStampInMilliseconds : loggingEvent.timeStampInSeconds;
  };

  /**
   *
   * @param loggingEvent
   * @param combineMessages
   * @returns {*}
   */
  Layout.prototype.getDataValues = function (loggingEvent, combineMessages) {
    var dataValues = [
      [this.loggerKey, loggingEvent.logger.name],
      [this.timeStampKey, this.getTimeStampValue(loggingEvent)],
      [this.levelKey, loggingEvent.level.name],
      [this.urlKey, window.location.href],
      [this.messageKey, combineMessages ? loggingEvent.getCombinedMessages() : loggingEvent.messages]
    ];
    if (!this.isTimeStampsInMilliseconds()) {
      dataValues.push([this.millisecondsKey, loggingEvent.milliseconds]);
    }
    if (loggingEvent.exception) {
      dataValues.push([this.exceptionKey, helper.getExceptionStringRep(loggingEvent.exception)]);
    }
    if (this.hasCustomFields()) {
      for (var i = 0, len = this.customFields.length; i < len; i++) {
        var val = this.customFields[i].value;

        // Check if the value is a function. If so, execute it, passing it the
        // current layout and the logging event
        if (typeof val === 'function') {
          val = val(this, loggingEvent);
        }
        dataValues.push([this.customFields[i].name, val]);
      }
    }
    return dataValues;
  };

  /**
   *
   * @param loggerKey
   * @param timeStampKey
   * @param levelKey
   * @param messageKey
   * @param exceptionKey
   * @param urlKey
   * @param millisecondsKey
   */
  Layout.prototype.setKeys = function (loggerKey, timeStampKey, levelKey, messageKey, exceptionKey, urlKey, millisecondsKey) {
    this.loggerKey = helper.extractStringFromParam(loggerKey, this.defaults.loggerKey);
    this.timeStampKey = helper.extractStringFromParam(timeStampKey, this.defaults.timeStampKey);
    this.levelKey = helper.extractStringFromParam(levelKey, this.defaults.levelKey);
    this.messageKey = helper.extractStringFromParam(messageKey, this.defaults.messageKey);
    this.exceptionKey = helper.extractStringFromParam(exceptionKey, this.defaults.exceptionKey);
    this.urlKey = helper.extractStringFromParam(urlKey, this.defaults.urlKey);
    this.millisecondsKey = helper.extractStringFromParam(millisecondsKey, this.defaults.millisecondsKey);
  };

  /**
   *
   * @param name
   * @param value
   */
  Layout.prototype.setCustomField = function (name, value) {
    if (helper.isUndefined(name) || helper.isUndefined(value)) {
      helper.handleError('layout.setCustomFields: name and value must be defined');
    } else if (!helper.isString(name)) {
      helper.handleError('layout.setCustomFields: name must be "String"');
    } else {
      var fieldUpdated = false;
      for (var i = 0, len = this.customFields.length; i < len; i++) {
        if (this.customFields[i].name === name) {
          this.customFields[i].value = value;
          fieldUpdated = true;
        }
      }
      if (!fieldUpdated) {
        this.customFields.push({'name': name, 'value': value});
      }
    }
  };

  /**
   *
   * @returns {Boolean}
   */
  Layout.prototype.hasCustomFields = function () {
    return (this.customFields.length > 0);
  };

  /**
   * @todo document
   */
  Layout.prototype.toString = function () {
    helper.handleError('Layout.toString: all layouts must override this method');
  };

  log4js.Layout = Layout;
});

define('log4js.layout.json',['log4js.helper', 'log4js.core', 'log4js.layout'], function (helper, log4js) {
  

  /**
   *
   * @param {String} str
   * @returns {*|XML|string|Node|void}
   */
  function escapeNewLines(str) {
    return str.replace(/\r\n|\r|\n/g, '\\r\\n');
  }

  /**
   * JsonLayout
   * @param readable
   * @param combineMessages
   * @constructor
   * @property {Boolean} readable
   * @property {Boolean} combineMessages
   * @property {undefined | String} batchHeader
   * @property {undefined | String} batchFooter
   * @property {undefined | String} batchSeparator
   * @property {String} colon
   * @property {String} tab
   * @property {String} newLine
   * @property {Array} customFields
   * @mixes Layout
   */
  function JsonLayout(readable, combineMessages) {
    this.readable = helper.extractBooleanFromParam(readable, false);
    this.combineMessages = helper.extractBooleanFromParam(combineMessages, true);
    this.batchHeader = this.readable ? '[' + helper.newLine : '[';
    this.batchFooter = this.readable ? ']' + helper.newLine : ']';
    this.batchSeparator = this.readable ? ',' + helper.newLine : ',';
    this.setKeys();
    this.colon = this.readable ? ': ' : ':';
    this.tab = this.readable ? '\t' : '';
    this.lineBreak = this.readable ? helper.newLine : '';
    this.customFields = [];
  }

  /**
   *
   * @type {Layout}
   */
  JsonLayout.prototype = new log4js.Layout();

  /**
   *
   * @returns {Boolean}
   */
  JsonLayout.prototype.isReadable = function () {
    return this.readable;
  };

  /**
   *
   * @returns {Boolean}
   */
  JsonLayout.prototype.isCombinedMessages = function () {
    return this.combineMessages;
  };

  /**
   *
   * @param loggingEvent
   * @returns {String}
   */
  JsonLayout.prototype.format = function (loggingEvent) {
    var layout = this;
    var dataValues = this.getDataValues(loggingEvent, this.combineMessages);
    var str = '{' + this.lineBreak;
    var i, len;

    function formatValue(val, prefix, expand) {
      // Check the type of the data value to decide whether quotation marks
      // or expansion are required
      var formattedValue;
      var valType = typeof val;
      if (val instanceof Date) {
        formattedValue = String(val.getTime());
      } else if (expand && (val instanceof Array)) {
        formattedValue = '[' + layout.lineBreak;
        for (var i = 0, len = val.length; i < len; i++) {
          var childPrefix = prefix + layout.tab;
          formattedValue += childPrefix + formatValue(val[i], childPrefix, false);
          if (i < val.length - 1) {
            formattedValue += ',';
          }
          formattedValue += layout.lineBreak;
        }
        formattedValue += prefix + ']';
      } else if (valType !== 'number' && valType !== 'boolean') {
        formattedValue = '"' + escapeNewLines(helper.toString(val).replace(/\'/g, '\\\"')) + '"';
      } else {
        formattedValue = val;
      }
      return formattedValue;
    }

    for (i = 0, len = dataValues.length - 1; i <= len; i++) {
      str += this.tab + '"' + dataValues[i][0] + '"' + this.colon + formatValue(dataValues[i][1], this.tab, true);
      if (i < len) {
        str += ',';
      }
      str += this.lineBreak;
    }

    str += '}' + this.lineBreak;
    return str;
  };

  /**
   *
   * @returns {Boolean}
   */
  JsonLayout.prototype.ignoresThrowable = function () {
    return false;
  };

  /**
   *
   * @returns {String}
   */
  JsonLayout.prototype.toString = function () {
    return 'JsonLayout';
  };

  /**
   *
   * @returns {String}
   */
  JsonLayout.prototype.getContentType = function () {
    return 'application/json';
  };

  log4js.JsonLayout = JsonLayout;
});

define('log4js.layout.httpPostData',['log4js.core', 'log4js.layout'], function (log4js) {
  

  /**
   * HttpPostDataLayout
   * @constructor
   * @mixes Layout
   */
  function HttpPostDataLayout() {
    this.setKeys();
    this.customFields = [];
    this.returnsPostData = true;
  }

  /**
   *
   * @type {Layout}
   */
  HttpPostDataLayout.prototype = new log4js.Layout();

  /**
   * Disable batching
   * @returns {Boolean}
   */
  HttpPostDataLayout.prototype.allowBatching = function () {
    return false;
  };

  /**
   *
   * @param loggingEvent
   * @returns {String}
   */
  HttpPostDataLayout.prototype.format = function (loggingEvent) {
    var dataValues = this.getDataValues(loggingEvent);
    var queryBits = [];
    for (var i = 0, len = dataValues.length; i < len; i++) {
      var val = (dataValues[i][1] instanceof Date) ?
        String(dataValues[i][1].getTime()) : dataValues[i][1];
      queryBits.push(encodeURIComponent(dataValues[i][0]) + '=' + encodeURIComponent(val));
    }
    return queryBits.join('&');
  };

  /**
   *
   * @returns {boolean}
   */
  HttpPostDataLayout.prototype.ignoresThrowable = function () {
    return false;
  };

  /**
   *
   * @returns {String}
   */
  HttpPostDataLayout.prototype.toString = function () {
    return 'HttpPostDataLayout';
  };

  log4js.HttpPostDataLayout = HttpPostDataLayout;
});

define('log4js.layout.null',['log4js.core', 'log4js.layout'], function (log4js) {
  

  /**
   * NullLayout
   * @constructor
   * @mixes Layout
   */
  function NullLayout() {
    this.customFields = [];
  }

  /**
   *
   * @type {Layout}
   */
  NullLayout.prototype = new log4js.Layout();

  /**
   *
   * @param loggingEvent
   * @returns {Array}
   */
  NullLayout.prototype.format = function (loggingEvent) {
    return loggingEvent.messages;
  };

  /**
   *
   * @returns {Boolean}
   */
  NullLayout.prototype.ignoresThrowable = function () {
    return true;
  };

  /**
   *
   * @returns {String}
   */
  NullLayout.prototype.toString = function () {
    return 'NullLayout';
  };

  log4js.NullLayout = NullLayout;
});

define('log4js.simpleDateFormat',['log4js.helper', 'log4js.core'], function (helper, log4js) {
  

  var SimpleDateFormat;

  var regex = /('[^']*')|(G+|y+|M+|w+|W+|D+|d+|F+|E+|a+|H+|k+|K+|h+|m+|s+|S+|Z+)|([a-zA-Z]+)|([^a-zA-Z']+)/;
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var TEXT2 = 0, TEXT3 = 1, NUMBER = 2, YEAR = 3, MONTH = 4, TIMEZONE = 5;
  var types = {
    G: TEXT2,
    y: YEAR,
    M: MONTH,
    w: NUMBER,
    W: NUMBER,
    D: NUMBER,
    d: NUMBER,
    F: NUMBER,
    E: TEXT3,
    a: TEXT2,
    H: NUMBER,
    k: NUMBER,
    K: NUMBER,
    h: NUMBER,
    m: NUMBER,
    s: NUMBER,
    S: NUMBER,
    Z: TIMEZONE
  };
  var ONE_DAY = 24 * 60 * 60 * 1000;
  var ONE_WEEK = 7 * ONE_DAY;
  var DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK = 1;

  var newDateAtMidnight = function (year, month, day) {
    var d = new Date(year, month, day, 0, 0, 0);
    d.setMilliseconds(0);
    return d;
  };

  /**
   *
   * @param {Date} date
   * @returns {Number}
   */
  Date.prototype.getDifference = function (date) {
    return this.getTime() - date.getTime();
  };

  /**
   *
   * @param {Date} d
   * @returns {boolean}
   */
  Date.prototype.isBefore = function (d) {
    return this.getTime() < d.getTime();
  };

  /**
   *
   * @returns {Number}
   */
  Date.prototype.getUTCTime = function () {
    return Date.UTC(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(),
      this.getSeconds(), this.getMilliseconds());
  };

  /**
   *
   * @param {Date} d
   * @returns {number}
   */
  Date.prototype.getTimeSince = function (d) {
    return this.getUTCTime() - d.getUTCTime();
  };

  /**
   *
   * @returns {Date}
   */
  Date.prototype.getPreviousSunday = function () {
    // Using midday avoids any possibility of DST messing things up
    var midday = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 12, 0, 0);
    var previousSunday = new Date(midday.getTime() - this.getDay() * ONE_DAY);
    return newDateAtMidnight(previousSunday.getFullYear(), previousSunday.getMonth(),
      previousSunday.getDate());
  };

  /**
   *
   * @extends Date
   * @param {Number} minimalDaysInFirstWeek
   * @returns {Number}
   */
  Date.prototype.getWeekInYear = function (minimalDaysInFirstWeek) {
    if (helper.isUndefined(this.minimalDaysInFirstWeek)) {
      minimalDaysInFirstWeek = DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;
    }
    var previousSunday = this.getPreviousSunday();
    var startOfYear = newDateAtMidnight(this.getFullYear(), 0, 1);
    var numberOfSundays = previousSunday.isBefore(startOfYear) ?
      0 : 1 + Math.floor(previousSunday.getTimeSince(startOfYear) / ONE_WEEK);
    var numberOfDaysInFirstWeek = 7 - startOfYear.getDay();
    var weekInYear = numberOfSundays;
    if (numberOfDaysInFirstWeek < minimalDaysInFirstWeek) {
      weekInYear--;
    }
    return weekInYear;
  };

  /**
   *
   * @param {Number} minimalDaysInFirstWeek
   * @returns {Number}
   */
  Date.prototype.getWeekInMonth = function (minimalDaysInFirstWeek) {
    if (helper.isUndefined(this.minimalDaysInFirstWeek)) {
      minimalDaysInFirstWeek = DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;
    }
    var previousSunday = this.getPreviousSunday();
    var startOfMonth = newDateAtMidnight(this.getFullYear(), this.getMonth(), 1);
    var numberOfSundays = previousSunday.isBefore(startOfMonth) ?
      0 : 1 + Math.floor(previousSunday.getTimeSince(startOfMonth) / ONE_WEEK);
    var numberOfDaysInFirstWeek = 7 - startOfMonth.getDay();
    var weekInMonth = numberOfSundays;
    if (numberOfDaysInFirstWeek >= minimalDaysInFirstWeek) {
      weekInMonth++;
    }
    return weekInMonth;
  };

  /**
   *
   * @returns {Number}
   * @this {Date}
   */
  Date.prototype.getDayInYear = function () {
    var startOfYear = newDateAtMidnight(this.getFullYear(), 0, 1);
    return 1 + Math.floor(this.getTimeSince(startOfYear) / ONE_DAY);
  };

  /* ------------------------------------------------------------------ */

  /**
   *
   * @param formatString
   * @this {SimpleDateFormat}
   * @constructor
   */
  SimpleDateFormat = function (formatString) {
    this.formatString = formatString;
  };

  /**
   * Sets the minimum number of days in a week in order for that week to
   * be considered as belonging to a particular month or year
   * @param {Number} days
   */
  SimpleDateFormat.prototype.setMinimalDaysInFirstWeek = function (days) {
    this.minimalDaysInFirstWeek = days;
  };

  /**
   *
   * @returns {Number}
   */
  SimpleDateFormat.prototype.getMinimalDaysInFirstWeek = function () {
    return helper.isUndefined(this.minimalDaysInFirstWeek) ?
      DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK : this.minimalDaysInFirstWeek;
  };

  var padWithZeroes = function (str, len) {
    while (str.length < len) {
      str = '0' + str;
    }
    return str;
  };

  var formatText = function (data, numberOfLetters, minLength) {
    return (numberOfLetters >= 4) ? data : data.substr(0, Math.max(minLength, numberOfLetters));
  };

  var formatNumber = function (data, numberOfLetters) {
    var dataString = '' + data;
    // Pad with 0s as necessary
    return padWithZeroes(dataString, numberOfLetters);
  };

  /**
   *
   * @param {Date} date
   * @returns {string}
   */
  SimpleDateFormat.prototype.format = function (date) {
    var formattedString = '';
    var result;
    var searchString = this.formatString;
    while ((result = regex.exec(searchString))) {
      var quotedString = result[1];
      var patternLetters = result[2];
      var otherLetters = result[3];
      var otherCharacters = result[4];

      // If the pattern matched is quoted string, output the text between the quotes
      if (quotedString) {
        if (quotedString === '\'\'') {
          formattedString += '\'';
        } else {
          formattedString += quotedString.substring(1, quotedString.length - 1);
        }
      } else if (otherLetters) {
        // Swallow non-pattern letters by doing nothing here
      } else if (otherCharacters) {
        // Simply output other characters
        formattedString += otherCharacters;
      } else if (patternLetters) {
        // Replace pattern letters
        var patternLetter = patternLetters.charAt(0);
        var numberOfLetters = patternLetters.length;
        var rawData = '';
        switch (patternLetter) {
        case 'G':
          rawData = 'AD';
          break;
        case 'y':
          rawData = date.getFullYear();
          break;
        case 'M':
          rawData = date.getMonth();
          break;
        case 'w':
          rawData = date.getWeekInYear(this.getMinimalDaysInFirstWeek());
          break;
        case 'W':
          rawData = date.getWeekInMonth(this.getMinimalDaysInFirstWeek());
          break;
        case 'D':
          rawData = date.getDayInYear();
          break;
        case 'd':
          rawData = date.getDate();
          break;
        case 'F':
          rawData = 1 + Math.floor((date.getDate() - 1) / 7);
          break;
        case 'E':
          rawData = dayNames[date.getDay()];
          break;
        case 'a':
          rawData = (date.getHours() >= 12) ? 'PM' : 'AM';
          break;
        case 'H':
          rawData = date.getHours();
          break;
        case 'k':
          rawData = date.getHours() || 24;
          break;
        case 'K':
          rawData = date.getHours() % 12;
          break;
        case 'h':
          rawData = (date.getHours() % 12) || 12;
          break;
        case 'm':
          rawData = date.getMinutes();
          break;
        case 's':
          rawData = date.getSeconds();
          break;
        case 'S':
          rawData = date.getMilliseconds();
          break;
        case 'Z':
          rawData = date.getTimezoneOffset(); // This returns the number of minutes since GMT was this time.
          break;
        }
        // Format the raw data depending on the type
        switch (types[patternLetter]) {
        case TEXT2:
          formattedString += formatText(rawData, numberOfLetters, 2);
          break;
        case TEXT3:
          formattedString += formatText(rawData, numberOfLetters, 3);
          break;
        case NUMBER:
          formattedString += formatNumber(rawData, numberOfLetters);
          break;
        case YEAR:
          if (numberOfLetters <= 3) {
            // Output a 2-digit year
            var dataString = '' + rawData;
            formattedString += dataString.substr(2, 2);
          } else {
            formattedString += formatNumber(rawData, numberOfLetters);
          }
          break;
        case MONTH:
          if (numberOfLetters >= 3) {
            formattedString += formatText(monthNames[rawData], numberOfLetters, numberOfLetters);
          } else {
            // NB. Months returned by getMonth are zero-based
            formattedString += formatNumber(rawData + 1, numberOfLetters);
          }
          break;
        case TIMEZONE:
          var isPositive = (rawData > 0);
          // The following line looks like a mistake but isn't
          // because of the way getTimezoneOffset measures.
          var prefix = isPositive ? '-' : '+';
          var absData = Math.abs(rawData);

          // Hours
          var hours = '' + Math.floor(absData / 60);
          hours = padWithZeroes(hours, 2);
          // Minutes
          var minutes = '' + (absData % 60);
          minutes = padWithZeroes(minutes, 2);

          formattedString += prefix + hours + minutes;
          break;
        }
      }
      searchString = searchString.substr(result.index + result[0].length);
    }
    return formattedString;
  };

  log4js.SimpleDateFormat = SimpleDateFormat;
});
define('log4js.layout.pattern',['log4js.helper', 'log4js.core', 'log4js.layout', 'log4js.simpleDateFormat'], function (helper, log4js) {
  

  /**
   * PatternLayout
   * @param pattern
   * @constructor
   * @mixes Layout
   */
  function PatternLayout(pattern) {
    if (pattern) {
      this.pattern = pattern;
    } else {
      this.pattern = PatternLayout.DEFAULT_CONVERSION_PATTERN;
    }
    this.customFields = [];
  }

  /**
   *
   * @type {String}
   */
  PatternLayout.TTCC_CONVERSION_PATTERN = '%r %p %c - %m%n';

  /**
   *
   * @type {String}
   */
  PatternLayout.DEFAULT_CONVERSION_PATTERN = '%m%n';

  /**
   *
   * @type {String}
   */
  PatternLayout.ISO8601_DATEFORMAT = 'yyyy-MM-dd HH:mm:ss,SSS';

  /**
   *
   * @type {String}
   */
  PatternLayout.DATETIME_DATEFORMAT = 'dd MMM yyyy HH:mm:ss,SSS';

  /**
   *
   * @type {String}
   */
  PatternLayout.ABSOLUTETIME_DATEFORMAT = 'HH:mm:ss,SSS';

  /**
   *
   * @type {Layout}
   */
  PatternLayout.prototype = new log4js.Layout();

  /**
   *
   * @param loggingEvent
   * @returns {String}
   */
  PatternLayout.prototype.format = function (loggingEvent) {
    var regex = /%(-?[0-9]+)?(\.?[0-9]+)?([acdflmMnpr%])(\{([^\}]+)\})?|([^%]+)/;
    var formattedString = '';
    var result;
    var searchString = this.pattern;

    // Cannot use regex global flag since it doesn't work with exec in IE5
    while ((result = regex.exec(searchString))) {
      var matchedString = result[0];
      var padding = result[1];
      var truncation = result[2];
      var conversionCharacter = result[3];
      var specifier = result[5];
      var text = result[6];

      // Check if the pattern matched was just normal text
      if (text) {
        formattedString += '' + text;
      } else {
        // Create a raw replacement string based on the conversion
        // character and specifier
        var replacement = '';
        switch (conversionCharacter) {
        case 'l': //Location
          var error = new Error();
          if (error.stack) {
            var column, line, resource, funcBegin, resourceBegin;
            var stack = error.stack;
            var lineAccessingLogger = stack.split('\n')[8];

            if (lineAccessingLogger === '') {
              var lastIndexOfAt = stack.lastIndexOf('@');
              lineAccessingLogger = stack.substr(lastIndexOfAt);
              funcBegin = 0;
              resourceBegin = lineAccessingLogger.indexOf('@') + 1;
            } else {
              funcBegin = lineAccessingLogger.indexOf('at ') + 3;
              resourceBegin = lineAccessingLogger.indexOf(' (') + 2;
            }

            var functionName = funcBegin < resourceBegin ? lineAccessingLogger.substring(funcBegin, resourceBegin - 2) : null;

            var resourceLoc;
            if (functionName) {
              resourceLoc = lineAccessingLogger.substring(resourceBegin, lineAccessingLogger.length - 1);
            } else {
              functionName = '(anonymous)';
              resourceLoc = lineAccessingLogger.substring(funcBegin);
            }

            var resourceLocSplit = resourceLoc.split(':');
            column = resourceLocSplit.pop();
            line = resourceLocSplit.pop();
            if (isNaN(line)) {
              resourceLocSplit.push(line);
              resource = resourceLocSplit.join(':');
              if (resource.indexOf('@') === 0) {
                resource = resource.substr(1);
              }
              line = column;
              column = NaN;
            } else {
              resource = resourceLocSplit.join(':');
            }
            var lastSegmentIdx = resource.lastIndexOf('/');
            var lastSegment = resource.substring(lastSegmentIdx + 1);

            /*
             var resultObject = {
             r : resource,
             l : line,
             c : column,
             f : functionName,
             s : lastSegment
             };
             */

            var spec = 's:l';
            if (specifier) {
              spec = specifier;
            }

            var specresult = [];
            var priorNum = '';
            var int;
            for (int = 0; int < spec.length; int++) {
              var l = spec[int];
              var num = parseInt(l, 10);
              if (num > -1) {
                priorNum += l;
              } else {
                if (priorNum.length > 0) {
                  specresult.push(parseInt(priorNum, 10));
                  priorNum = '';
                }
                specresult.push(l);
              }
            }
            if (priorNum.length > 0) {
              specresult.push(parseInt(priorNum, 10));
            }
            spec = specresult;
            for (int = 0; int < spec.length; int++) {
              var optNum = spec[int + 1], string = '';
              switch (spec[int]) {
              case 's':
                replacement += lastSegment;
                break;
              case 'r':
                string = resource;
                if (typeof optNum === 'number') {
                  string = string.substring(string.length - optNum);
                  spec.splice(int + 1, 1);
                }
                replacement += string;
                break;
              case 'l':
                replacement += line;
                break;
              case 'c':
                if (!isNaN(column)) {
                  replacement += column;
                } else {
                  replacement = replacement.substring(0, replacement.lastIndexOf(spec[int - 1]));
                }
                break;
              case 'f':
                string = functionName;
                if (typeof optNum === 'number') {
                  string = string.substring(string.length - optNum);
                  spec.splice(int + 1, 1);
                }
                replacement += string;
                break;
              default:
                replacement += spec[int];
              }
            }
          } else {
            helper.handleError('Could not apply "l" pattern because no stack is available');
          }
          break;
        case 'a': // Array of messages
        case 'm': // Message
          var depth = 0;
          if (specifier) {
            depth = parseInt(specifier, 10);
            if (isNaN(depth)) {
              helper.handleError('PatternLayout.format: invalid specifier "' +
                specifier + '" for conversion character "' + conversionCharacter +
                '" - should be a number');
              depth = 0;
            }
          }
          var messages = (conversionCharacter === 'a') ? loggingEvent.messages[0] : loggingEvent.messages;
          for (var i = 0, len = messages.length; i < len; i++) {
            if (i > 0 && (replacement.charAt(replacement.length - 1) !== ' ')) {
              replacement += ' ';
            }
            if (depth === 0) {
              replacement += messages[i];
            } else {
              replacement += JSON.stringify(messages[i], null, 2);
            }
          }
          break;
        case 'c': // Logger name
          var loggerName = loggingEvent.logger.name;
          if (specifier) {
            var precision = parseInt(specifier, 10);
            var loggerNameBits = loggingEvent.logger.name.split('.');
            if (precision >= loggerNameBits.length) {
              replacement = loggerName;
            } else {
              replacement = loggerNameBits.slice(loggerNameBits.length - precision).join('.');
            }
          } else {
            replacement = loggerName;
          }
          break;
        case 'd': // Date
          var dateFormat = PatternLayout.ISO8601_DATEFORMAT;
          if (specifier) {
            dateFormat = specifier;
            // Pick up special cases
            if (dateFormat === 'ISO8601') {
              dateFormat = PatternLayout.ISO8601_DATEFORMAT;
            } else if (dateFormat === 'ABSOLUTE') {
              dateFormat = PatternLayout.ABSOLUTETIME_DATEFORMAT;
            } else if (dateFormat === 'DATE') {
              dateFormat = PatternLayout.DATETIME_DATEFORMAT;
            }
          }
          // Format the date
          replacement = (new log4js.SimpleDateFormat(dateFormat)).format(loggingEvent.timeStamp);
          break;
        case 'f': // Custom field
          if (this.hasCustomFields()) {
            var fieldIndex = 0;
            if (specifier) {
              fieldIndex = parseInt(specifier, 10);
              if (isNaN(fieldIndex)) {
                helper.handleError('PatternLayout.format: invalid specifier "' +
                  specifier + '" for conversion character "f" - should be a number');
              } else if (fieldIndex === 0) {
                helper.handleError('PatternLayout.format: invalid specifier "' +
                  specifier + '" for conversion character "f" - must be greater than zero');
              } else if (fieldIndex > this.customFields.length) {
                helper.handleError('PatternLayout.format: invalid specifier "' +
                  specifier + '" for conversion character "f" - there aren\'t that many custom fields');
              } else {
                fieldIndex = fieldIndex - 1;
              }
            }
            var val = this.customFields[fieldIndex].value;
            if (typeof val === 'function') {
              val = val(this, loggingEvent);
            }
            replacement = val;
          }
          break;
        case 'n': // New line
          replacement = helper.newLine;
          break;
        case 'p': // Level
          replacement = loggingEvent.level.name;
          break;
        case 'r': // Milliseconds since log4javascript startup
          replacement = '' + loggingEvent.timeStamp.getDifference(log4js.applicationStartDate);
          break;
        case '%': // Literal % sign
          replacement = '%';
          break;
        default:
          replacement = matchedString;
          break;
        }
        // Format the replacement according to any padding or
        // truncation specified
        var length;

        // First, truncation
        if (truncation) {
          length = parseInt(truncation.substr(1), 10);
          var strLen = replacement.length;
          if (length < strLen) {
            replacement = replacement.substring(strLen - length, strLen);
          }
        }
        // Next, padding
        if (padding) {
          if (padding.charAt(0) === '-') {
            length = parseInt(padding.substr(1), 10);
            // Right pad with spaces
            while (replacement.length < length) {
              replacement += ' ';
            }
          } else {
            length = parseInt(padding, 10);
            // Left pad with spaces
            while (replacement.length < length) {
              replacement = ' ' + replacement;
            }
          }
        }
        formattedString += replacement;
      }
      searchString = searchString.substr(result.index + result[0].length);
    }
    return formattedString;
  };

  /**
   *
   * @returns {Boolean}
   */
  PatternLayout.prototype.ignoresThrowable = function () {
    return true;
  };

  /**
   *
   * @returns {String}
   */
  PatternLayout.prototype.toString = function () {
    return 'PatternLayout';
  };

  log4js.PatternLayout = PatternLayout;

});

define('log4js.layout.simple',['log4js.core', 'log4js.layout'], function (log4js) {
  

  /**
   * SimpleLayout
   * @constructor
   * @mixes Layout
   */
  function SimpleLayout() {
    this.customFields = [];
  }

  /**
   *
   * @type {Layout}
   */
  SimpleLayout.prototype = new log4js.Layout();

  /**
   *
   * @param loggingEvent
   * @returns {String}
   */
  SimpleLayout.prototype.format = function (loggingEvent) {
    return loggingEvent.level.name + ' - ' + loggingEvent.getCombinedMessages();
  };

  /**
   *
   * @returns {Boolean}
   */
  SimpleLayout.prototype.ignoresThrowable = function () {
    return true;
  };

  /**
   *
   * @returns {string}
   */
  SimpleLayout.prototype.toString = function () {
    return 'SimpleLayout';
  };

  log4js.SimpleLayout = SimpleLayout;
});

define('log4js.appender',[
  'log4js.helper',
  'log4js.core',
  'log4js.eventSupport',
  'log4js.layout.pattern'
], function (helper, log4js, EventSupport) {
  

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
    if (layout instanceof log4js.Layout) {
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

define('log4js.layout.xml',['log4js.helper', 'log4js.core', 'log4js.appender'], function (helper, log4js) {
  

  /**
   * XML Layout
   * @param combineMessages
   * @constructor
   * @mixes Layout
   */
  function XmlLayout(combineMessages) {
    this.combineMessages = helper.extractBooleanFromParam(combineMessages, true);
    this.customFields = [];
  }

  /**
   *
   * @type {Layout}
   */
  XmlLayout.prototype = new log4js.Layout();

  /**
   *
   * @returns {Boolean}
   */
  XmlLayout.prototype.isCombinedMessages = function () {
    return this.combineMessages;
  };

  /**
   *
   * @returns {String}
   */
  XmlLayout.prototype.getContentType = function () {
    return 'text/xml';
  };

  /**
   *
   * @param {String} str
   * @returns {String}
   */
  XmlLayout.prototype.escapeCdata = function (str) {
    return str.replace(/\]\]>/, ']]>]]&gt;<![CDATA[');
  };

  /**
   *
   * @param loggingEvent
   * @returns {String}
   */
  XmlLayout.prototype.format = function (loggingEvent) {
    var layout = this;
    var i, len;

    function formatMessage(message) {
      message = (typeof message === 'string') ? message : helper.toString(message);
      return '<log4javascript:message><![CDATA[' +
        layout.escapeCdata(message) + ']]></log4javascript:message>';
    }

    var str = '<log4javascript:event logger="' + loggingEvent.logger.name +
      '" timestamp="' + this.getTimeStampValue(loggingEvent) + '"';
    if (!this.isTimeStampsInMilliseconds()) {
      str += ' milliseconds="' + loggingEvent.milliseconds + '"';
    }
    str += ' level="' + loggingEvent.level.name + '">' + helper.newLine;
    if (this.combineMessages) {
      str += formatMessage(loggingEvent.getCombinedMessages());
    } else {
      str += '<log4javascript:messages>' + helper.newLine;
      for (i = 0, len = loggingEvent.messages.length; i < len; i++) {
        str += formatMessage(loggingEvent.messages[i]) + helper.newLine;
      }
      str += '</log4javascript:messages>' + helper.newLine;
    }
    if (this.hasCustomFields()) {
      for (i = 0, len = this.customFields.length; i < len; i++) {
        str += '<log4javascript:customfield name="' +
          this.customFields[i].name + '"><![CDATA[' +
          this.customFields[i].value.toString() +
          ']]></log4javascript:customfield>' + helper.newLine;
      }
    }
    if (loggingEvent.exception) {
      str += '<log4javascript:exception><![CDATA[' +
        helper.getExceptionStringRep(loggingEvent.exception) +
        ']]></log4javascript:exception>' + helper.newLine;
    }
    str += '</log4javascript:event>' + helper.newLine;
    return str;
  };

  /**
   *
   * @returns {Boolean}
   */
  XmlLayout.prototype.ignoresThrowable = function () {
    return false;
  };

  /**
   *
   * @returns {String}
   */
  XmlLayout.prototype.toString = function () {
    return 'XmlLayout';
  };

  /**
   *
   * @type {XmlLayout}
   */
  log4js.XmlLayout = XmlLayout;
});
/*global window*/
define('log4js.appender.alert',['log4js.core', 'log4js.appender', 'log4js.layout.simple'], function(log4js){
  
  /**
   *
   * @constructor
   * @mixes Appender
   */
  function AlertAppender() {}

  /**
   *
   * @type {Appender}
   */
  AlertAppender.prototype = new log4js.Appender();

  /**
   *
   * @type {Layout}
   */
  AlertAppender.prototype.layout = new log4js.SimpleLayout();

  /**
   *
   * @param loggingEvent
   */
  AlertAppender.prototype.append = function (loggingEvent) {
    var formattedMessage = this.getLayout().format(loggingEvent);
    if (this.getLayout().ignoresThrowable()) {
      formattedMessage += loggingEvent.getThrowableStrRep();
    }
    window.alert(formattedMessage);
  };

  /**
   *
   * @returns {string}
   */
  AlertAppender.prototype.toString = function () {
    return 'AlertAppender';
  };

  log4js.AlertAppender = AlertAppender;
});

/*global window*/
define('log4js.appender.browserConsole',['log4js.core', 'log4js.appender', 'log4js.layout.null'], function (log4js) {
  

  /**
   * BrowserConsoleAppender (works in Opera, Safari, Firefox, Firefox with
   * Firebug extension and Chrome)
   * @constructor
   * @mixes Appender
   */
  function BrowserConsoleAppender() {
  }

  /**
   *
   * @type {Appender}
   */
  BrowserConsoleAppender.prototype = new log4js.Appender();

  /**
   *
   * @type {Layout}
   */
  BrowserConsoleAppender.prototype.layout = new log4js.NullLayout();

  /**
   *
   * @type {Level}
   */
  BrowserConsoleAppender.prototype.threshold = log4js.Level.DEBUG;

  /**
   *
   * @param loggingEvent
   */
  BrowserConsoleAppender.prototype.append = function (loggingEvent) {
    var appender = this;

    var getFormattedMessage = function () {
      var layout = appender.getLayout();
      var formattedMessage = layout.format(loggingEvent);
      if (layout.ignoresThrowable() && loggingEvent.exception) {
        formattedMessage += loggingEvent.getThrowableStrRep();
      }
      return formattedMessage;
    };

    if (window.console && window.console.log) {
      var formattedMesage = getFormattedMessage();
      if (window.console.debug && log4js.Level.DEBUG.isGreaterOrEqual(loggingEvent.level)) {
        window.console.debug(formattedMesage);
      } else if (window.console.info && log4js.Level.INFO.equals(loggingEvent.level)) {
        window.console.info(formattedMesage);
      } else if (window.console.warn && log4js.Level.WARN.equals(loggingEvent.level)) {
        window.console.warn(formattedMesage);
      } else if (window.console.error && loggingEvent.level.isGreaterOrEqual(log4js.Level.ERROR)) {
        window.console.error(formattedMesage);
      } else {
        window.console.log(formattedMesage);
      }
    }
  };

  /**
   *
   * @param {String} name
   */
  BrowserConsoleAppender.prototype.group = function (name) {
    if (window.console && window.console.group) {
      window.console.group(name);
    }
  };

  /**
   * @todo document
   */
  BrowserConsoleAppender.prototype.groupEnd = function () {
    if (window.console && window.console.groupEnd) {
      window.console.groupEnd();
    }
  };

  /**
   *
   * @returns {String}
   */
  BrowserConsoleAppender.prototype.toString = function () {
    return 'BrowserConsoleAppender';
  };

  /**
   *
   * @type {BrowserConsoleAppender}
   */
  log4js.BrowserConsoleAppender = BrowserConsoleAppender;
});
define('log4js',[
  'log4js.core',
  'log4js.layout.json',
  'log4js.layout.httpPostData',
  'log4js.layout.null',
  'log4js.layout.pattern',
  'log4js.layout.simple',
  'log4js.layout.xml',
  'log4js.appender.alert',
  'log4js.appender.browserConsole',
], function(log4js){
  

  return log4js;
});

}());