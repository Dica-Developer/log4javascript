/*jshint unused:false*/
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

uniqueId = 'log4javascript_' + getUUID();

//TODO do we need this???
//if (!Function.prototype.apply) {
//  Function.prototype.apply = function (obj, args) {
//    'use strict';
//
//    var methodName = '__apply__';
//    if (isNotUndefined(obj[methodName])) {
//      methodName += String(Math.random()).substr(2);
//    }
//    obj[methodName] = this;
//
//    var argsStrings = [];
//    for (var i = 0, len = args.length; i < len; i++) {
//      argsStrings[i] = 'args[' + i + ']';
//    }
//    var script = 'obj.' + methodName + '(' + argsStrings.join(',') + ')';
//    var returnValue = eval(script);
//    delete obj[methodName];
//    return returnValue;
//  };
//}

//TODO do we need this???
//if (!Function.prototype.call) {
//  Function.prototype.call = function (obj) {
//    'use strict';
//
//    var args = [];
//    for (var i = 1, len = arguments.length; i < len; i++) {
//      args[i - 1] = arguments[i];
//    }
//    return this.apply(obj, args);
//  };
//}

/**
 * Simple logging for log4javascript itself
 * @constructor
 */
function LogLog() {
  'use strict';

  this.quietMode = false;
  this.debugMessages = [];
  this.numberOfErrors = 0;
  this.alertAllErrors = false;
}

/**
 *
 * @param {Boolean} quietMode
 */
LogLog.prototype.setQuietMode = function (quietMode) {
  'use strict';

  this.quietMode = toBool(quietMode);
};

/**
 *
 * @param {Boolean} alertAllErrors
 */
LogLog.prototype.setAlertAllErrors = function (alertAllErrors) {
  'use strict';

  this.alertAllErrors = alertAllErrors;
};

/**
 *
 * @param {String} message
 */
LogLog.prototype.debug = function (message) {
  'use strict';

  this.debugMessages.push(message);
};

/**
 * Shows an alert box with collected debug messages
 */
LogLog.prototype.displayDebug = function () {
  'use strict';

  alert(this.debugMessages.join(newLine));
};

/**
 * @todo document
 */
LogLog.prototype.warn = function () {};

/**
 *
 * @param {String} message
 * @param {Error} exception
 */
LogLog.prototype.error = function (message, exception) {
  'use strict';

  if (++this.numberOfErrors === 1 || this.alertAllErrors) {
    if (!this.quietMode) {
      var alertMessage = 'log4javascript error: ' + message;
      if (exception) {
        alertMessage += newLine + newLine + 'Original error: ' + getExceptionStringRep(exception);
      }
      alert(alertMessage);
    }
  }
};

/**
 *
 * @type {LogLog}
 */
logLog = new LogLog();

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
  'use strict';

  this.name = name;
  this.level = isUndefined(level) ? Level.INFO : level;
  this.start = new Date();
}

/**
 *
 * @returns {Number}
 */
Timer.prototype.getElapsedTime = function () {
  'use strict';

  return new Date().getTime() - this.start.getTime();
};

var rootLogger = new Logger(rootLoggerName);
rootLogger.setLevel(ROOT_LOGGER_DEFAULT_LEVEL);

/**
 * Create main log4javascript object; this will be assigned public properties
 * @property {String} version
 * @property {String} edition
 * @constructor
 */
function Log4JavaScript() {
  'use strict';

  this.version = '1.4.6';
  this.edition = 'log4javascript_production';
}

/**
 *
 * @type {EventSupport}
 */
Log4JavaScript.prototype = new EventSupport();

/**
 *
 * @type {LogLog}
 */
Log4JavaScript.prototype.logLog = logLog;

/**
 *
 * @param {Boolean} enable
 */
Log4JavaScript.prototype.setEnabled = function (enable) {
  'use strict';

  enabled = toBool(enable);
};

/**
 *
 * @returns {Boolean}
 */
Log4JavaScript.prototype.isEnabled = function () {
  'use strict';

  return enabled;
};

Log4JavaScript.prototype.useTimeStampsInMilliseconds = true;

/**
 *
 * @param {Boolean} timeStampsInMilliseconds
 */
