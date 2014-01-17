/*jshint unused:false */
function getUUID(){
  'use strict';

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

var logLog,
  uniqueId,
  ROOT_LOGGER_DEFAULT_LEVEL,
  enabled = true,
  showStackTraces = false,
  applicationStartDate = new Date(),
  emptyFunction = function () {},
  newLine = '\r\n',
  pageLoaded = false;

// Hashtable of loggers keyed by logger name
var loggers = {};
var loggerNames = [];

/**
 * Helper method to convert an object to Boolean
 * @param {*} obj
 * @returns {boolean}
 */
function toBool(obj) {
  'use strict';

  return Boolean(obj);
}

/**
 *
 * @param {String} message
 * @param {Error} [exception]
 */
function handleError (message, exception) {
  'use strict';

  logLog.error(message, exception);
  log4javascript.dispatchEvent('error', { 'message': message, 'exception': exception });
};

/**
 *
 * @param {Error} ex
 * @returns {string}
 */
function getExceptionMessage(ex) {
  'use strict';
  var message = '';
  if (ex.message) {
    message = ex.message;
  } else if (ex.description) {
    message = ex.description;
  } else {
    message = toStr(ex);
  }
  return message;
}

/**
 * Gets the portion of the URL after the last slash
 * @param {String} url
 * @returns {string}
 */
function getUrlFileName(url) {
  'use strict';

  var lastSlashIndex = Math.max(url.lastIndexOf('/'), url.lastIndexOf('\\'));
  return url.substr(lastSlashIndex + 1);
}

/**
 * Returns a nicely formatted representation of an error
 * @param {Error} ex
 * @returns {String}
 */
function getExceptionStringRep(ex) {
  'use strict';

  if (ex) {
    var exStr = 'Exception: ' + getExceptionMessage(ex);
    try {
      if (ex.lineNumber) {
        exStr += ' on line number ' + ex.lineNumber;
      }
      if (ex.fileName) {
        exStr += ' in file ' + getUrlFileName(ex.fileName);
      }
    } catch (localEx) {
      logLog.warn('Unable to obtain file and line information for error');
    }
    if (showStackTraces && ex.stack) {
      exStr += newLine + 'Stack trace:' + newLine + ex.stack;
    }
    return exStr;
  }
  return null;
}