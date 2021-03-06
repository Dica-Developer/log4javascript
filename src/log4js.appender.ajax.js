// AjaxAppender related

var xmlHttpFactories = [
  function () {
    'use strict';

    return new XMLHttpRequest();
  },
  function () {
    'use strict';

    return new ActiveXObject('Msxml2.XMLHTTP');
  },
  function () {
    'use strict';

    return new ActiveXObject('Microsoft.XMLHTTP');
  }
];

var getXmlHttp = function (errorHandler) {
  'use strict';

  // This is only run the first time; the value of getXmlHttp gets
  // replaced with the factory that succeeds on the first run
  var xmlHttp = null, factory;
  for (var i = 0, len = xmlHttpFactories.length; i < len; i++) {
    factory = xmlHttpFactories[i];
    try {
      xmlHttp = factory();
      getXmlHttp = factory;
      break;
    } catch (e) {
    }
  }
  // If we're here, all factories have failed, so throw an error
  if (errorHandler) {
    errorHandler();
  } else {
    handleError('getXmlHttp: unable to obtain XMLHttpRequest object');
  }
  return xmlHttp;
};

function isHttpRequestSuccessful(xmlHttp) {
  'use strict';

  return isUndefined(xmlHttp.status) || xmlHttp.status === 0 ||
    (xmlHttp.status >= 200 && xmlHttp.status < 300) ||
    xmlHttp.status === 1223 /* Fix for IE */;
}

/**
 * AjaxAppender
 * @param {String} url
 * @mixes Appender
 * @constructor
 */
