/**
 * Copyright 2013 Tim Down.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * log4javascript
 *
 * log4javascript is a logging framework for JavaScript based on log4j
 * for Java. This file contains all core log4javascript code and is the only
 * file required to use log4javascript, unless you require support for
 * document.domain, in which case you will also need console.html, which must be
 * stored in the same directory as the main log4javascript.js file.
 *
 * Author: Tim Down <tim@log4javascript.org>
 * Version: 1.4.6
 * Edition: log4javascript_production
 * Build date: 19 March 2013
 * Website: http://log4javascript.org
 */

function isUndefined(obj) {
  return typeof obj === "undefined";
}

/* ---------------------------------------------------------------------- */
// Custom event support

function EventSupport() {}

EventSupport.prototype = {
  eventTypes: [],
  eventListeners: {},
  setEventTypes: function (eventTypesParam) {
    if (eventTypesParam instanceof Array) {
      this.eventTypes = eventTypesParam;
      this.eventListeners = {};
      for (var i = 0, len = this.eventTypes.length; i < len; i++) {
        this.eventListeners[this.eventTypes[i]] = [];
      }
    } else {
      handleError("log4javascript.EventSupport [" + this + "]: setEventTypes: eventTypes parameter must be an Array");
    }
  },

  addEventListener: function (eventType, listener) {
    if (typeof listener === "function") {
      if (!array_contains(this.eventTypes, eventType)) {
        handleError("log4javascript.EventSupport [" + this + "]: addEventListener: no event called '" + eventType + "'");
      }
      this.eventListeners[eventType].push(listener);
    } else {
      handleError("log4javascript.EventSupport [" + this + "]: addEventListener: listener must be a function");
    }
  },

  removeEventListener: function (eventType, listener) {
    if (typeof listener === "function") {
      if (!array_contains(this.eventTypes, eventType)) {
        handleError("log4javascript.EventSupport [" + this + "]: removeEventListener: no event called '" + eventType + "'");
      }
      array_remove(this.eventListeners[eventType], listener);
    } else {
      handleError("log4javascript.EventSupport [" + this + "]: removeEventListener: listener must be a function");
    }
  },

  dispatchEvent: function (eventType, eventArgs) {
    if (array_contains(this.eventTypes, eventType)) {
      var listeners = this.eventListeners[eventType];
      for (var i = 0, len = listeners.length; i < len; i++) {
        listeners[i](this, eventType, eventArgs);
      }
    } else {
      handleError("log4javascript.EventSupport [" + this + "]: dispatchEvent: no event called '" + eventType + "'");
    }
  }
};

/* -------------------------------------------------------------------------- */

var applicationStartDate = new Date();
var getUUID = function(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};
var uniqueId = "log4javascript_" + getUUID();
console.log(uniqueId);
var emptyFunction = function () {
};
var newLine = "\r\n";
var pageLoaded = false;

// Create main log4javascript object; this will be assigned public properties
function Log4JavaScript() {
}

Log4JavaScript.prototype = new EventSupport();

var log4javascript = new Log4JavaScript();
log4javascript.version = "1.4.6";
log4javascript.edition = "log4javascript_production";

/* -------------------------------------------------------------------------- */
// Utility functions

function toStr(obj) {
  if (obj && obj.toString) {
    return obj.toString();
  } else {
    return String(obj);
  }
}

function getExceptionMessage(ex) {
  if (ex.message) {
    return ex.message;
  } else if (ex.description) {
    return ex.description;
  } else {
    return toStr(ex);
  }
}

// Gets the portion of the URL after the last slash
function getUrlFileName(url) {
  var lastSlashIndex = Math.max(url.lastIndexOf("/"), url.lastIndexOf("\\"));
  return url.substr(lastSlashIndex + 1);
}

// Returns a nicely formatted representation of an error
function getExceptionStringRep(ex) {
  if (ex) {
    var exStr = "Exception: " + getExceptionMessage(ex);
    try {
      if (ex.lineNumber) {
        exStr += " on line number " + ex.lineNumber;
      }
      if (ex.fileName) {
        exStr += " in file " + getUrlFileName(ex.fileName);
      }
    } catch (localEx) {
      logLog.warn("Unable to obtain file and line information for error");
    }
    if (showStackTraces && ex.stack) {
      exStr += newLine + "Stack trace:" + newLine + ex.stack;
    }
    return exStr;
  }
  return null;
}

function bool(obj) {
  return Boolean(obj);
}

