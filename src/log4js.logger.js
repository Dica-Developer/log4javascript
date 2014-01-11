/*jshint unused:false */
var anonymousLoggerName = '[anonymous]';
var defaultLoggerName = '[default]';
var nullLoggerName = '[null]';
var rootLoggerName = 'root';

/**
 *
 * @param {String} name
 * @property {String} name
 * @property {} parent
 * @property {Array} children
 * @constructor
 */
function Logger(name) {
  'use strict';

  this.name = name;
  this.parent = null;
  this.children = [];

  var appenders = [];
  var loggerLevel = null;
  var isRoot = (this.name === rootLoggerName);
  var isNull = (this.name === nullLoggerName);

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
      handleError('Logger.addAppender: you may not add an appender to the null logger');
    } else {
      if (appender instanceof log4javascript.Appender) {
        if (!arrayContains(appenders, appender)) {
          appenders.push(appender);
          appender.setAddedToLogger(this);
          this.invalidateAppenderCache();
        }
      } else {
        handleError('Logger.addAppender: appender supplied ("' + toStr(appender) + '") is not a subclass of Appender');
      }
    }
  };

  /**
   *
   * @param appender
   */
  this.removeAppender = function (appender) {
    arrayRemove(appenders, appender);
    appender.setRemovedFromLogger(this);
    this.invalidateAppenderCache();
  };

  /**
   *
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
   *
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
    if (enabled && level.isGreaterOrEqual(this.getEffectiveLevel())) {
      // Check whether last param is an exception
      var exception;
      var finalParamIndex = params.length - 1;
      var lastParam = params[finalParamIndex];
      if (params.length > 1 && isError(lastParam)) {
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
      handleError('Logger.setLevel: you cannot set the level of the root logger to null');
    } else if (level instanceof Level) {
      loggerLevel = level;
    } else {
      handleError('Logger.setLevel: level supplied to logger ' + this.name + ' is not an instance of log4javascript.Level');
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
    if (enabled) {
      var effectiveAppenders = this.getEffectiveAppenders();
      for (var i = 0, len = effectiveAppenders.length; i < len; i++) {
        effectiveAppenders[i].group(name, initiallyExpanded);
      }
    }
  };

  /**
   *
   */
  this.groupEnd = function () {
    if (enabled) {
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
    if (enabled) {
      if (isUndefined(name)) {
        handleError('Logger.time: a name for the timer must be supplied');
      } else if (level && !(level instanceof Level)) {
        handleError('Logger.time: level supplied to timer ' + name + ' is not an instance of log4javascript.Level');
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
    if (enabled) {
      if (isUndefined(name)) {
        handleError('Logger.timeEnd: a name for the timer must be supplied');
      } else if (timers[name]) {
        var timer = timers[name];
        var milliseconds = timer.getElapsedTime();
        this.log(timer.level, ['Timer ' + toStr(name) + ' completed in ' + milliseconds + 'ms']);
        delete timers[name];
      } else {
        logLog.warn('Logger.timeEnd: no timer found with name ' + name);
      }
    }
  };

  /**
   *
   * @param expr
   */
  this.assert = function (expr) {
    if (enabled && !expr) {
      var args = [];
      for (var i = 1, len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
      }
      args = (args.length > 0) ? args : ['Assertion Failure'];
      args.push(newLine);
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
 *
 */
Logger.prototype.trace = function () {
  'use strict';

  this.log(Level.TRACE, arguments);
};

/**
 *
 */
Logger.prototype.debug = function () {
  'use strict';

  this.log(Level.DEBUG, arguments);
};

/**
 *
 */
Logger.prototype.info = function () {
  'use strict';

  this.log(Level.INFO, arguments);
};

/**
 *
 */
Logger.prototype.warn = function () {
  'use strict';

  this.log(Level.WARN, arguments);
};

/**
 *
 */
Logger.prototype.error = function () {
  'use strict';

  this.log(Level.ERROR, arguments);
};

/**
 *
 */
Logger.prototype.fatal = function () {
  'use strict';

  this.log(Level.FATAL, arguments);
};

/**
 *
 * @param {Level} level
 * @returns {Boolean}
 */
Logger.prototype.isEnabledFor = function (level) {
  'use strict';

  return level.isGreaterOrEqual(this.getEffectiveLevel());
};

/**
 *
 * @returns {Boolean}
 */
Logger.prototype.isTraceEnabled = function () {
  'use strict';

  return this.isEnabledFor(Level.TRACE);
};

/**
 *
 * @returns {Boolean}
 */
Logger.prototype.isDebugEnabled = function () {
  'use strict';

  return this.isEnabledFor(Level.DEBUG);
};

/**
 *
 * @returns {Boolean}
 */
Logger.prototype.isInfoEnabled = function () {
  'use strict';

  return this.isEnabledFor(Level.INFO);
};

/**
 *
 * @returns {Boolean}
 */
Logger.prototype.isWarnEnabled = function () {
  'use strict';

  return this.isEnabledFor(Level.WARN);
};

/**
 *
 * @returns {Boolean}
 */
Logger.prototype.isErrorEnabled = function () {
  'use strict';

  return this.isEnabledFor(Level.ERROR);
};

/**
 *
 * @returns {Boolean}
 */
Logger.prototype.isFatalEnabled = function () {
  'use strict';

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