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
}

/**
 *
 * @param {String} str
 * @returns {String}
 */
function urlEncode(str){
  'use strict';

  var retString = '';
  if(isUndefined(window.encodeURIComponent)){
    retString = window.escape(str)
      .replace(/\+/g, '%2B')
      .replace(/"/g, '%22')
      .replace(/'/g, '%27')
      .replace(/\//g, '%2F')
      .replace(/=/g, '%3D');
  } else {
    retString = encodeURIComponent(str);
  }
  return retString;
}

/**
 *
 * @param {String} str
 * @returns {String}
 */
function urlDecode(str){
  'use strict';

  var retString = '';
  if(isUndefined(window.decodeURIComponent)){
    retString = window.unescape(str)
      .replace(/%2B/g, '+')
      .replace(/%22/g, '"')
      .replace(/%27/g, '\'')
      .replace(/%2F/g, '/')
      .replace(/%3D/g, '=');
  } else {
    retString = decodeURIComponent(str);
  }
  return retString;
}

/**
 *
 * @param {String} eventName
 * @returns {String}
 */
function getListenersPropertyName(eventName) {
  'use strict';

  return '__log4javascript_listeners__' + eventName;
}

/**
 *
 * @param {*} param
 * @param {*} defaultValue
 * @returns {String|Boolean}
 */
function extractBooleanFromParam(param, defaultValue) {
  'use strict';

  return isUndefined(param) ? defaultValue : toBool(param);
}

/**
 *
 * @param {*} param
 * @param {*} defaultValue
 * @returns {*|String}
 */
function extractStringFromParam(param, defaultValue) {
  'use strict';

  return isUndefined(param) ? defaultValue : String(param);
}

/**
 *
 * @param {*} param
 * @param {*} defaultValue
 * @returns {*|Boolean}
 */
function extractIntFromParam(param, defaultValue) {
  'use strict';

  if (isUndefined(param)) {
    return defaultValue;
  } else {
    try {
      var value = parseInt(param, 10);
      return isNaN(value) ? defaultValue : value;
    } catch (ex) {
      logLog.warn('Invalid int param ' + param, ex);
      return defaultValue;
    }
  }
}

/**
 *
 * @param {*} param
 * @param {*} defaultValue
 * @returns {*}
 */
function extractFunctionFromParam(param, defaultValue) {
  'use strict';

  return isFunction(param) ? param : defaultValue;
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

/**
 *
 * @param {*} evt
 * @param {Window} win
 * @returns {*}
 */
function getEvent(evt, win) {
  'use strict';

  win = win ? win : window;
  return evt ? evt : win.event;
}

/**
 *
 * @param {HTMLElement} node
 * @param {String} eventName
 * @param {String|Function} listener
 * @param {Boolean} useCapture
 * @param {Window} [win]
 */
/*jshint unused:false */
function addEvent(node, eventName, listener, useCapture, win) {
  'use strict';

  win = win ? win : window;
  if (node.addEventListener) {
    node.addEventListener(eventName, listener, useCapture);
  } else if (node.attachEvent) {
    node.attachEvent('on' + eventName, listener);
  } else {
    var propertyName = getListenersPropertyName(eventName);
    if (!node[propertyName]) {
      node[propertyName] = [];
      // Set event handler
      node['on' + eventName] = function (evt) {
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

/**
 *
 * @param {HTMLElement} node
 * @param {String} eventName
 * @param {String|Function} listener
 * @param {Boolean} useCapture
 */
function removeEvent(node, eventName, listener, useCapture) {
  'use strict';

  if (node.removeEventListener) {
    node.removeEventListener(eventName, listener, useCapture);
  } else if (node.detachEvent) {
    node.detachEvent('on' + eventName, listener);
  } else {
    var propertyName = getListenersPropertyName(eventName);
    if (node[propertyName]) {
      arrayRemove(node[propertyName], listener);
    }
  }
}

/**
 *
 * @param evt
 */
function stopEventPropagation(evt) {
  'use strict';

  if (evt.stopPropagation) {
    evt.stopPropagation();
  } else if (isUndefined(evt.cancelBubble)) {
    evt.cancelBubble = true;
  }
  evt.returnValue = false;
}