function trim(str) {
  return str.replace(/^\s+/, "").replace(/\s+$/, "");
}

function splitIntoLines(text) {
  // Ensure all line breaks are \n only
  var text2 = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return text2.split("\n");
}

var urlEncode = (typeof window.encodeURIComponent != "undefined") ?
  function (str) {
    return encodeURIComponent(str);
  } :
  function (str) {
    return escape(str).replace(/\+/g, "%2B").replace(/"/g, "%22").replace(/'/g, "%27").replace(/\//g, "%2F").replace(/=/g, "%3D");
  };

var urlDecode = (typeof window.decodeURIComponent != "undefined") ?
  function (str) {
    return decodeURIComponent(str);
  } :
  function (str) {
    return unescape(str).replace(/%2B/g, "+").replace(/%22/g, "\"").replace(/%27/g, "'").replace(/%2F/g, "/").replace(/%3D/g, "=");
  };

function array_remove(arr, val) {
  var index = -1;
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i] === val) {
      index = i;
      break;
    }
  }
  if (index >= 0) {
    arr.splice(index, 1);
    return true;
  } else {
    return false;
  }
}

function array_contains(arr, val) {
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i] === val) {
      return true;
    }
  }
  return false;
}

function extractBooleanFromParam(param, defaultValue) {
  if (isUndefined(param)) {
    return defaultValue;
  } else {
    return bool(param);
  }
}

function extractStringFromParam(param, defaultValue) {
  if (isUndefined(param)) {
    return defaultValue;
  } else {
    return String(param);
  }
}

function extractIntFromParam(param, defaultValue) {
  if (isUndefined(param)) {
    return defaultValue;
  } else {
    try {
      var value = parseInt(param, 10);
      return isNaN(value) ? defaultValue : value;
    } catch (ex) {
      logLog.warn("Invalid int param " + param, ex);
      return defaultValue;
    }
  }
}

function extractFunctionFromParam(param, defaultValue) {
  if (typeof param === "function") {
    return param;
  } else {
    return defaultValue;
  }
}

function isError(err) {
  return (err instanceof Error);
}

if (!Function.prototype.apply) {
  Function.prototype.apply = function (obj, args) {
    var methodName = "__apply__";
    if (typeof obj[methodName] != "undefined") {
      methodName += String(Math.random()).substr(2);
    }
    obj[methodName] = this;

    var argsStrings = [];
    for (var i = 0, len = args.length; i < len; i++) {
      argsStrings[i] = "args[" + i + "]";
    }
    var script = "obj." + methodName + "(" + argsStrings.join(",") + ")";
    var returnValue = eval(script);
    delete obj[methodName];
    return returnValue;
  };
}

if (!Function.prototype.call) {
  Function.prototype.call = function (obj) {
    var args = [];
    for (var i = 1, len = arguments.length; i < len; i++) {
      args[i - 1] = arguments[i];
    }
    return this.apply(obj, args);
  };
}

function getListenersPropertyName(eventName) {
  return "__log4javascript_listeners__" + eventName;
}

function addEvent(node, eventName, listener, useCapture, win) {
  win = win ? win : window;
  if (node.addEventListener) {
    node.addEventListener(eventName, listener, useCapture);
  } else if (node.attachEvent) {
    node.attachEvent("on" + eventName, listener);
  } else {
    var propertyName = getListenersPropertyName(eventName);
    if (!node[propertyName]) {
      node[propertyName] = [];
      // Set event handler
      node["on" + eventName] = function (evt) {
        evt = getEvent(evt, win);
        var listenersPropertyName = getListenersPropertyName(eventName);

        // Clone the array of listeners to leave the original untouched
        var listeners = this[listenersPropertyName].concat([]);
        var currentListener;

        // Call each listener in turn
        while ((currentListener = listeners.shift())) {
          currentListener.call(this, evt);
        }
      };
    }
    node[propertyName].push(listener);
  }
}

function removeEvent(node, eventName, listener, useCapture) {
  if (node.removeEventListener) {
    node.removeEventListener(eventName, listener, useCapture);
  } else if (node.detachEvent) {
    node.detachEvent("on" + eventName, listener);
  } else {
    var propertyName = getListenersPropertyName(eventName);
    if (node[propertyName]) {
      array_remove(node[propertyName], listener);
    }
  }
}

function getEvent(evt, win) {
  win = win ? win : window;
  return evt ? evt : win.event;
}

