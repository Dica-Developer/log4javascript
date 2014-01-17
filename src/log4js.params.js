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
  handleError,
  ROOT_LOGGER_DEFAULT_LEVEL,
  enabled = true,
  useTimeStampsInMilliseconds = true,
  showStackTraces = false,
  applicationStartDate = new Date(),
  emptyFunction = function () {},
  newLine = '\r\n',
  pageLoaded = false;

// Hashtable of loggers keyed by logger name
var loggers = {};
var loggerNames = [];

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