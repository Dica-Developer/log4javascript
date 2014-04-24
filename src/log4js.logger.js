define(['log4js.helper', 'log4js.level'], function (helper, Level) {
  'use strict';

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