function stopEventPropagation(evt) {
  if (evt.stopPropagation) {
    evt.stopPropagation();
  } else if (typeof evt.cancelBubble != "undefined") {
    evt.cancelBubble = true;
  }
  evt.returnValue = false;
}

/* ---------------------------------------------------------------------- */
// Simple logging for log4javascript itself

var logLog = {
  quietMode: false,

  debugMessages: [],

  setQuietMode: function (quietMode) {
    this.quietMode = bool(quietMode);
  },

  numberOfErrors: 0,

  alertAllErrors: false,

  setAlertAllErrors: function (alertAllErrors) {
    this.alertAllErrors = alertAllErrors;
  },

  debug: function (message) {
    this.debugMessages.push(message);
  },

  displayDebug: function () {
    alert(this.debugMessages.join(newLine));
  },

  warn: function (message, exception) {
  },

  error: function (message, exception) {
    if (++this.numberOfErrors === 1 || this.alertAllErrors) {
      if (!this.quietMode) {
        var alertMessage = "log4javascript error: " + message;
        if (exception) {
          alertMessage += newLine + newLine + "Original error: " + getExceptionStringRep(exception);
        }
        alert(alertMessage);
      }
    }
  }
};
log4javascript.logLog = logLog;

log4javascript.setEventTypes(["load", "error"]);

function handleError(message, exception) {
  logLog.error(message, exception);
  log4javascript.dispatchEvent("error", { "message": message, "exception": exception });
}

log4javascript.handleError = handleError;

/* ---------------------------------------------------------------------- */

var enabled = !((typeof log4javascript_disabled != "undefined") &&
  log4javascript_disabled);

log4javascript.setEnabled = function (enable) {
  enabled = bool(enable);
};

log4javascript.isEnabled = function () {
  return enabled;
};

var useTimeStampsInMilliseconds = true;

log4javascript.setTimeStampsInMilliseconds = function (timeStampsInMilliseconds) {
  useTimeStampsInMilliseconds = bool(timeStampsInMilliseconds);
};

log4javascript.isTimeStampsInMilliseconds = function () {
  return useTimeStampsInMilliseconds;
};


// This evaluates the given expression in the current scope, thus allowing
// scripts to access private variables. Particularly useful for testing
log4javascript.evalInScope = function (expr) {
  return eval(expr);
};

var showStackTraces = false;

log4javascript.setShowStackTraces = function (show) {
  showStackTraces = bool(show);
};

/* ---------------------------------------------------------------------- */
// Levels

var Level = function (level, name) {
  this.level = level;
  this.name = name;
};

Level.prototype = {
  toString: function () {
    return this.name;
  },
  equals: function (level) {
    return this.level === level.level;
  },
  isGreaterOrEqual: function (level) {
    return this.level >= level.level;
  }
};

Level.ALL = new Level(Number.MIN_VALUE, "ALL");
Level.TRACE = new Level(10000, "TRACE");
Level.DEBUG = new Level(20000, "DEBUG");
Level.INFO = new Level(30000, "INFO");
Level.WARN = new Level(40000, "WARN");
Level.ERROR = new Level(50000, "ERROR");
Level.FATAL = new Level(60000, "FATAL");
Level.OFF = new Level(Number.MAX_VALUE, "OFF");

log4javascript.Level = Level;

/* ---------------------------------------------------------------------- */
// Timers

function Timer(name, level) {
  this.name = name;
  this.level = isUndefined(level) ? Level.INFO : level;
  this.start = new Date();
}

Timer.prototype.getElapsedTime = function () {
  return new Date().getTime() - this.start.getTime();
};

/* ---------------------------------------------------------------------- */
// Loggers

var anonymousLoggerName = "[anonymous]";
var defaultLoggerName = "[default]";
var nullLoggerName = "[null]";
var rootLoggerName = "root";

