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