function AjaxAppender(url) {
  'use strict';

  var appender = this;
  var isSupported = true;
  if (!url) {
    handleError('AjaxAppender: URL must be specified in constructor');
    isSupported = false;
  }

  var timed = this.defaults.timed;
  var waitForResponse = this.defaults.waitForResponse;
  var batchSize = this.defaults.batchSize;
  var timerInterval = this.defaults.timerInterval;
  var requestSuccessCallback = this.defaults.requestSuccessCallback;
  var failCallback = this.defaults.failCallback;
  var postVarName = this.defaults.postVarName;
  var sendAllOnUnload = this.defaults.sendAllOnUnload;
  var contentType = this.defaults.contentType;
  var sessionId = null;

  var queuedLoggingEvents = [];
  var queuedRequests = [];
  var headers = [];
  var sending = false;
  var initialized = false;

  /**
   * Configuration methods. The function scope is used to prevent
   * direct alteration to the appender configuration properties.
   * @param {String} configOptionName
   * @returns {boolean}
   */
  function checkCanConfigure(configOptionName) {
    if (initialized) {
      handleError('AjaxAppender: configuration option "' +
        configOptionName +
        '" may not be set after the appender has been initialized');
      return false;
    }
    return true;
  }

  /**
   *
   * @returns {*}
   */
  this.getSessionId = function () {
    return sessionId;
  };
  /**
   *
   *
   * @param sessionIdParam
   */
  this.setSessionId = function (sessionIdParam) {
    sessionId = extractStringFromParam(sessionIdParam, null);
    this.layout.setCustomField('sessionid', sessionId);
  };

  /**
   *
   * @param layoutParam
   */
  this.setLayout = function (layoutParam) {
    if (checkCanConfigure('layout')) {
      this.layout = layoutParam;
      // Set the session id as a custom field on the layout, if not already present
      if (sessionId !== null) {
        this.setSessionId(sessionId);
      }
    }
  };

  /**
   *
   * @returns {boolean}
   */
  this.isTimed = function () {
    return timed;
  };

  /**
   *
   * @param timedParam
   */
  this.setTimed = function (timedParam) {
    if (checkCanConfigure('timed')) {
      timed = toBool(timedParam);
    }
  };

  /**
   *
   * @returns {number}
   */
  this.getTimerInterval = function () {
    return timerInterval;
  };

  /**
   *
   * @param timerIntervalParam
   */
  this.setTimerInterval = function (timerIntervalParam) {
    if (checkCanConfigure('timerInterval')) {
      timerInterval = extractIntFromParam(timerIntervalParam, timerInterval);
    }
  };

  /**
   *
   * @returns {boolean}
   */
  this.isWaitForResponse = function () {
    return waitForResponse;
  };

  /**
   *
   * @param waitForResponseParam
   */
  this.setWaitForResponse = function (waitForResponseParam) {
    if (checkCanConfigure('waitForResponse')) {
      waitForResponse = toBool(waitForResponseParam);
    }
  };

  /**
   *
   * @returns {number}
   */
  this.getBatchSize = function () {
    return batchSize;
  };

  /**
   *
   * @param batchSizeParam
   */
  this.setBatchSize = function (batchSizeParam) {
    if (checkCanConfigure('batchSize')) {
      batchSize = extractIntFromParam(batchSizeParam, batchSize);
    }
  };

  /**
   *
   * @returns {boolean}
   */
  this.isSendAllOnUnload = function () {
    return sendAllOnUnload;
  };

  /**
   *
   * @param sendAllOnUnloadParam
   */
  this.setSendAllOnUnload = function (sendAllOnUnloadParam) {
    if (checkCanConfigure('sendAllOnUnload')) {
      sendAllOnUnload = extractBooleanFromParam(sendAllOnUnloadParam, sendAllOnUnload);
    }
  };

  /**
   *
   * @param requestSuccessCallbackParam
   */
  this.setRequestSuccessCallback = function (requestSuccessCallbackParam) {
    requestSuccessCallback = extractFunctionFromParam(requestSuccessCallbackParam, requestSuccessCallback);
  };

  /**
   *
   * @param failCallbackParam
   */
  this.setFailCallback = function (failCallbackParam) {
    failCallback = extractFunctionFromParam(failCallbackParam, failCallback);
  };

  /**
   *
   * @returns {string}
   */
  this.getPostVarName = function () {
    return postVarName;
  };

  /**
   *
   * @param postVarNameParam
   */
  this.setPostVarName = function (postVarNameParam) {
    if (checkCanConfigure('postVarName')) {
      postVarName = extractStringFromParam(postVarNameParam, postVarName);
    }
  };

  /**
   *
   * @returns {Array}
   */
  this.getHeaders = function () {
    return headers;
  };

  /**
   *
   * @param name
   * @param value
   */
  this.addHeader = function (name, value) {
    if (name.toLowerCase() === 'content-type') {
      contentType = value;
    } else {
      headers.push({ name: name, value: value });
    }
  };

  //Internal Functions
  function sendAll() {
    if (isSupported && enabled) {
      sending = true;
      var currentRequestBatch;
      if (waitForResponse) {
        // Send the first request then use this function as the callback once
        // the response comes back
        if (queuedRequests.length > 0) {
          currentRequestBatch = queuedRequests.shift();
          sendRequest(preparePostData(currentRequestBatch), sendAll);
        } else {
          sending = false;
          if (timed) {
            scheduleSending();
          }
        }
      } else {
        // Rattle off all the requests without waiting to see the response
        while ((currentRequestBatch = queuedRequests.shift())) {
          sendRequest(preparePostData(currentRequestBatch));
        }
        sending = false;
        if (timed) {
          scheduleSending();
        }
      }
    }
  }

  this.sendAll = sendAll;

  /**
   * Called when the window unloads. At this point we're past caring about
   * waiting for responses or timers or incomplete batches - everything
   * must go, now
   * @returns {boolean}
   */
  function sendAllRemaining() {
    var sendingAnything = false;
    if (isSupported && enabled) {
      // Create requests for everything left over, batched as normal
      var actualBatchSize = appender.getLayout().allowBatching() ? batchSize : 1;
      var currentLoggingEvent;
      var batchedLoggingEvents = [];
      while ((currentLoggingEvent = queuedLoggingEvents.shift())) {
        batchedLoggingEvents.push(currentLoggingEvent);
        if (queuedLoggingEvents.length >= actualBatchSize) {
          // Queue this batch of log entries
          queuedRequests.push(batchedLoggingEvents);
          batchedLoggingEvents = [];
        }
      }
      // If there's a partially completed batch, add it
      if (batchedLoggingEvents.length > 0) {
        queuedRequests.push(batchedLoggingEvents);
      }
      sendingAnything = (queuedRequests.length > 0);
      waitForResponse = false;
      timed = false;
      sendAll();
    }
    return sendingAnything;
  }

  /**
   *
   * @type {sendAllRemaining}
   */
  this.sendAllRemaining = sendAllRemaining;

  function preparePostData(batchedLoggingEvents) {
    // Format the logging events
    var formattedMessages = [];
    var currentLoggingEvent;
    var postData = '';
    while ((currentLoggingEvent = batchedLoggingEvents.shift())) {
      var currentFormattedMessage = appender.getLayout().format(currentLoggingEvent);
      if (appender.getLayout().ignoresThrowable()) {
        currentFormattedMessage += currentLoggingEvent.getThrowableStrRep();
      }
      formattedMessages.push(currentFormattedMessage);
    }
    // Create the post data string
    if (batchedLoggingEvents.length === 1) {
      postData = formattedMessages.join('');
    } else {
      postData = appender.getLayout().batchHeader +
        formattedMessages.join(appender.getLayout().batchSeparator) +
        appender.getLayout().batchFooter;
    }
    if (contentType === appender.defaults.contentType) {
      postData = appender.getLayout().returnsPostData ? postData :
        urlEncode(postVarName) + '=' + urlEncode(postData);
      // Add the layout name to the post data
      if (postData.length > 0) {
        postData += '&';
      }
      postData += 'layout=' + urlEncode(appender.getLayout().toString());
    }
    return postData;
  }

  function scheduleSending() {
    window.setTimeout(sendAll, timerInterval);
  }

  function xmlHttpErrorHandler() {
    var msg = 'AjaxAppender: could not create XMLHttpRequest object. AjaxAppender disabled';
    handleError(msg);
    isSupported = false;
    if (failCallback) {
      failCallback(msg);
    }
  }

  function sendRequest(postData, successCallback) {
    try {
      var xmlHttp = getXmlHttp(xmlHttpErrorHandler);
      if (isSupported) {
        if (xmlHttp.overrideMimeType) {
          xmlHttp.overrideMimeType(appender.getLayout().getContentType());
        }
        xmlHttp.onreadystatechange = function () {
          if (xmlHttp.readyState === 4) {
            if (isHttpRequestSuccessful(xmlHttp)) {
              if (requestSuccessCallback) {
                requestSuccessCallback(xmlHttp);
              }
              if (successCallback) {
                successCallback(xmlHttp);
              }
            } else {
              var msg = 'AjaxAppender.append: XMLHttpRequest request to URL ' +
                url + ' returned status code ' + xmlHttp.status;
              handleError(msg);
              if (failCallback) {
                failCallback(msg);
              }
            }
            xmlHttp.onreadystatechange = emptyFunction;
            xmlHttp = null;
          }
        };
        xmlHttp.open('POST', url, true);
        try {
          for (var i = 0, length = headers.length; i < length; i++) {
            var header = headers[i++];
            xmlHttp.setRequestHeader(header.name, header.value);
          }
          xmlHttp.setRequestHeader('Content-Type', contentType);
        } catch (headerEx) {
          var msg = 'AjaxAppender.append: your browser\'s XMLHttpRequest implementation' +
            ' does not support setRequestHeader, therefore cannot post data. AjaxAppender disabled';
          handleError(msg);
          isSupported = false;
          if (failCallback) {
            failCallback(msg);
          }
          return;
        }
        xmlHttp.send(postData);
      }
    } catch (ex) {
      var errMsg = 'AjaxAppender.append: error sending log message to ' + url;
      handleError(errMsg, ex);
      isSupported = false;
      if (failCallback) {
        failCallback(errMsg + '. Details: ' + getExceptionStringRep(ex));
      }
    }
  }

  /**
   *
   * @param loggingEvent
   */
  this.append = function (loggingEvent) {
    if (isSupported) {
      if (!initialized) {
        init();
      }
      queuedLoggingEvents.push(loggingEvent);
      var actualBatchSize = this.getLayout().allowBatching() ? batchSize : 1;

      if (queuedLoggingEvents.length >= actualBatchSize) {
        var currentLoggingEvent;
        var batchedLoggingEvents = [];
        while ((currentLoggingEvent = queuedLoggingEvents.shift())) {
          batchedLoggingEvents.push(currentLoggingEvent);
        }
        // Queue this batch of log entries
        queuedRequests.push(batchedLoggingEvents);

        // If using a timer, the queue of requests will be processed by the
        // timer function, so nothing needs to be done here.
        if (!timed && (!waitForResponse || (waitForResponse && !sending))) {
          sendAll();
        }
      }
    }
  };

  function init() {
    initialized = true;
    // Add unload event to send outstanding messages
    if (sendAllOnUnload) {
      var oldBeforeUnload = window.onbeforeunload;
      window.onbeforeunload = function () {
        if (oldBeforeUnload) {
          oldBeforeUnload();
        }
        if (sendAllRemaining()) {
          return 'Sending log messages';
        }
      };
    }
    // Start timer
    if (timed) {
      scheduleSending();
    }
  }
}

/**
 *
 * @type {Appender}
 */
AjaxAppender.prototype = new Appender();

/**
 *
 * @type {{waitForResponse: boolean, timed: boolean, timerInterval: number, batchSize: number, sendAllOnUnload: boolean, requestSuccessCallback: null, failCallback: null, postVarName: string, contentType: string}}
 */
AjaxAppender.prototype.defaults = {
  waitForResponse: false,
  timed: false,
  timerInterval: 1000,
  batchSize: 1,
  sendAllOnUnload: false,
  requestSuccessCallback: null,
  failCallback: null,
  postVarName: 'data',
  contentType: 'application/x-www-form-urlencoded'
};

/**
 *
 * @type {HttpPostDataLayout}
 */
AjaxAppender.prototype.layout = new HttpPostDataLayout();

/**
 *
 * @returns {string}
 */
AjaxAppender.prototype.toString = function () {
  'use strict';

  return 'AjaxAppender';
};

/**
 *
 * @type {AjaxAppender}
 */
log4javascript.AjaxAppender = AjaxAppender;