function Logger(name) {
  this.name = name;
  this.parent = null;
  this.children = [];

  var appenders = [];
  var loggerLevel = null;
  var isRoot = (this.name === rootLoggerName);
  var isNull = (this.name === nullLoggerName);

  var appenderCache = null;
  var appenderCacheInvalidated = false;

  this.addChild = function (childLogger) {
    this.children.push(childLogger);
    childLogger.parent = this;
    childLogger.invalidateAppenderCache();
  };

  // Additivity
  var additive = true;
  this.getAdditivity = function () {
    return additive;
  };

  this.setAdditivity = function (additivity) {
    var valueChanged = (additive != additivity);
    additive = additivity;
    if (valueChanged) {
      this.invalidateAppenderCache();
    }
  };

  // Create methods that use the appenders variable in this scope
  this.addAppender = function (appender) {
    if (isNull) {
      handleError("Logger.addAppender: you may not add an appender to the null logger");
    } else {
      if (appender instanceof log4javascript.Appender) {
        if (!array_contains(appenders, appender)) {
          appenders.push(appender);
          appender.setAddedToLogger(this);
          this.invalidateAppenderCache();
        }
      } else {
        handleError("Logger.addAppender: appender supplied ('" +
          toStr(appender) + "') is not a subclass of Appender");
      }
    }
  };

  this.removeAppender = function (appender) {
    array_remove(appenders, appender);
    appender.setRemovedFromLogger(this);
    this.invalidateAppenderCache();
  };

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

  this.invalidateAppenderCache = function () {
    appenderCacheInvalidated = true;
    for (var i = 0, len = this.children.length; i < len; i++) {
      this.children[i].invalidateAppenderCache();
    }
  };

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

  this.callAppenders = function (loggingEvent) {
    var effectiveAppenders = this.getEffectiveAppenders();
    for (var i = 0, len = effectiveAppenders.length; i < len; i++) {
      effectiveAppenders[i].doAppend(loggingEvent);
    }
  };

  this.setLevel = function (level) {
    // Having a level of null on the root logger would be very bad.
    if (isRoot && level === null) {
      handleError("Logger.setLevel: you cannot set the level of the root logger to null");
    } else if (level instanceof Level) {
      loggerLevel = level;
    } else {
      handleError("Logger.setLevel: level supplied to logger " +
        this.name + " is not an instance of log4javascript.Level");
    }
  };

  this.getLevel = function () {
    return loggerLevel;
  };

  this.getEffectiveLevel = function () {
    for (var logger = this; logger !== null; logger = logger.parent) {
      var level = logger.getLevel();
      if (level !== null) {
        return level;
      }
    }
  };

  this.group = function (name, initiallyExpanded) {
    if (enabled) {
      var effectiveAppenders = this.getEffectiveAppenders();
      for (var i = 0, len = effectiveAppenders.length; i < len; i++) {
        effectiveAppenders[i].group(name, initiallyExpanded);
      }
    }
  };

  this.groupEnd = function () {
    if (enabled) {
      var effectiveAppenders = this.getEffectiveAppenders();
      for (var i = 0, len = effectiveAppenders.length; i < len; i++) {
        effectiveAppenders[i].groupEnd();
      }
    }
  };

  var timers = {};

  this.time = function (name, level) {
    if (enabled) {
      if (isUndefined(name)) {
        handleError("Logger.time: a name for the timer must be supplied");
      } else if (level && !(level instanceof Level)) {
        handleError("Logger.time: level supplied to timer " +
          name + " is not an instance of log4javascript.Level");
      } else {
        timers[name] = new Timer(name, level);
      }
    }
  };

  this.timeEnd = function (name) {
    if (enabled) {
      if (isUndefined(name)) {
        handleError("Logger.timeEnd: a name for the timer must be supplied");
      } else if (timers[name]) {
        var timer = timers[name];
        var milliseconds = timer.getElapsedTime();
        this.log(timer.level, ["Timer " + toStr(name) + " completed in " + milliseconds + "ms"]);
        delete timers[name];
      } else {
        logLog.warn("Logger.timeEnd: no timer found with name " + name);
      }
    }
  };

  this.assert = function (expr) {
    if (enabled && !expr) {
      var args = [];
      for (var i = 1, len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
      }
      args = (args.length > 0) ? args : ["Assertion Failure"];
      args.push(newLine);
      args.push(expr);
      this.log(Level.ERROR, args);
    }
  };

  this.toString = function () {
    return "Logger[" + this.name + "]";
  };
}

Logger.prototype = {
  trace: function () {
    this.log(Level.TRACE, arguments);
  },

  debug: function () {
    this.log(Level.DEBUG, arguments);
  },

  info: function () {
    this.log(Level.INFO, arguments);
  },

  warn: function () {
    this.log(Level.WARN, arguments);
  },

  error: function () {
    this.log(Level.ERROR, arguments);
  },

  fatal: function () {
    this.log(Level.FATAL, arguments);
  },

  isEnabledFor: function (level) {
    return level.isGreaterOrEqual(this.getEffectiveLevel());
  },

  isTraceEnabled: function () {
    return this.isEnabledFor(Level.TRACE);
  },

  isDebugEnabled: function () {
    return this.isEnabledFor(Level.DEBUG);
  },

  isInfoEnabled: function () {
    return this.isEnabledFor(Level.INFO);
  },

  isWarnEnabled: function () {
    return this.isEnabledFor(Level.WARN);
  },

  isErrorEnabled: function () {
    return this.isEnabledFor(Level.ERROR);
  },

  isFatalEnabled: function () {
    return this.isEnabledFor(Level.FATAL);
  }
};