Log4JavaScript.prototype.setTimeStampsInMilliseconds = function (timeStampsInMilliseconds) {
  'use strict';

  this.useTimeStampsInMilliseconds = toBool(timeStampsInMilliseconds);
};

/**
 *
 * @returns {Boolean}
 */
Log4JavaScript.prototype.isTimeStampsInMilliseconds = function () {
  'use strict';

  return this.useTimeStampsInMilliseconds;
};

/**
 * This evaluates the given expression in the current scope, thus allowing
 * scripts to access private variables. Particularly useful for testing
 * @param expr
 * @returns {Object}
 */
Log4JavaScript.prototype.evalInScope = function (expr) {
  'use strict';
  /* jshint evil:true */
  return eval(expr);
};

/**
 *
 * @param {Boolean} show
 */
Log4JavaScript.prototype.setShowStackTraces = function (show) {
  'use strict';

  showStackTraces = toBool(show);
};

/**
 *
 * @returns {Logger}
 */
Log4JavaScript.prototype.getRootLogger = function () {
  'use strict';

  return rootLogger;
};

/**
 *
 * @param {String} loggerName
 * @returns {Logger}
 */
Log4JavaScript.prototype.getLogger = function (loggerName) {
  'use strict';

  // Use default logger if loggerName is not specified or invalid
  if (!isString(loggerName)) {
    loggerName = anonymousLoggerName;
    logLog.warn('log4javascript.getLogger: non-string logger name ' +
      toStr(loggerName) + ' supplied, returning anonymous logger');
  }

  // Do not allow retrieval of the root logger by name
  if (loggerName === rootLoggerName) {
    handleError('log4javascript.getLogger: root logger may not be obtained by name');
  }

  // Create the logger for this name if it doesn't already exist
  if (!loggers[loggerName]) {
    var logger = new Logger(loggerName);
    loggers[loggerName] = logger;
    loggerNames.push(loggerName);

    // Set up parent logger, if it doesn't exist
    var lastDotIndex = loggerName.lastIndexOf('.');
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

/**
 *
 * @returns {Logger}
 */
Log4JavaScript.prototype.getDefaultLogger = function () {
  'use strict';

  if (!defaultLogger) {
    defaultLogger = log4javascript.getLogger(defaultLoggerName);
    var a = new log4javascript.PopUpAppender();
    defaultLogger.addAppender(a);
  }
  return defaultLogger;
};

var nullLogger = null;

/**
 *
 * @returns {Logger}
 */
Log4JavaScript.prototype.getNullLogger = function () {
  'use strict';

  if (!nullLogger) {
    nullLogger = new Logger(nullLoggerName);
    nullLogger.setLevel(Level.OFF);
  }
  return nullLogger;
};

/**
 * Destroys all loggers
 */
Log4JavaScript.prototype.resetConfiguration = function () {
  'use strict';

  rootLogger.setLevel(ROOT_LOGGER_DEFAULT_LEVEL);
  loggers = {};
};

/**
 * @todo document
 */
Log4JavaScript.prototype.setDocumentReady = function () {
  'use strict';

  pageLoaded = true;
  log4javascript.dispatchEvent('load', {});
};

/**
 *
 * @type {Level}
 */
Log4JavaScript.prototype.Level = Level;

/**
 *
 * @type {Log4JavaScript}
 */
var log4javascript = new Log4JavaScript();

log4javascript.setEventTypes(['load', 'error']);


/**
 *
 * @type {LoggingEvent}
 */
log4javascript.LoggingEvent = LoggingEvent;

/* ---------------------------------------------------------------------- */
// Main load

if (window.addEventListener) {
  window.addEventListener('load', log4javascript.setDocumentReady, false);
} else if (window.attachEvent) {
  window.attachEvent('onload', log4javascript.setDocumentReady);
} else {
  var oldOnload = window.onload;
  if (typeof window.onload !== 'function') {
    window.onload = log4javascript.setDocumentReady;
  } else {
    window.onload = function (evt) {
      'use strict';

      if (oldOnload) {
        oldOnload(evt);
      }
      log4javascript.setDocumentReady();
    };
  }
}