Logger.prototype.trace.isEntryPoint = true;
Logger.prototype.debug.isEntryPoint = true;
Logger.prototype.info.isEntryPoint = true;
Logger.prototype.warn.isEntryPoint = true;
Logger.prototype.error.isEntryPoint = true;
Logger.prototype.fatal.isEntryPoint = true;

/* ---------------------------------------------------------------------- */
// Logger access methods

// Hashtable of loggers keyed by logger name
var loggers = {};
var loggerNames = [];

var ROOT_LOGGER_DEFAULT_LEVEL = Level.DEBUG;
var rootLogger = new Logger(rootLoggerName);
rootLogger.setLevel(ROOT_LOGGER_DEFAULT_LEVEL);

log4javascript.getRootLogger = function () {
  return rootLogger;
};

log4javascript.getLogger = function (loggerName) {
  // Use default logger if loggerName is not specified or invalid
  if (!(typeof loggerName === "string")) {
    loggerName = anonymousLoggerName;
    logLog.warn("log4javascript.getLogger: non-string logger name " +
      toStr(loggerName) + " supplied, returning anonymous logger");
  }

  // Do not allow retrieval of the root logger by name
  if (loggerName === rootLoggerName) {
    handleError("log4javascript.getLogger: root logger may not be obtained by name");
  }

  // Create the logger for this name if it doesn't already exist
  if (!loggers[loggerName]) {
    var logger = new Logger(loggerName);
    loggers[loggerName] = logger;
    loggerNames.push(loggerName);

    // Set up parent logger, if it doesn't exist
    var lastDotIndex = loggerName.lastIndexOf(".");
    var parentLogger;
    if (lastDotIndex > -1) {
      var parentLoggerName = loggerName.substring(0, lastDotIndex);
      parentLogger = log4javascript.getLogger(parentLoggerName); // Recursively sets up grandparents etc.
    } else {
      parentLogger = rootLogger;
    }
    parentLogger.addChild(logger);
  }
  return loggers[loggerName];
};

var defaultLogger = null;
log4javascript.getDefaultLogger = function () {
  if (!defaultLogger) {
    defaultLogger = log4javascript.getLogger(defaultLoggerName);
    var a = new log4javascript.PopUpAppender();
    defaultLogger.addAppender(a);
  }
  return defaultLogger;
};

var nullLogger = null;
log4javascript.getNullLogger = function () {
  if (!nullLogger) {
    nullLogger = new Logger(nullLoggerName);
    nullLogger.setLevel(Level.OFF);
  }
  return nullLogger;
};

// Destroys all loggers
log4javascript.resetConfiguration = function () {
  rootLogger.setLevel(ROOT_LOGGER_DEFAULT_LEVEL);
  loggers = {};
};

/* ---------------------------------------------------------------------- */
// Logging events

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

LoggingEvent.prototype = {
  getThrowableStrRep: function () {
    return this.exception ?
      getExceptionStringRep(this.exception) : "";
  },
  getCombinedMessages: function () {
    return (this.messages.length === 1) ? this.messages[0] :
      this.messages.join(newLine);
  },
  toString: function () {
    return "LoggingEvent[" + this.level + "]";
  }
};

log4javascript.LoggingEvent = LoggingEvent;

/* ---------------------------------------------------------------------- */
// Main load

log4javascript.setDocumentReady = function () {
  pageLoaded = true;
  log4javascript.dispatchEvent("load", {});
};

if (window.addEventListener) {
  window.addEventListener("load", log4javascript.setDocumentReady, false);
} else if (window.attachEvent) {
  window.attachEvent("onload", log4javascript.setDocumentReady);
} else {
  var oldOnload = window.onload;
  if (typeof window.onload != "function") {
    window.onload = log4javascript.setDocumentReady;
  } else {
    window.onload = function (evt) {
      if (oldOnload) {
        oldOnload(evt);
      }
      log4javascript.setDocumentReady();
    };
  }
}